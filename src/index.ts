import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { Octokit } from '@octokit/rest'

// Inicializar Octokit
let octokit: Octokit

// Crear el servidor MCP
const server = new Server(
    {
        name: 'github-nextjs-optimizer',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    },
)

// Definir herramientas disponibles
const tools: Tool[] = [
    {
        name: 'configurar_github',
        description:
            'Configura el token de acceso de GitHub para acceder a repositorios',
        inputSchema: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    description: 'Personal Access Token de GitHub',
                },
            },
            required: ['token'],
        },
    },
    {
        name: 'analizar_repositorio',
        description:
            'Analiza un repositorio completo de Next.js/React para detectar problemas de rendimiento y patrones',
        inputSchema: {
            type: 'object',
            properties: {
                owner: {
                    type: 'string',
                    description:
                        'Propietario del repositorio (usuario u organización)',
                },
                repo: {
                    type: 'string',
                    description: 'Nombre del repositorio',
                },
                branch: {
                    type: 'string',
                    description:
                        "Rama a analizar (opcional, por defecto 'main')",
                },
            },
            required: ['owner', 'repo'],
        },
    },
    {
        name: 'analizar_archivo',
        description:
            'Analiza un archivo específico de React/Next.js y proporciona recomendaciones',
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
                    description: 'Ruta del archivo a analizar',
                },
                branch: {
                    type: 'string',
                    description: "Rama (opcional, por defecto 'main')",
                },
            },
            required: ['owner', 'repo', 'path'],
        },
    },
    {
        name: 'listar_archivos_react',
        description: 'Lista todos los archivos React/Next.js en un repositorio',
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
                        'Directorio a explorar (opcional, por defecto raíz)',
                },
            },
            required: ['owner', 'repo'],
        },
    },
]

// Patrones y reglas de análisis
const analysisPatterns = {
    rerenderIssues: [
        {
            pattern: /useState\([^)]*\)(?!.*useMemo|useCallback)/g,
            issue: 'useState sin memoización',
            recommendation:
                'Considera usar useMemo o useCallback para valores derivados y funciones',
            severity: 'medium',
        },
        {
            pattern: /\.map\([^)]*=>\s*<[^>]+onClick={[^}]*=>/g,
            issue: 'Función inline en map',
            recommendation:
                'Evita crear funciones inline dentro de .map(). Usa useCallback o define la función fuera del render',
            severity: 'high',
        },
        {
            pattern: /<[A-Z][^>]*\s+\w+={{[^}]+}}/g,
            issue: 'Objeto inline como prop',
            recommendation:
                'Los objetos inline causan re-renders. Usa useMemo para memoizar objetos',
            severity: 'high',
        },
        {
            pattern: /useEffect\(\s*\(\)\s*=>\s*{[^}]*},\s*\[\]\s*\)/g,
            issue: 'useEffect con array de dependencias vacío',
            recommendation:
                'Verifica si realmente necesitas useEffect. Para lógica de inicialización, considera usar el cuerpo del componente',
            severity: 'low',
        },
    ],
    performanceIssues: [
        {
            pattern: /import\s+.*\s+from\s+['"](?!.*\/.*)['"]/g,
            issue: 'Import de barrel file completo',
            recommendation:
                "Importa componentes específicos para mejor tree-shaking: import { Component } from 'library/Component'",
            severity: 'medium',
        },
        {
            pattern: /React\.memo\([^)]*\)(?!.*arePropsEqual)/g,
            issue: 'React.memo sin comparación personalizada',
            recommendation:
                'Para objetos complejos, considera agregar una función de comparación personalizada',
            severity: 'low',
        },
        {
            pattern: /export\s+default\s+function\s+\w+\([^)]*\)\s*{/g,
            issue: 'Componente sin memoización',
            recommendation:
                'Para componentes que reciben props complejas, considera usar React.memo',
            severity: 'medium',
        },
    ],
    nextjsPatterns: [
        {
            pattern: /import\s+.*Image.*from\s+['"]next\/image['"]/g,
            issue: 'Uso de next/image detectado',
            recommendation:
                '✅ Buena práctica: Usando next/image para optimización automática',
            severity: 'good',
        },
        {
            pattern: /<img\s+/g,
            issue: 'Uso de <img> en lugar de next/image',
            recommendation:
                'Usa next/image de Next.js para optimización automática de imágenes',
            severity: 'high',
        },
        {
            pattern: /export\s+async\s+function\s+getServerSideProps/g,
            issue: 'getServerSideProps detectado',
            recommendation:
                'En Next.js 13+, considera usar Server Components en lugar de getServerSideProps',
            severity: 'medium',
        },
        {
            pattern: /'use client'/g,
            issue: 'Cliente component detectado',
            recommendation:
                "Verifica si realmente necesitas 'use client'. Los Server Components son más eficientes",
            severity: 'low',
        },
        {
            pattern: /export\s+const\s+metadata\s*=/g,
            issue: 'Metadata API detectada',
            recommendation:
                '✅ Buena práctica: Usando Metadata API de Next.js 13+',
            severity: 'good',
        },
    ],
    architecturePatterns: [
        {
            pattern: /(?:pages|app)\/api\//,
            issue: 'API Routes detectadas',
            recommendation: '✅ Usando API Routes de Next.js para backend',
            severity: 'good',
        },
        {
            pattern: /\.module\.(css|scss)/g,
            issue: 'CSS Modules detectados',
            recommendation:
                '✅ Buena práctica: Usando CSS Modules para estilos aislados',
            severity: 'good',
        },
        {
            pattern: /styled-components|@emotion/g,
            issue: 'CSS-in-JS detectado',
            recommendation:
                'CSS-in-JS puede afectar rendimiento. Considera Tailwind CSS o CSS Modules',
            severity: 'medium',
        },
    ],
}

// Handler: Configurar GitHub
function configurarGitHub(token: string) {
    octokit = new Octokit({ auth: token })
    return '✅ Token de GitHub configurado correctamente'
}

// Handler: Listar archivos React/Next.js
async function listarArchivosReact(
    owner: string,
    repo: string,
    path: string = '',
) {
    if (!octokit) {
        throw new Error(
            "Primero debes configurar el token de GitHub usando 'configurar_github'",
        )
    }

    const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
    })

    const reactFiles: string[] = []

    async function processItems(items: any[]) {
        for (const item of items) {
            if (item.type === 'file') {
                if (
                    item.name.match(/\.(tsx|jsx|ts|js)$/) &&
                    !item.name.includes('.test.') &&
                    !item.name.includes('.spec.')
                ) {
                    reactFiles.push(item.path)
                }
            } else if (
                item.type === 'dir' &&
                !item.name.includes('node_modules')
            ) {
                const { data: subItems } = await octokit.repos.getContent({
                    owner,
                    repo,
                    path: item.path,
                })
                if (Array.isArray(subItems)) {
                    await processItems(subItems)
                }
            }
        }
    }

    if (Array.isArray(data)) {
        await processItems(data)
    }

    return reactFiles
}

// Handler: Analizar archivo
async function analizarArchivo(
    owner: string,
    repo: string,
    path: string,
    branch: string = 'main',
) {
    if (!octokit) {
        throw new Error('Primero debes configurar el token de GitHub')
    }

    const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
    })

    if (Array.isArray(data) || data.type !== 'file') {
        throw new Error('La ruta especificada no es un archivo')
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    const issues: any[] = []

    // Analizar con todos los patrones
    Object.entries(analysisPatterns).forEach(([category, patterns]) => {
        patterns.forEach((pattern) => {
            const matches = content.match(pattern.pattern)
            if (matches) {
                issues.push({
                    category,
                    issue: pattern.issue,
                    recommendation: pattern.recommendation,
                    severity: pattern.severity,
                    occurrences: matches.length,
                })
            }
        })
    })

    // Análisis adicional específico
    const additionalChecks = analyzeCodeStructure(content, path)

    return {
        file: path,
        totalIssues: issues.length,
        issues: [...issues, ...additionalChecks],
        summary: generateSummary(issues),
    }
}

// Análisis de estructura de código
function analyzeCodeStructure(content: string, filepath: string) {
    const checks: any[] = []

    // Verificar si es un componente
    const isComponent = /^[A-Z]/.test(filepath.split('/').pop() || '')

    if (isComponent) {
        // Verificar proptypes o TypeScript types
        if (
            !content.includes('interface') &&
            !content.includes('type') &&
            !content.includes('PropTypes')
        ) {
            checks.push({
                category: 'typeChecking',
                issue: 'Sin definición de tipos',
                recommendation:
                    'Define tipos/interfaces para las props del componente para mejor type safety',
                severity: 'medium',
                occurrences: 1,
            })
        }

        // Verificar longitud del componente
        const lines = content.split('\n').length
        if (lines > 300) {
            checks.push({
                category: 'architecture',
                issue: 'Componente muy grande',
                recommendation: `El componente tiene ${lines} líneas. Considera dividirlo en componentes más pequeños`,
                severity: 'high',
                occurrences: 1,
            })
        }

        // Verificar múltiples responsabilidades
        const hasDataFetching =
            content.includes('fetch') || content.includes('axios')
        const hasBusinessLogic =
            content.includes('calculate') || content.includes('process')
        const hasUI = content.includes('return') && content.includes('<')

        if (
            [hasDataFetching, hasBusinessLogic, hasUI].filter(Boolean).length >
            1
        ) {
            checks.push({
                category: 'architecture',
                issue: 'Múltiples responsabilidades',
                recommendation:
                    'Separa data fetching, lógica de negocio y UI en diferentes módulos/hooks',
                severity: 'medium',
                occurrences: 1,
            })
        }
    }

    return checks
}

// Generar resumen
function generateSummary(issues: any[]) {
    const bySeverity = issues.reduce((acc: any, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1
        return acc
    }, {})

    return {
        total: issues.length,
        high: bySeverity.high || 0,
        medium: bySeverity.medium || 0,
        low: bySeverity.low || 0,
        good: bySeverity.good || 0,
    }
}

// Handler: Analizar repositorio completo
async function analizarRepositorio(
    owner: string,
    repo: string,
    branch: string = 'main',
) {
    const files = await listarArchivosReact(owner, repo)
    const results = []

    for (const file of files.slice(0, 20)) {
        // Limitar a 20 archivos por análisis
        try {
            const analysis = await analizarArchivo(owner, repo, file, branch)
            results.push(analysis)
        } catch (error) {
            console.error(`Error analizando ${file}:`, error)
        }
    }

    const totalIssues = results.reduce((sum, r) => sum + r.totalIssues, 0)
    const allIssues = results.flatMap((r) => r.issues)

    return {
        repository: `${owner}/${repo}`,
        filesAnalyzed: results.length,
        totalFiles: files.length,
        totalIssues,
        summary: generateSummary(allIssues),
        topIssues: getTopIssues(allIssues),
        fileResults: results,
    }
}

// Obtener top issues
function getTopIssues(issues: any[]) {
    const issueCount = issues.reduce((acc: any, issue) => {
        const key = issue.issue
        acc[key] = (acc[key] || 0) + issue.occurrences
        return acc
    }, {})

    return Object.entries(issueCount)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 10)
        .map(([issue, count]) => ({ issue, count }))
}

// Configurar handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
        let result: any

        switch (name) {
            case 'configurar_github':
                result = configurarGitHub(args?.token as string)
                break

            case 'listar_archivos_react':
                result = await listarArchivosReact(
                    args?.owner as string,
                    args?.repo as string,
                    args?.path as string,
                )
                break

            case 'analizar_archivo':
                result = await analizarArchivo(
                    args?.owner as string,
                    args?.repo as string,
                    args?.path as string,
                    args?.branch as string,
                )
                break

            case 'analizar_repositorio':
                result = await analizarRepositorio(
                    args?.owner as string,
                    args?.repo as string,
                    args?.branch as string,
                )
                break

            default:
                throw new Error(`Herramienta desconocida: ${name}`)
        }

        return {
            content: [
                {
                    type: 'text',
                    text:
                        typeof result === 'string'
                            ? result
                            : JSON.stringify(result, null, 2),
                },
            ],
        }
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `❌ Error: ${
                        error instanceof Error ? error.message : String(error)
                    }`,
                },
            ],
            isError: true,
        }
    }
})

// Iniciar servidor
async function main() {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error('🚀 GitHub Next.js Optimizer MCP Server iniciado')
}

main().catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
})
