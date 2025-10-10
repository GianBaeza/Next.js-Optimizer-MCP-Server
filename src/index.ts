import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

// Importar configuración y utilidades
import {
    loadConfig,
    validateConfig,
    initializeLogger,
    getLogger,
    initializeCache,
    initializeErrorHandler,
    getErrorHandler,
    ConfigurationError,
} from './utils/index.js'

// Importar servicios
import { initializeGitHubService, getGitHubService } from './services/index.js'

// Importar analizadores
import { initializeCodeAnalyzer } from './analyzers/index.js'

// Importar herramientas
import {
    tools,
    configurarGitHub,
    listarArchivosReact,
    analizarArchivo,
    analizarRepositorio,
    sugerirArquitectura,
    explicarPatron,
    advancedTools,
} from './tools/index.js'

/**
 * Servidor MCP mejorado para análisis de código con Clean Architecture
 */
class MCPServer {
    private server: Server
    private logger: ReturnType<typeof getLogger>
    private errorHandler: ReturnType<typeof getErrorHandler>

    constructor() {
        // Cargar y validar configuración
        const config = loadConfig()
        const configValidation = validateConfig(config)

        if (!configValidation.isValid) {
            throw new ConfigurationError(
                `Invalid configuration: ${configValidation.errors.join(', ')}`,
            )
        }

        // Inicializar sistemas
        this.logger = initializeLogger(config.logging)
        initializeCache()
        this.errorHandler = initializeErrorHandler()
        initializeGitHubService(config.github)
        initializeCodeAnalyzer()

        // Crear servidor MCP
        this.server = new Server(
            {
                name: config.name,
                version: config.version,
            },
            {
                capabilities: {
                    tools: {},
                },
            },
        )

        this.logger.info('SERVER', 'MCP Server initialized', {
            name: config.name,
            version: config.version,
        })

        // 🆕 Auto-configurar GitHub si hay token en environment
        const envToken = process.env.GITHUB_TOKEN
        console.log('GITHUB_TOKEN from env:', envToken ? 'FOUND' : 'NOT FOUND')
        if (envToken) {
            const githubService = getGitHubService()
            githubService.configure(envToken)
            this.logger.info(
                'SERVER',
                'GitHub auto-configured from environment',
            )
        }

        this.setupHandlers()
    }

    /**
     * Configura los handlers del servidor
     */
    private setupHandlers(): void {
        // Handler para listar herramientas
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            this.logger.debug('SERVER', 'Listing available tools', {
                count: [...tools, ...advancedTools].length,
            })
            return { tools: [...tools, ...advancedTools] }
        })

        // Handler para ejecutar herramientas
        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request) => {
                const { name, arguments: args } = request.params
                const startTime = Date.now()

                this.logger.info('SERVER', `Executing tool: ${name}`, { args })

                try {
                    let result: any

                    // Enrutar a la función correspondiente
                    switch (name) {
                        case 'configurar_github':
                            result = await configurarGitHub(args || {})
                            break

                        case 'listar_archivos_react':
                            result = await listarArchivosReact(args || {})
                            break

                        case 'analizar_archivo':
                            result = await analizarArchivo(args || {})
                            break

                        case 'analizar_repositorio':
                            result = await analizarRepositorio(args || {})
                            break

                        case 'sugerir_arquitectura':
                            result = await sugerirArquitectura(args || {})
                            break

                        case 'explicar_patron':
                            result = await explicarPatron(args || {})
                            break

                        default:
                            throw new Error(`Unknown tool: ${name}`)
                    }

                    const duration = Date.now() - startTime
                    this.logger.toolExecution(name, args, duration)

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
                    const duration = Date.now() - startTime
                    this.logger.error(
                        'SERVER',
                        `Tool execution failed: ${name}`,
                        error as Error,
                        {
                            args,
                            duration,
                        },
                    )

                    const errorInfo = this.errorHandler.formatErrorResponse(
                        error as Error,
                    )

                    return {
                        content: [
                            {
                                type: 'text',
                                text: ` Error: ${errorInfo.message}`,
                            },
                        ],
                        isError: true,
                    }
                }
            },
        )
    }

    /**
     * Inicia el servidor
     */
    async start(): Promise<void> {
        try {
            const transport = new StdioServerTransport()
            await this.server.connect(transport)

            this.logger.info('SERVER', 'MCP Server started successfully')
            this.logger.info(
                'SERVER',
                'GitHub Code Mentor MCP Server v2.1 iniciado',
            )
            this.logger.info(
                'SERVER',
                'Guiando en Clean Architecture y mejores prácticas',
            )
            this.logger.info(
                'SERVER',
                ' Esperando conexiones de Claude Desktop...',
            )

            // Log de herramientas disponibles
            const toolNames = [...tools, ...advancedTools].map((t) => t.name)
            this.logger.info('SERVER', 'Available tools', { tools: toolNames })
        } catch (error) {
            this.logger.error(
                'SERVER',
                'Failed to start server',
                error as Error,
            )
            throw error
        }
    }

    /**
     * Detiene el servidor graciosamente
     */
    async stop(): Promise<void> {
        this.logger.info('SERVER', 'Shutting down server...')
        // Aquí podrías agregar limpieza adicional si es necesario
    }
}

// Función principal
async function main() {
    try {
        const server = new MCPServer()
        await server.start()

        // Manejar señales de terminación
        process.on('SIGINT', async () => {
            console.error('\nReceived SIGINT, shutting down gracefully...')
            await server.stop()
            process.exit(0)
        })

        process.on('SIGTERM', async () => {
            console.error('\nReceived SIGTERM, shutting down gracefully...')
            await server.stop()
            process.exit(0)
        })
    } catch (error) {
        console.error(' Fatal error:', error)
        process.exit(1)
    }
}

// Ejecutar si es el módulo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error(' Unhandled error:', error)
        process.exit(1)
    })
}
