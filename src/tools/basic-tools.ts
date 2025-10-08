import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import {
    validateToolArguments,
    sanitizeToolArguments,
    getLogger,
    GitHubAPIError,
    ValidationError,
} from '../utils/index.js'
import { getGitHubService, type GitHubFileInfo } from '../services/index.js'
import { getCodeAnalyzer } from '../analyzers/index.js'
import type { FileAnalysisResult } from '../types/index.js'

/**
 * Herramienta para configurar el token de GitHub
 */
export async function configurarGitHub(
    args: Record<string, any>,
): Promise<string> {
    const logger = getLogger()

    // Validar argumentos
    const validation = validateToolArguments('configurar_github', args)
    if (!validation.isValid) {
        throw new ValidationError(
            `Invalid arguments: ${validation.errors.join(', ')}`,
        )
    }

    const sanitizedArgs = sanitizeToolArguments(args)
    const { token } = sanitizedArgs

    logger.info('TOOL', 'Configuring GitHub token')

    try {
        const githubService = getGitHubService()
        githubService.configure(token)

        // Verificar que el token funciona
        const rateLimitInfo = await githubService.getRateLimitInfo()

        logger.info('TOOL', 'GitHub configured successfully', {
            remaining: rateLimitInfo.remaining,
            limit: rateLimitInfo.limit,
        })

        return `✅ GitHub configurado exitosamente
📊 Rate Limit: ${rateLimitInfo.remaining}/${
            rateLimitInfo.limit
        } requests remaining
⏰ Reset: ${new Date(rateLimitInfo.resetTime * 1000).toLocaleString()}

Ahora puedes usar las demás herramientas para analizar repositorios.`
    } catch (error) {
        logger.error('TOOL', 'Failed to configure GitHub', error as Error)

        if (error instanceof GitHubAPIError) {
            throw new GitHubAPIError(
                'Token de GitHub inválido o sin permisos suficientes. Verifica que el token tenga acceso a los repositorios que quieres analizar.',
                error.statusCode,
            )
        }

        throw error
    }
}

/**
 * Herramienta para listar archivos React/Next.js
 */
export async function listarArchivosReact(
    args: Record<string, any>,
): Promise<any> {
    const logger = getLogger()

    // Validar argumentos
    const validation = validateToolArguments('listar_archivos_react', args)
    if (!validation.isValid) {
        throw new ValidationError(
            `Invalid arguments: ${validation.errors.join(', ')}`,
        )
    }

    const sanitizedArgs = sanitizeToolArguments(args)
    const { owner, repo, path = '' } = sanitizedArgs

    logger.toolExecution('listar_archivos_react', { owner, repo, path })

    try {
        const githubService = getGitHubService()

        // Verificar que el repositorio existe
        const repoInfo = await githubService.getRepository(owner, repo)

        // Listar archivos React/Next.js
        const files = await githubService.listReactFiles(
            owner,
            repo,
            path,
            repoInfo.defaultBranch,
        )

        // Organizar por tipo/directorio
        const organized = files.reduce(
            (acc: Record<string, any[]>, file: GitHubFileInfo) => {
                const dir =
                    file.path.split('/').slice(0, -1).join('/') || 'root'
                if (!acc[dir]) acc[dir] = []
                acc[dir].push({
                    name: file.name,
                    path: file.path,
                    size: file.size,
                })
                return acc
            },
            {},
        )

        const result = {
            repository: `${owner}/${repo}`,
            branch: repoInfo.defaultBranch,
            totalFiles: files.length,
            language: repoInfo.language,
            byDirectory: organized,
            summary: {
                components: files.filter(
                    (f: GitHubFileInfo) =>
                        f.name.includes('Component') ||
                        f.path.includes('/components/'),
                ).length,
                pages: files.filter(
                    (f: GitHubFileInfo) =>
                        f.path.includes('/pages/') || f.path.includes('/app/'),
                ).length,
                hooks: files.filter((f: GitHubFileInfo) =>
                    f.name.startsWith('use'),
                ).length,
                utilities: files.filter(
                    (f: GitHubFileInfo) =>
                        f.path.includes('/utils/') || f.path.includes('/lib/'),
                ).length,
            },
        }

        logger.info('TOOL', `Listed ${files.length} React/Next.js files`, {
            owner,
            repo,
            count: files.length,
        })

        return result
    } catch (error) {
        logger.error('TOOL', 'Failed to list React files', error as Error, {
            owner,
            repo,
        })
        throw error
    }
}

/**
 * Herramienta para analizar un archivo individual
 */
export async function analizarArchivo(args: Record<string, any>): Promise<any> {
    const logger = getLogger()

    // Validar argumentos
    const validation = validateToolArguments('analizar_archivo', args)
    if (!validation.isValid) {
        throw new ValidationError(
            `Invalid arguments: ${validation.errors.join(', ')}`,
        )
    }

    const sanitizedArgs = sanitizeToolArguments(args)
    const { owner, repo, path, branch = 'main' } = sanitizedArgs

    logger.toolExecution('analizar_archivo', { owner, repo, path, branch })

    try {
        const githubService = getGitHubService()
        const codeAnalyzer = getCodeAnalyzer()

        // Obtener contenido del archivo
        const fileContent = await githubService.getFileContent(
            owner,
            repo,
            path,
            branch,
        )

        // Analizar el archivo
        const analysis = await codeAnalyzer.analyzeFile(
            fileContent.path,
            fileContent.content,
            {
                includeGoodPractices: true,
                maxFileSize: 1024 * 1024, // 1MB
            },
        )

        // Formatear resultado
        const result = {
            repository: `${owner}/${repo}`,
            file: fileContent.path,
            size: fileContent.size,
            analysis: {
                totalIssues: analysis.totalIssues,
                scores: {
                    architecture: analysis.architectureScore,
                    cleanCode: analysis.cleanCodeScore,
                    overall: Math.round(
                        (analysis.architectureScore + analysis.cleanCodeScore) /
                            2,
                    ),
                },
                summary: analysis.summary,
                topIssues: analysis.issues
                    .sort((a: any, b: any) => {
                        const severityOrder: Record<string, number> = {
                            critical: 4,
                            high: 3,
                            medium: 2,
                            low: 1,
                            good: -1,
                            info: 0,
                        }
                        return (
                            (severityOrder[b.severity] || 0) -
                            (severityOrder[a.severity] || 0)
                        )
                    })
                    .slice(0, 10),
                suggestions: analysis.suggestions,
            },
            recommendations: generateFileRecommendations(analysis),
        }

        logger.info('TOOL', `Analyzed file ${path}`, {
            issues: analysis.totalIssues,
            architectureScore: analysis.architectureScore,
            cleanCodeScore: analysis.cleanCodeScore,
        })

        return result
    } catch (error) {
        logger.error('TOOL', 'Failed to analyze file', error as Error, {
            owner,
            repo,
            path,
        })
        throw error
    }
}

/**
 * Genera recomendaciones específicas para un archivo
 */
function generateFileRecommendations(analysis: any): string[] {
    const recommendations: string[] = []
    const { issues, architectureScore, cleanCodeScore } = analysis

    // Recomendaciones basadas en score
    if (architectureScore < 50) {
        recommendations.push(
            '🏗️ CRÍTICO: Refactoriza la arquitectura - considera aplicar Clean Architecture',
        )
    } else if (architectureScore < 70) {
        recommendations.push(
            '⚠️ Mejora la separación de responsabilidades y aplica principios SOLID',
        )
    }

    if (cleanCodeScore < 50) {
        recommendations.push(
            '🧹 CRÍTICO: Refactoriza para mejorar legibilidad - nombres descriptivos, funciones pequeñas',
        )
    } else if (cleanCodeScore < 70) {
        recommendations.push(
            '📖 Mejora la calidad del código - elimina números mágicos, reduce complejidad ciclomática',
        )
    }

    // Recomendaciones específicas por tipo de issue
    const criticalIssues = issues.filter((i: any) => i.severity === 'critical')
    if (criticalIssues.length > 0) {
        recommendations.push(
            `🚨 Resuelve ${criticalIssues.length} issue(s) crítico(s) de inmediato`,
        )
    }

    const solidViolations = issues.filter(
        (i: any) => i.category === 'solidPrinciples',
    )
    if (solidViolations.length > 2) {
        recommendations.push(
            '🔧 Aplica principios SOLID - especialmente SRP e DIP',
        )
    }

    const reactIssues = issues.filter(
        (i: any) => i.category === 'reactPatterns',
    )
    if (reactIssues.length > 3) {
        recommendations.push(
            '⚛️ Optimiza componentes React - usa useMemo, useCallback y divide componentes grandes',
        )
    }

    if (recommendations.length === 0) {
        recommendations.push(
            '✅ ¡Excelente! Este archivo sigue buenas prácticas de arquitectura y clean code',
        )
    }

    return recommendations
}

/**
 * Definición de todas las herramientas
 */
export const tools: Tool[] = [
    {
        name: 'configurar_github',
        description:
            'Configura el token de acceso de GitHub para poder analizar repositorios',
        inputSchema: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    description:
                        'Personal Access Token de GitHub (ghp_... o classic token)',
                },
            },
            required: ['token'],
        },
    },
    {
        name: 'analizar_archivo',
        description:
            'Analiza un archivo específico aplicando principios de Clean Architecture, SOLID y patrones de diseño',
        inputSchema: {
            type: 'object',
            properties: {
                owner: {
                    type: 'string',
                    description:
                        'Propietario del repositorio (usuario o organización)',
                },
                repo: {
                    type: 'string',
                    description: 'Nombre del repositorio',
                },
                path: {
                    type: 'string',
                    description:
                        'Ruta del archivo a analizar (ej: src/components/Button.tsx)',
                },
                branch: {
                    type: 'string',
                    description: 'Rama del repositorio (default: main)',
                },
            },
            required: ['owner', 'repo', 'path'],
        },
    },
    {
        name: 'listar_archivos_react',
        description:
            'Lista todos los archivos React/Next.js del repositorio organizados por directorio',
        inputSchema: {
            type: 'object',
            properties: {
                owner: {
                    type: 'string',
                    description: 'Propietario del repositorio',
                },
                repo: {
                    type: 'string',
                    description: 'Nombre del repositorio',
                },
                path: {
                    type: 'string',
                    description:
                        'Directorio base para buscar (opcional, default: raíz)',
                },
            },
            required: ['owner', 'repo'],
        },
    },
]
