import type { ServerConfig } from '../types/index.js'

/**
 * Configuración por defecto del servidor
 */
export const DEFAULT_CONFIG: ServerConfig = {
    name: 'github-code-mentor',
    version: '2.1.0',
    github: {
        rateLimitRetryCount: 3,
        cacheEnabled: true,
        cacheTtl: 300000, // 5 minutos
    },
    analysis: {
        maxConcurrentFiles: 10,
        maxFileSize: 1024 * 1024, // 1MB
        skipPatterns: [
            'node_modules/**',
            '**/*.min.js',
            '**/*.d.ts',
            'dist/**',
            'build/**',
            '.next/**',
        ],
        enabledCategories: [
            'domainLayer',
            'useCaseLayer',
            'infrastructureLayer',
            'solidPrinciples',
            'designPatterns',
            'reactPatterns',
            'testingPatterns',
        ],
    },
    logging: {
        level: 'info',
        enableConsole: true,
        enableFile: false,
    },
}

/**
 * Carga la configuración desde variables de entorno
 */
export function loadConfig(): ServerConfig {
    const config: ServerConfig = { ...DEFAULT_CONFIG }

    // GitHub configuration
    if (process.env.GITHUB_TOKEN) {
        config.github!.token = process.env.GITHUB_TOKEN
    }

    if (process.env.GITHUB_CACHE_ENABLED) {
        config.github!.cacheEnabled =
            process.env.GITHUB_CACHE_ENABLED === 'true'
    }

    if (process.env.GITHUB_CACHE_TTL) {
        config.github!.cacheTtl = parseInt(process.env.GITHUB_CACHE_TTL, 10)
    }

    // Analysis configuration
    if (process.env.MAX_CONCURRENT_FILES) {
        config.analysis!.maxConcurrentFiles = parseInt(
            process.env.MAX_CONCURRENT_FILES,
            10,
        )
    }

    if (process.env.MAX_FILE_SIZE) {
        config.analysis!.maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10)
    }

    // Logging configuration
    if (process.env.LOG_LEVEL) {
        config.logging!.level = process.env.LOG_LEVEL as any
    }

    if (process.env.LOG_FILE_ENABLED) {
        config.logging!.enableFile = process.env.LOG_FILE_ENABLED === 'true'
    }

    if (process.env.LOG_FILE_PATH) {
        config.logging!.filePath = process.env.LOG_FILE_PATH
    }

    return config
}

/**
 * Valida la configuración
 */
export function validateConfig(config: ServerConfig): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    // Validar configuración de GitHub
    if (config.github) {
        if (
            config.github.rateLimitRetryCount < 0 ||
            config.github.rateLimitRetryCount > 10
        ) {
            errors.push(
                'GitHub rate limit retry count must be between 0 and 10',
            )
        }

        if (config.github.cacheTtl < 0) {
            errors.push('GitHub cache TTL must be non-negative')
        }
    }

    // Validar configuración de análisis
    if (config.analysis) {
        if (
            config.analysis.maxConcurrentFiles < 1 ||
            config.analysis.maxConcurrentFiles > 50
        ) {
            errors.push('Max concurrent files must be between 1 and 50')
        }

        if (config.analysis.maxFileSize < 1024) {
            errors.push('Max file size must be at least 1KB')
        }
    }

    // Validar configuración de logging
    if (config.logging) {
        const validLevels = ['debug', 'info', 'warn', 'error']
        if (!validLevels.includes(config.logging.level)) {
            errors.push(`Log level must be one of: ${validLevels.join(', ')}`)
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}
