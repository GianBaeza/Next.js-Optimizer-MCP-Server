import { Octokit } from '@octokit/rest'
import type { ServerConfig, RateLimitInfo } from '../types/index.js'
import {
    getLogger,
    getCache,
    CacheKeyGenerator,
    getErrorHandler,
    GitHubAPIError,
} from '../utils/index.js'

export interface GitHubFileContent {
    name: string
    path: string
    content: string
    size: number
    sha: string
}

export interface GitHubFileInfo {
    name: string
    path: string
    type: 'file' | 'dir'
    size: number
    sha: string
}

export interface GitHubRepository {
    name: string
    fullName: string
    description: string
    language: string
    stars: number
    forks: number
    isPrivate: boolean
    defaultBranch: string
    topics: string[]
}

/**
 * Servicio optimizado para interactuar con la API de GitHub
 */
export class GitHubService {
    private octokit: Octokit | null = null
    private readonly logger = getLogger()
    private readonly cache = getCache()
    private readonly errorHandler = getErrorHandler()
    private readonly config: NonNullable<ServerConfig['github']>

    constructor(config: ServerConfig['github']) {
        this.config = config || {
            rateLimitRetryCount: 3,
            cacheEnabled: true,
            cacheTtl: 300000,
        }
    }

    /**
     * Configura el token de GitHub
     */
    configure(token: string): void {
        this.octokit = new Octokit({
            auth: token,
            userAgent: 'github-code-mentor-mcp/2.1.0',
            request: {
                timeout: 10000, // 10 segundos timeout
            },
        })

        this.logger.info('GITHUB', 'GitHub service configured successfully')
    }

    /**
     * Verifica si el servicio está configurado
     */
    private ensureConfigured(): void {
        if (!this.octokit) {
            throw new GitHubAPIError(
                'GitHub service not configured. Call configure() first.',
            )
        }
    }

    /**
     * Obtiene información de un repositorio
     */
    async getRepository(
        owner: string,
        repo: string,
    ): Promise<GitHubRepository> {
        this.ensureConfigured()

        const cacheKey = CacheKeyGenerator.repoInfo(owner, repo)

        // Intentar obtener del caché
        if (this.config.cacheEnabled) {
            const cached = this.cache.get<GitHubRepository>(cacheKey)
            if (cached) {
                return cached
            }
        }

        return this.errorHandler.handleWithRetry(
            async () => {
                const startTime = Date.now()

                const response = await this.octokit!.rest.repos.get({
                    owner,
                    repo,
                })

                const duration = Date.now() - startTime
                this.logger.apiCall('GET', `/repos/${owner}/${repo}`, duration)

                const repoData: GitHubRepository = {
                    name: response.data.name,
                    fullName: response.data.full_name,
                    description: response.data.description || '',
                    language: response.data.language || 'Unknown',
                    stars: response.data.stargazers_count,
                    forks: response.data.forks_count,
                    isPrivate: response.data.private,
                    defaultBranch: response.data.default_branch,
                    topics: response.data.topics || [],
                }

                // Guardar en caché
                if (this.config.cacheEnabled) {
                    this.cache.set(cacheKey, repoData, this.config.cacheTtl)
                }

                return repoData
            },
            `getRepository(${owner}/${repo})`,
            this.config.rateLimitRetryCount,
        )
    }

    /**
     * Lista archivos en un directorio del repositorio
     */
    async listFiles(
        owner: string,
        repo: string,
        path: string = '',
        branch: string = 'main',
    ): Promise<GitHubFileInfo[]> {
        this.ensureConfigured()

        const cacheKey = CacheKeyGenerator.fileList(owner, repo, path, branch)

        // Intentar obtener del caché
        if (this.config.cacheEnabled) {
            const cached = this.cache.get<GitHubFileInfo[]>(cacheKey)
            if (cached) {
                return cached
            }
        }

        return this.errorHandler.handleWithRetry(
            async () => {
                const startTime = Date.now()

                const response = await this.octokit!.rest.repos.getContent({
                    owner,
                    repo,
                    path,
                    ref: branch,
                })

                const duration = Date.now() - startTime
                this.logger.apiCall(
                    'GET',
                    `/repos/${owner}/${repo}/contents/${path}`,
                    duration,
                )

                // La respuesta puede ser un archivo único o un array de archivos
                const content = Array.isArray(response.data)
                    ? response.data
                    : [response.data]

                const files: GitHubFileInfo[] = content.map((item) => ({
                    name: item.name,
                    path: item.path,
                    type: item.type as 'file' | 'dir',
                    size: item.size || 0,
                    sha: item.sha,
                }))

                // Guardar en caché
                if (this.config.cacheEnabled) {
                    this.cache.set(cacheKey, files, this.config.cacheTtl)
                }

                return files
            },
            `listFiles(${owner}/${repo}:${path})`,
            this.config.rateLimitRetryCount,
        )
    }

    /**
     * Obtiene el contenido de un archivo
     */
    async getFileContent(
        owner: string,
        repo: string,
        path: string,
        branch: string = 'main',
    ): Promise<GitHubFileContent> {
        this.ensureConfigured()

        const cacheKey = CacheKeyGenerator.fileContent(
            owner,
            repo,
            path,
            branch,
        )

        // Intentar obtener del caché
        if (this.config.cacheEnabled) {
            const cached = this.cache.get<GitHubFileContent>(cacheKey)
            if (cached) {
                return cached
            }
        }

        return this.errorHandler.handleWithRetry(
            async () => {
                const startTime = Date.now()

                const response = await this.octokit!.rest.repos.getContent({
                    owner,
                    repo,
                    path,
                    ref: branch,
                })

                const duration = Date.now() - startTime
                this.logger.apiCall(
                    'GET',
                    `/repos/${owner}/${repo}/contents/${path}`,
                    duration,
                )

                // Verificar que sea un archivo
                if (
                    Array.isArray(response.data) ||
                    response.data.type !== 'file'
                ) {
                    throw new GitHubAPIError(`Path ${path} is not a file`)
                }

                const fileData = response.data

                // Decodificar contenido base64
                const content =
                    fileData.encoding === 'base64'
                        ? Buffer.from(fileData.content, 'base64').toString(
                              'utf-8',
                          )
                        : fileData.content

                const fileContent: GitHubFileContent = {
                    name: fileData.name,
                    path: fileData.path,
                    content,
                    size: fileData.size,
                    sha: fileData.sha,
                }

                // Guardar en caché
                if (this.config.cacheEnabled) {
                    this.cache.set(cacheKey, fileContent, this.config.cacheTtl)
                }

                return fileContent
            },
            `getFileContent(${owner}/${repo}:${path})`,
            this.config.rateLimitRetryCount,
        )
    }

    /**
     * Lista archivos React/Next.js en el repositorio recursivamente
     */
    async listReactFiles(
        owner: string,
        repo: string,
        basePath: string = '',
        branch: string = 'main',
    ): Promise<GitHubFileInfo[]> {
        const reactExtensions = ['.js', '.jsx', '.ts', '.tsx']
        const ignorePaths = ['node_modules', '.next', 'dist', 'build', 'out']

        const allFiles: GitHubFileInfo[] = []

        const scanDirectory = async (path: string): Promise<void> => {
            try {
                const files = await this.listFiles(owner, repo, path, branch)

                for (const file of files) {
                    // Ignorar directorios específicos
                    if (
                        ignorePaths.some((ignored) =>
                            file.path.includes(ignored),
                        )
                    ) {
                        continue
                    }

                    if (file.type === 'dir') {
                        // Recursivamente escanear subdirectorios
                        await scanDirectory(file.path)
                    } else if (file.type === 'file') {
                        // Verificar si es un archivo React/Next.js
                        const hasReactExtension = reactExtensions.some((ext) =>
                            file.name.endsWith(ext),
                        )

                        if (hasReactExtension) {
                            allFiles.push(file)
                        }
                    }
                }
            } catch (error) {
                this.logger.warn(
                    'GITHUB',
                    `Failed to scan directory: ${path}`,
                    { owner, repo, path },
                    error as Error,
                )
                // Continuar con otros directorios
            }
        }

        await scanDirectory(basePath)

        this.logger.info(
            'GITHUB',
            `Found ${allFiles.length} React/Next.js files in ${owner}/${repo}`,
            { count: allFiles.length },
        )

        return allFiles
    }

    /**
     * Obtiene información sobre rate limits
     */
    async getRateLimitInfo(): Promise<RateLimitInfo> {
        this.ensureConfigured()

        const response = await this.octokit!.rest.rateLimit.get()
        const core = response.data.resources.core

        return {
            remaining: core.remaining,
            resetTime: core.reset,
            limit: core.limit,
        }
    }

    /**
     * Verifica si el repositorio existe y es accesible
     */
    async verifyRepository(owner: string, repo: string): Promise<boolean> {
        try {
            await this.getRepository(owner, repo)
            return true
        } catch (error) {
            if (error instanceof GitHubAPIError && error.statusCode === 404) {
                return false
            }
            throw error
        }
    }

    /**
     * Obtiene estadísticas del caché
     */
    getCacheStats() {
        if (!this.config.cacheEnabled) {
            return { enabled: false }
        }

        const stats = this.cache.getStats()
        return {
            enabled: true,
            size: stats.size,
            entries: stats.entries.length,
        }
    }

    /**
     * Limpia el caché
     */
    clearCache(): void {
        if (this.config.cacheEnabled) {
            this.cache.clear()
            this.logger.info('GITHUB', 'Cache cleared')
        }
    }
}

// Instancia global del servicio
let globalGitHubService: GitHubService | null = null

/**
 * Inicializa el servicio de GitHub
 */
export function initializeGitHubService(
    config: ServerConfig['github'],
): GitHubService {
    globalGitHubService = new GitHubService(config)
    return globalGitHubService
}

/**
 * Obtiene la instancia global del servicio de GitHub
 */
export function getGitHubService(): GitHubService {
    if (!globalGitHubService) {
        throw new Error(
            'GitHub service not initialized. Call initializeGitHubService first.',
        )
    }
    return globalGitHubService
}
