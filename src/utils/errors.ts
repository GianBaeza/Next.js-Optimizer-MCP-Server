import type { MCPError, RateLimitInfo } from '../types/index.js'
import { getLogger } from './logger.js'

/**
 * Errores específicos del MCP Server
 */

export class MCPServerError extends Error implements MCPError {
    public readonly code: string
    public readonly details?: unknown
    public readonly retryable: boolean

    constructor(
        message: string,
        code: string,
        details?: unknown,
        retryable: boolean = false,
    ) {
        super(message)
        this.name = 'MCPServerError'
        this.code = code
        this.details = details
        this.retryable = retryable
    }
}

export class ValidationError extends MCPServerError {
    constructor(message: string, details?: unknown) {
        super(message, 'VALIDATION_ERROR', details, false)
        this.name = 'ValidationError'
    }
}

export class GitHubAPIError extends MCPServerError {
    public readonly statusCode?: number
    public readonly rateLimitInfo?: RateLimitInfo

    constructor(
        message: string,
        statusCode?: number,
        details?: unknown,
        rateLimitInfo?: RateLimitInfo,
    ) {
        const retryable = statusCode
            ? statusCode >= 500 || statusCode === 429
            : false
        super(message, 'GITHUB_API_ERROR', details, retryable)
        this.name = 'GitHubAPIError'
        this.statusCode = statusCode
        this.rateLimitInfo = rateLimitInfo
    }
}

export class ConfigurationError extends MCPServerError {
    constructor(message: string, details?: unknown) {
        super(message, 'CONFIGURATION_ERROR', details, false)
        this.name = 'ConfigurationError'
    }
}

export class AnalysisError extends MCPServerError {
    public readonly filePath?: string

    constructor(
        message: string,
        filePath?: string,
        details?: unknown,
        retryable: boolean = false,
    ) {
        super(message, 'ANALYSIS_ERROR', details, retryable)
        this.name = 'AnalysisError'
        this.filePath = filePath
    }
}

/**
 * Manejador de errores con retry automático
 */
export class ErrorHandler {
    private readonly logger = getLogger()

    /**
     * Maneja errores con posible retry
     */
    async handleWithRetry<T>(
        operation: () => Promise<T>,
        context: string,
        maxRetries: number = 3,
        retryDelay: number = 1000,
    ): Promise<T> {
        let lastError: Error

        for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                return await operation()
            } catch (error) {
                lastError = error as Error

                this.logger.warn(
                    'ERROR_HANDLER',
                    `Attempt ${attempt} failed for ${context}`,
                    { attempt, maxRetries, error: lastError.message },
                    lastError,
                )

                // Si es el último intento o el error no es retryable, lanzar error
                if (attempt > maxRetries || !this.isRetryable(lastError)) {
                    break
                }

                // Esperar antes del siguiente intento
                if (attempt <= maxRetries) {
                    const delay = this.calculateDelay(retryDelay, attempt)
                    this.logger.debug(
                        'ERROR_HANDLER',
                        `Retrying in ${delay}ms`,
                        { attempt, delay },
                    )
                    await this.sleep(delay)
                }
            }
        }

        // Loggear el error final y lanzarlo
        this.logger.error(
            'ERROR_HANDLER',
            `Operation failed after ${maxRetries + 1} attempts: ${context}`,
            lastError!,
        )
        throw this.wrapError(lastError!, context)
    }

    /**
     * Determina si un error es retryable
     */
    private isRetryable(error: Error): boolean {
        if (error instanceof MCPServerError) {
            return error.retryable
        }

        // Errores de red generalmente son retryables
        if (
            error.message.includes('ECONNRESET') ||
            error.message.includes('ETIMEDOUT') ||
            error.message.includes('ENOTFOUND')
        ) {
            return true
        }

        return false
    }

    /**
     * Calcula el delay para el próximo intento (exponential backoff)
     */
    private calculateDelay(baseDelay: number, attempt: number): number {
        return Math.min(baseDelay * Math.pow(2, attempt - 1), 30000) // Máximo 30 segundos
    }

    /**
     * Wrapper de sleep
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    /**
     * Envuelve errores desconocidos en MCPServerError
     */
    private wrapError(error: Error, context: string): MCPServerError {
        if (error instanceof MCPServerError) {
            return error
        }

        return new MCPServerError(
            `Unexpected error in ${context}: ${error.message}`,
            'UNEXPECTED_ERROR',
            { originalError: error.message, stack: error.stack },
            false,
        )
    }

    /**
     * Maneja errores de la API de GitHub específicamente
     */
    handleGitHubError(error: any, context: string): GitHubAPIError {
        const statusCode = error.status || error.response?.status
        const rateLimitInfo: RateLimitInfo | undefined = error.response?.headers
            ? {
                  remaining: parseInt(
                      error.response.headers['x-ratelimit-remaining'] || '0',
                  ),
                  resetTime: parseInt(
                      error.response.headers['x-ratelimit-reset'] || '0',
                  ),
                  limit: parseInt(
                      error.response.headers['x-ratelimit-limit'] || '0',
                  ),
              }
            : undefined

        let message = `GitHub API error in ${context}`

        if (statusCode === 404) {
            message = `Resource not found: ${context}`
        } else if (statusCode === 403) {
            message = `Access denied or rate limit exceeded: ${context}`
        } else if (statusCode === 401) {
            message = `Authentication failed: ${context}`
        } else if (error.message) {
            message = `${context}: ${error.message}`
        }

        return new GitHubAPIError(message, statusCode, error, rateLimitInfo)
    }

    /**
     * Formatea un error para respuesta del MCP
     */
    formatErrorResponse(error: Error): {
        message: string
        code?: string
        retryable?: boolean
    } {
        if (error instanceof MCPServerError) {
            return {
                message: error.message,
                code: error.code,
                retryable: error.retryable,
            }
        }

        return {
            message: error.message || 'Unknown error occurred',
            code: 'UNKNOWN_ERROR',
            retryable: false,
        }
    }
}

// Instancia global del manejador de errores
let globalErrorHandler: ErrorHandler | null = null

/**
 * Inicializa el manejador de errores global
 */
export function initializeErrorHandler(): ErrorHandler {
    globalErrorHandler = new ErrorHandler()
    return globalErrorHandler
}

/**
 * Obtiene la instancia global del manejador de errores
 */
export function getErrorHandler(): ErrorHandler {
    if (!globalErrorHandler) {
        throw new Error(
            'ErrorHandler not initialized. Call initializeErrorHandler first.',
        )
    }
    return globalErrorHandler
}

/**
 * Decorador para manejo automático de errores
 */
export function withErrorHandling(context: string, maxRetries: number = 3) {
    return function (
        target: any,
        propertyName: string,
        descriptor: PropertyDescriptor,
    ) {
        const method = descriptor.value

        descriptor.value = async function (...args: any[]) {
            const errorHandler = getErrorHandler()
            return errorHandler.handleWithRetry(
                () => method.apply(this, args),
                `${target.constructor.name}.${propertyName}`,
                maxRetries,
            )
        }
    }
}
