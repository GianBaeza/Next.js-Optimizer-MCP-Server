import type { CacheEntry } from '../types/index.js'
import { getLogger } from './logger.js'

/**
 * Sistema de caché en memoria con TTL
 */
export class MemoryCache {
    private cache = new Map<string, CacheEntry>()
    private cleanupInterval: NodeJS.Timeout
    private readonly logger = getLogger()

    constructor(cleanupIntervalMs: number = 60000) {
        // Limpieza automática cada minuto
        this.cleanupInterval = setInterval(() => {
            this.cleanup()
        }, cleanupIntervalMs)
    }

    /**
     * Almacena un valor en el caché
     */
    set<T>(key: string, data: T, ttl: number = 300000): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl,
        }

        this.cache.set(key, entry)
        this.logger.debug('CACHE', `Stored data for key: ${key}`, { ttl })
    }

    /**
     * Obtiene un valor del caché
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key)

        if (!entry) {
            this.logger.cacheMiss(key)
            return null
        }

        // Verificar si ha expirado
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key)
            this.logger.debug('CACHE', `Expired entry removed: ${key}`)
            return null
        }

        this.logger.cacheHit(key)
        return entry.data as T
    }

    /**
     * Verifica si existe una clave en el caché
     */
    has(key: string): boolean {
        return this.get(key) !== null
    }

    /**
     * Elimina una entrada del caché
     */
    delete(key: string): boolean {
        const deleted = this.cache.delete(key)
        if (deleted) {
            this.logger.debug('CACHE', `Deleted entry: ${key}`)
        }
        return deleted
    }

    /**
     * Limpia todas las entradas del caché
     */
    clear(): void {
        const size = this.cache.size
        this.cache.clear()
        this.logger.info('CACHE', `Cleared cache with ${size} entries`)
    }

    /**
     * Obtiene estadísticas del caché
     */
    getStats(): {
        size: number
        entries: Array<{ key: string; age: number; ttl: number }>
    } {
        const entries: Array<{ key: string; age: number; ttl: number }> = []
        const now = Date.now()

        this.cache.forEach((entry, key) => {
            entries.push({
                key,
                age: now - entry.timestamp,
                ttl: entry.ttl,
            })
        })

        return {
            size: this.cache.size,
            entries,
        }
    }

    /**
     * Limpia las entradas expiradas
     */
    private cleanup(): void {
        const now = Date.now()
        const expiredKeys: string[] = []

        this.cache.forEach((entry, key) => {
            if (now - entry.timestamp > entry.ttl) {
                expiredKeys.push(key)
            }
        })

        expiredKeys.forEach((key) => {
            this.cache.delete(key)
        })

        if (expiredKeys.length > 0) {
            this.logger.debug(
                'CACHE',
                `Cleaned up ${expiredKeys.length} expired entries`,
            )
        }
    }

    /**
     * Destruye el caché y limpia los intervalos
     */
    destroy(): void {
        clearInterval(this.cleanupInterval)
        this.clear()
    }
}

/**
 * Generador de claves de caché
 */
export class CacheKeyGenerator {
    /**
     * Genera una clave para contenido de archivo
     */
    static fileContent(
        owner: string,
        repo: string,
        path: string,
        branch: string = 'main',
    ): string {
        return `file:${owner}/${repo}/${branch}:${path}`
    }

    /**
     * Genera una clave para lista de archivos
     */
    static fileList(
        owner: string,
        repo: string,
        path: string = '',
        branch: string = 'main',
    ): string {
        return `files:${owner}/${repo}/${branch}:${path}`
    }

    /**
     * Genera una clave para análisis de archivo
     */
    static fileAnalysis(
        owner: string,
        repo: string,
        path: string,
        branch: string = 'main',
    ): string {
        return `analysis:${owner}/${repo}/${branch}:${path}`
    }

    /**
     * Genera una clave para análisis de repositorio
     */
    static repoAnalysis(
        owner: string,
        repo: string,
        branch: string = 'main',
    ): string {
        return `repo-analysis:${owner}/${repo}/${branch}`
    }

    /**
     * Genera una clave para información de repositorio
     */
    static repoInfo(owner: string, repo: string): string {
        return `repo-info:${owner}/${repo}`
    }
}

// Instancia global del caché
let globalCache: MemoryCache | null = null

/**
 * Inicializa el sistema de caché global
 */
export function initializeCache(cleanupIntervalMs?: number): MemoryCache {
    globalCache = new MemoryCache(cleanupIntervalMs)
    return globalCache
}

/**
 * Obtiene la instancia global del caché
 */
export function getCache(): MemoryCache {
    if (!globalCache) {
        throw new Error('Cache not initialized. Call initializeCache first.')
    }
    return globalCache
}

/**
 * Destruye el caché global
 */
export function destroyCache(): void {
    if (globalCache) {
        globalCache.destroy()
        globalCache = null
    }
}
