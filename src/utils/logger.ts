import fs from 'fs'
import path from 'path'
import type { ServerConfig } from '../types/index.js'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
    timestamp: string
    level: LogLevel
    component: string
    message: string
    data?: unknown
    error?: Error
}

/**
 * Sistema de logging centralizado
 */
export class Logger {
    private config: NonNullable<ServerConfig['logging']>
    private logFile?: string

    constructor(config?: ServerConfig['logging']) {
        this.config = config || {
            level: 'info',
            enableConsole: true,
            enableFile: false,
        }

        if (this.config.enableFile && this.config.filePath) {
            this.logFile = this.config.filePath
            this.ensureLogDirectory()
        }
    }

    private ensureLogDirectory(): void {
        if (!this.logFile) return

        const logDir = path.dirname(this.logFile)
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true })
        }
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: Record<LogLevel, number> = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        }

        return levels[level] >= levels[this.config.level]
    }

    private formatMessage(entry: LogEntry): string {
        const timestamp = entry.timestamp
        const level = entry.level.toUpperCase().padEnd(5)
        const component = entry.component.padEnd(15)

        let message = `[${timestamp}] ${level} [${component}] ${entry.message}`

        if (entry.data) {
            message += ` | Data: ${JSON.stringify(entry.data)}`
        }

        if (entry.error) {
            message += ` | Error: ${entry.error.message}`
            if (entry.error.stack) {
                message += `\nStack: ${entry.error.stack}`
            }
        }

        return message
    }

    private log(
        level: LogLevel,
        component: string,
        message: string,
        data?: unknown,
        error?: Error,
    ): void {
        if (!this.shouldLog(level)) return

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            data,
            error,
        }

        const formattedMessage = this.formatMessage(entry)

        // Log a consola
        if (this.config.enableConsole) {
            switch (level) {
                case 'debug':
                    console.debug(formattedMessage)
                    break
                case 'info':
                    console.info(formattedMessage)
                    break
                case 'warn':
                    console.warn(formattedMessage)
                    break
                case 'error':
                    console.error(formattedMessage)
                    break
            }
        }

        // Log a archivo
        if (this.config.enableFile && this.logFile) {
            try {
                fs.appendFileSync(this.logFile, formattedMessage + '\n')
            } catch (err) {
                console.error('Failed to write to log file:', err)
            }
        }
    }

    debug(component: string, message: string, data?: unknown): void {
        this.log('debug', component, message, data)
    }

    info(component: string, message: string, data?: unknown): void {
        this.log('info', component, message, data)
    }

    warn(
        component: string,
        message: string,
        data?: unknown,
        error?: Error,
    ): void {
        this.log('warn', component, message, data, error)
    }

    error(
        component: string,
        message: string,
        error?: Error,
        data?: unknown,
    ): void {
        this.log('error', component, message, data, error)
    }

    // Métodos de conveniencia
    apiCall(method: string, endpoint: string, duration?: number): void {
        this.info('API', `${method} ${endpoint}`, { duration })
    }

    toolExecution(toolName: string, args: unknown, duration?: number): void {
        this.info('TOOL', `Executed ${toolName}`, { args, duration })
    }

    rateLimitHit(remaining: number, resetTime: number): void {
        this.warn(
            'RATE_LIMIT',
            `Rate limit hit, ${remaining} remaining, resets at ${new Date(
                resetTime * 1000,
            ).toISOString()}`,
        )
    }

    cacheHit(key: string): void {
        this.debug('CACHE', `Cache hit for key: ${key}`)
    }

    cacheMiss(key: string): void {
        this.debug('CACHE', `Cache miss for key: ${key}`)
    }
}

// Instancia global del logger
let globalLogger: Logger | null = null

export function initializeLogger(config: ServerConfig['logging']): Logger {
    globalLogger = new Logger(config)
    return globalLogger
}

export function getLogger(): Logger {
    if (!globalLogger) {
        throw new Error('Logger not initialized. Call initializeLogger first.')
    }
    return globalLogger
}
