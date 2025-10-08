/**
 * Tipos de configuración del servidor
 */

export interface ServerConfig {
    name: string
    version: string
    github?: {
        token?: string
        rateLimitRetryCount: number
        cacheEnabled: boolean
        cacheTtl: number
    }
    analysis?: {
        maxConcurrentFiles: number
        maxFileSize: number
        skipPatterns: string[]
        enabledCategories: string[]
    }
    logging?: {
        level: 'debug' | 'info' | 'warn' | 'error'
        enableConsole: boolean
        enableFile: boolean
        filePath?: string
    }
}

export interface MCPError extends Error {
    code?: string
    details?: unknown
    retryable?: boolean
}

export interface ValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
}

export interface CacheEntry<T = any> {
    data: T
    timestamp: number
    ttl: number
}

export interface RateLimitInfo {
    remaining: number
    resetTime: number
    limit: number
}
