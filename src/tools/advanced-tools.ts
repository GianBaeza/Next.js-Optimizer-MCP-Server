import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import {
    validateToolArguments,
    sanitizeToolArguments,
    getLogger,
    GitHubAPIError,
    ValidationError,
} from '../utils/index.js'
import { getGitHubService } from '../services/index.js'
import { getCodeAnalyzer } from '../analyzers/index.js'
import type {
    RepositoryAnalysisResult,
    ArchitectureSuggestion,
} from '../types/index.js'

/**
 * Herramienta para analizar un repositorio completo
 */
export async function analizarRepositorio(
    args: Record<string, any>,
): Promise<RepositoryAnalysisResult> {
    const logger = getLogger()

    // Validar argumentos
    const validation = validateToolArguments('analizar_repositorio', args)
    if (!validation.isValid) {
        throw new ValidationError(
            `Invalid arguments: ${validation.errors.join(', ')}`,
        )
    }

    const sanitizedArgs = sanitizeToolArguments(args)
    const { owner, repo, branch = 'main' } = sanitizedArgs

    logger.toolExecution('analizar_repositorio', { owner, repo, branch })

    try {
        const githubService = getGitHubService()
        const codeAnalyzer = getCodeAnalyzer()

        // Obtener información del repositorio
        const repoInfo = await githubService.getRepository(owner, repo)
        const actualBranch = branch === 'main' ? repoInfo.defaultBranch : branch

        // Listar archivos React/Next.js
        logger.info('REPO_ANALYSIS', 'Listing React/Next.js files', {
            owner,
            repo,
        })
        const files = await githubService.listReactFiles(
            owner,
            repo,
            '',
            actualBranch,
        )

        if (files.length === 0) {
            return {
                repository: `${owner}/${repo}`,
                totalFiles: 0,
                analyzedFiles: 0,
                overallScore: {
                    architecture: 100,
                    cleanCode: 100,
                    overall: 100,
                },
                summary: {
                    total: 0,
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0,
                    good: 0,
                    info: 0,
                },
                topIssues: [],
                recommendations: [
                    '📂 No se encontraron archivos React/Next.js para analizar',
                ],
                files: [],
            }
        }

        // Limitar análisis a archivos más importantes (máximo 20)
        const importantFiles = prioritizeFiles(files).slice(0, 20)

        logger.info(
            'REPO_ANALYSIS',
            `Analyzing ${importantFiles.length} priority files`,
            {
                total: files.length,
                selected: importantFiles.length,
            },
        )

        // Obtener contenido de archivos y analizarlos
        const analysisPromises = importantFiles.map(async (file) => {
            try {
                const content = await githubService.getFileContent(
                    owner,
                    repo,
                    file.path,
                    actualBranch,
                )
                return await codeAnalyzer.analyzeFile(
                    content.path,
                    content.content,
                    {
                        includeGoodPractices: true,
                        maxFileSize: 1024 * 1024, // 1MB
                    },
                )
            } catch (error) {
                logger.warn(
                    'REPO_ANALYSIS',
                    `Failed to analyze file: ${file.path}`,
                    undefined,
                    error as Error,
                )
                return null
            }
        })

        const analysisResults = (await Promise.all(analysisPromises)).filter(
            (result) => result !== null,
        )

        // Consolidar resultados
        const overallScore = calculateOverallScore(analysisResults)
        const consolidatedSummary = consolidateSummary(analysisResults)
        const topIssues = getTopIssues(analysisResults)
        const recommendations = generateRepositoryRecommendations(
            analysisResults,
            files,
            repoInfo,
        )

        const result: RepositoryAnalysisResult = {
            repository: `${owner}/${repo}`,
            totalFiles: files.length,
            analyzedFiles: analysisResults.length,
            overallScore,
            summary: consolidatedSummary,
            topIssues,
            recommendations,
            files: analysisResults,
        }

        logger.info('REPO_ANALYSIS', 'Repository analysis completed', {
            totalFiles: files.length,
            analyzedFiles: analysisResults.length,
            overallScore: overallScore.overall,
            criticalIssues: consolidatedSummary.critical,
            highIssues: consolidatedSummary.high,
        })

        return result
    } catch (error) {
        logger.error(
            'REPO_ANALYSIS',
            'Repository analysis failed',
            error as Error,
            { owner, repo },
        )
        throw error
    }
}

/**
 * Herramienta para sugerir arquitectura de Clean Architecture
 */
export async function sugerirArquitectura(
    args: Record<string, any>,
): Promise<any> {
    const logger = getLogger()

    // Validar argumentos
    const validation = validateToolArguments('sugerir_arquitectura', args)
    if (!validation.isValid) {
        throw new ValidationError(
            `Invalid arguments: ${validation.errors.join(', ')}`,
        )
    }

    const sanitizedArgs = sanitizeToolArguments(args)
    const { owner, repo, projectType = 'web' } = sanitizedArgs

    logger.toolExecution('sugerir_arquitectura', { owner, repo, projectType })

    try {
        const githubService = getGitHubService()

        // Obtener información del repositorio
        const repoInfo = await githubService.getRepository(owner, repo)

        // Analizar estructura actual
        const files = await githubService.listReactFiles(
            owner,
            repo,
            '',
            repoInfo.defaultBranch,
        )
        const currentStructure = analyzeCurrentStructure(files)

        // Generar sugerencias basadas en el tipo de proyecto
        const suggestions = generateArchitectureSuggestions(
            projectType,
            currentStructure,
            repoInfo,
        )

        const result = {
            repository: `${owner}/${repo}`,
            projectType,
            language: repoInfo.language,
            currentStructure,
            suggestions: {
                recommended: suggestions.recommended,
                structure: suggestions.structure,
                implementation: suggestions.implementation,
                benefits: suggestions.benefits,
                migrationSteps: suggestions.migrationSteps,
            },
            examples: suggestions.examples,
        }

        logger.info(
            'ARCHITECTURE_SUGGESTION',
            'Architecture suggestions generated',
            {
                projectType,
                currentFiles: files.length,
                suggestionsCount: suggestions.recommended.length,
            },
        )

        return result
    } catch (error) {
        logger.error(
            'ARCHITECTURE_SUGGESTION',
            'Failed to generate suggestions',
            error as Error,
            { owner, repo },
        )
        throw error
    }
}

/**
 * Herramienta para explicar patrones de diseño
 */
export async function explicarPatron(args: Record<string, any>): Promise<any> {
    const logger = getLogger()

    // Validar argumentos
    const validation = validateToolArguments('explicar_patron', args)
    if (!validation.isValid) {
        throw new ValidationError(
            `Invalid arguments: ${validation.errors.join(', ')}`,
        )
    }

    const sanitizedArgs = sanitizeToolArguments(args)
    const { patron } = sanitizedArgs

    logger.toolExecution('explicar_patron', { patron })

    const patrones: Record<string, any> = {
        repository: {
            name: 'Repository Pattern',
            description:
                'Abstrae la lógica de acceso a datos, proporcionando una interfaz uniforme para acceder a datos sin importar la fuente.',
            problem:
                'Acoplamiento directo entre la lógica de negocio y las fuentes de datos (APIs, bases de datos, etc.)',
            solution:
                'Crear una interfaz que encapsule la lógica de acceso a datos',
            benefits: [
                'Testabilidad mejorada con mocks',
                'Separación de responsabilidades',
                'Flexibilidad para cambiar fuentes de datos',
                'Código más limpio y mantenible',
            ],
            example: `// 1. Definir la interfaz del repositorio
interface IUserRepository {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

// 2. Implementación para API
class ApiUserRepository implements IUserRepository {
  constructor(private httpClient: HttpClient) {}

  async findById(id: string): Promise<User> {
    return this.httpClient.get<User>(\`/users/\${id}\`);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.httpClient.get<User>(\`/users/email/\${email}\`);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async save(user: User): Promise<User> {
    if (user.id) {
      return this.httpClient.put<User>(\`/users/\${user.id}\`, user);
    } else {
      return this.httpClient.post<User>('/users', user);
    }
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(\`/users/\${id}\`);
  }
}

// 3. Implementación para localStorage (testing/offline)
class LocalStorageUserRepository implements IUserRepository {
  private readonly key = 'users';

  async findById(id: string): Promise<User> {
    const users = this.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  async save(user: User): Promise<User> {
    const users = this.getUsers();
    if (user.id) {
      const index = users.findIndex(u => u.id === user.id);
      if (index >= 0) users[index] = user;
    } else {
      user.id = Date.now().toString();
      users.push(user);
    }
    localStorage.setItem(this.key, JSON.stringify(users));
    return user;
  }

  async delete(id: string): Promise<void> {
    const users = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem(this.key, JSON.stringify(users));
  }

  private getUsers(): User[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }
}

// 4. Uso en el caso de uso
class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    // La lógica no cambia independientemente de la implementación
    return this.userRepository.findById(id);
  }
}

// 5. Configuración con DI
const httpClient = new HttpClient();
const userRepository = new ApiUserRepository(httpClient);
const getUserUseCase = new GetUserUseCase(userRepository);

// Para testing
const testRepository = new LocalStorageUserRepository();
const testUseCase = new GetUserUseCase(testRepository);`,
            usage: 'Usa Repository cuando necesites abstraer el acceso a datos y hacer tu código más testeable',
            antipatterns: [
                'Hacer llamadas fetch/axios directamente en componentes',
                'Mezclar lógica de negocio con acceso a datos',
                'Crear repositorios demasiado genéricos',
            ],
        },
        factory: {
            name: 'Factory Pattern',
            description:
                'Crea objetos sin especificar la clase exacta a crear, delegando la decisión a las subclases.',
            problem:
                'Necesidad de crear diferentes tipos de objetos basados en condiciones',
            solution: 'Encapsular la creación de objetos en métodos factory',
            benefits: [
                'Desacoplamiento de la creación',
                'Fácil extensión para nuevos tipos',
                'Código más limpio sin muchos "new"',
                'Centralización de la lógica de creación',
            ],
            example: `// 1. Interfaz común
interface INotification {
  send(message: string): void;
}

// 2. Implementaciones concretas
class EmailNotification implements INotification {
  constructor(private emailService: EmailService) {}

  send(message: string): void {
    this.emailService.sendEmail(message);
  }
}

class SMSNotification implements INotification {
  constructor(private smsService: SMSService) {}

  send(message: string): void {
    this.smsService.sendSMS(message);
  }
}

class PushNotification implements INotification {
  constructor(private pushService: PushService) {}

  send(message: string): void {
    this.pushService.sendPush(message);
  }
}

// 3. Factory
class NotificationFactory {
  static create(
    type: 'email' | 'sms' | 'push',
    services: {
      emailService?: EmailService;
      smsService?: SMSService;
      pushService?: PushService;
    }
  ): INotification {
    switch (type) {
      case 'email':
        if (!services.emailService) throw new Error('EmailService required');
        return new EmailNotification(services.emailService);

      case 'sms':
        if (!services.smsService) throw new Error('SMSService required');
        return new SMSNotification(services.smsService);

      case 'push':
        if (!services.pushService) throw new Error('PushService required');
        return new PushNotification(services.pushService);

      default:
        throw new Error(\`Unknown notification type: \${type}\`);
    }
  }
}

// 4. Uso
const emailService = new EmailService();
const smsService = new SMSService();

// Crear diferentes tipos de notificaciones
const emailNotification = NotificationFactory.create('email', { emailService });
const smsNotification = NotificationFactory.create('sms', { smsService });

emailNotification.send('Hello via email!');
smsNotification.send('Hello via SMS!');

// 5. Factory avanzado con configuración
class ConfigurableNotificationFactory {
  private static config: Record<string, any> = {};

  static configure(config: Record<string, any>): void {
    this.config = config;
  }

  static create(type: string): INotification {
    const config = this.config[type];
    if (!config) throw new Error(\`No configuration for type: \${type}\`);

    switch (type) {
      case 'email':
        return new EmailNotification(new EmailService(config));
      case 'sms':
        return new SMSNotification(new SMSService(config));
      case 'push':
        return new PushNotification(new PushService(config));
      default:
        throw new Error(\`Unknown type: \${type}\`);
    }
  }
}`,
            usage: 'Usa Factory cuando tengas múltiples clases relacionadas y necesites crear instancias basadas en condiciones',
            antipatterns: [
                'Usar Factory para objetos simples',
                'Crear factories demasiado complejos',
                'No usar interfaces comunes',
            ],
        },
        // Puedes agregar más patrones aquí...
    }

    const pattern = patrones[patron.toLowerCase()]

    if (!pattern) {
        const available = Object.keys(patrones).join(', ')
        return {
            error: `Patrón "${patron}" no encontrado`,
            disponibles: available,
            sugerencia: `Los patrones disponibles son: ${available}`,
        }
    }

    logger.info('PATTERN_EXPLANATION', `Explained pattern: ${patron}`)

    return pattern
}

// Funciones auxiliares

function prioritizeFiles(files: any[]): any[] {
    // Priorizar archivos importantes para análisis
    const priorities = [
        { pattern: /\/pages\/|\/app\//, weight: 10 }, // Next.js pages/app
        { pattern: /\/components\/.*\.tsx?$/, weight: 8 }, // Componentes React
        { pattern: /\/hooks\//, weight: 7 }, // Custom hooks
        { pattern: /\/utils\/|\/lib\//, weight: 6 }, // Utilidades
        { pattern: /\/services\//, weight: 6 }, // Servicios
        { pattern: /index\.(ts|tsx|js|jsx)$/, weight: 5 }, // Archivos index
        { pattern: /\.(ts|tsx)$/, weight: 3 }, // TypeScript preferido
        { pattern: /\.(js|jsx)$/, weight: 1 }, // JavaScript
    ]

    return files
        .map((file) => ({
            ...file,
            priority: priorities.reduce((acc, p) => {
                return p.pattern.test(file.path) ? acc + p.weight : acc
            }, 0),
        }))
        .sort((a, b) => b.priority - a.priority)
}

function calculateOverallScore(results: any[]): {
    architecture: number
    cleanCode: number
    overall: number
} {
    if (results.length === 0) {
        return { architecture: 100, cleanCode: 100, overall: 100 }
    }

    const avgArchitecture =
        results.reduce((sum, r) => sum + r.architectureScore, 0) /
        results.length
    const avgCleanCode =
        results.reduce((sum, r) => sum + r.cleanCodeScore, 0) / results.length
    const overall = (avgArchitecture + avgCleanCode) / 2

    return {
        architecture: Math.round(avgArchitecture),
        cleanCode: Math.round(avgCleanCode),
        overall: Math.round(overall),
    }
}

function consolidateSummary(results: any[]): any {
    return results.reduce(
        (acc, result) => {
            acc.total += result.summary.total
            acc.critical += result.summary.critical
            acc.high += result.summary.high
            acc.medium += result.summary.medium
            acc.low += result.summary.low
            acc.good += result.summary.good
            acc.info += result.summary.info || 0
            return acc
        },
        { total: 0, critical: 0, high: 0, medium: 0, low: 0, good: 0, info: 0 },
    )
}

function getTopIssues(results: any[]): any[] {
    const allIssues = results.flatMap((r) => r.issues)
    const issueMap = new Map()

    // Consolidar issues similares
    allIssues.forEach((issue) => {
        const key = `${issue.issue}|${issue.severity}`
        if (issueMap.has(key)) {
            issueMap.get(key).count += issue.occurrences
        } else {
            issueMap.set(key, {
                issue: issue.issue,
                severity: issue.severity,
                count: issue.occurrences,
                recommendation: issue.recommendation,
                designPattern: issue.designPattern,
            })
        }
    })

    return Array.from(issueMap.values())
        .sort((a, b) => {
            const severityOrder: Record<string, number> = {
                critical: 4,
                high: 3,
                medium: 2,
                low: 1,
                good: -1,
                info: 0,
            }
            if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                return severityOrder[b.severity] - severityOrder[a.severity]
            }
            return b.count - a.count
        })
        .slice(0, 15)
}

function analyzeCurrentStructure(files: any[]): any {
    const structure = {
        hasCleanArchitecture: false,
        hasComponents: false,
        hasPages: false,
        hasUtils: false,
        hasServices: false,
        hasHooks: false,
        directories: new Set<string>(),
    }

    files.forEach((file) => {
        const path = file.path.toLowerCase()
        const dir = path.split('/').slice(0, -1).join('/')
        structure.directories.add(dir)

        if (path.includes('/components/')) structure.hasComponents = true
        if (path.includes('/pages/') || path.includes('/app/'))
            structure.hasPages = true
        if (path.includes('/utils/') || path.includes('/lib/'))
            structure.hasUtils = true
        if (path.includes('/services/')) structure.hasServices = true
        if (path.includes('/hooks/')) structure.hasHooks = true
        if (
            path.includes('/domain/') ||
            path.includes('/usecases/') ||
            path.includes('/infrastructure/')
        ) {
            structure.hasCleanArchitecture = true
        }
    })

    return {
        ...structure,
        directories: Array.from(structure.directories),
    }
}

function generateArchitectureSuggestions(
    projectType: string,
    currentStructure: any,
    repoInfo: any,
): any {
    const suggestions = {
        recommended: [] as string[],
        structure: {} as any,
        implementation: [] as string[],
        benefits: [] as string[],
        migrationSteps: [] as string[],
        examples: {} as any,
    }

    // Sugerencias basadas en el tipo de proyecto
    if (projectType === 'web' || projectType === 'fullstack') {
        suggestions.recommended.push(
            'Clean Architecture con separación de capas',
        )
        suggestions.recommended.push('Patrón Repository para APIs')
        suggestions.recommended.push('Custom Hooks para lógica de UI')

        suggestions.structure = {
            'src/': {
                'domain/': {
                    'entities/': 'Modelos de negocio puros',
                    'repositories/': 'Interfaces de acceso a datos',
                    'value-objects/': 'Objetos de valor inmutables',
                },
                'application/': {
                    'use-cases/': 'Casos de uso de la aplicación',
                    'ports/': 'Interfaces para servicios externos',
                },
                'infrastructure/': {
                    'repositories/': 'Implementaciones de repositorios',
                    'services/': 'Servicios externos (APIs, etc.)',
                    'http/': 'Cliente HTTP configurado',
                },
                'presentation/': {
                    'components/': 'Componentes React reutilizables',
                    'pages/': 'Páginas de Next.js',
                    'hooks/': 'Custom hooks para casos de uso',
                },
            },
        }
    }

    return suggestions
}

function generateRepositoryRecommendations(
    results: any[],
    allFiles: any[],
    repoInfo: any,
): string[] {
    const recommendations: string[] = []
    const totalIssues = results.reduce((sum, r) => sum + r.totalIssues, 0)
    const criticalIssues = results.reduce(
        (sum, r) => sum + r.summary.critical,
        0,
    )
    const highIssues = results.reduce((sum, r) => sum + r.summary.high, 0)

    if (criticalIssues > 0) {
        recommendations.push(
            `🚨 URGENTE: Resolver ${criticalIssues} issue(s) crítico(s) que afectan la arquitectura`,
        )
    }

    if (highIssues > 10) {
        recommendations.push(
            `⚠️ ALTA PRIORIDAD: Refactorizar ${highIssues} issues de alta severidad`,
        )
    }

    if (
        allFiles.length > 50 &&
        !results.some((r) => r.file.includes('/domain/'))
    ) {
        recommendations.push(
            '🏗️ Implementar Clean Architecture con separación de capas',
        )
    }

    if (
        results.some((r) =>
            r.issues.some((i: any) => i.issue.includes('HTTP directa')),
        )
    ) {
        recommendations.push(
            '📦 Implementar patrón Repository para abstraer llamadas HTTP',
        )
    }

    if (recommendations.length === 0) {
        recommendations.push(
            '✅ ¡Excelente! El repositorio sigue buenas prácticas de arquitectura',
        )
    }

    return recommendations
}

export const advancedTools: Tool[] = [
    {
        name: 'analizar_repositorio',
        description:
            'Analiza la arquitectura completa del repositorio con recomendaciones de Clean Architecture y principios SOLID',
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
                branch: {
                    type: 'string',
                    description:
                        'Rama a analizar (default: rama principal del repo)',
                },
            },
            required: ['owner', 'repo'],
        },
    },
    {
        name: 'sugerir_arquitectura',
        description:
            'Sugiere una estructura de Clean Architecture personalizada para el proyecto basada en su tipo y tecnologías',
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
                projectType: {
                    type: 'string',
                    description:
                        'Tipo de proyecto: web, api, mobile, fullstack, library',
                    enum: ['web', 'api', 'mobile', 'fullstack', 'library'],
                },
            },
            required: ['owner', 'repo'],
        },
    },
    {
        name: 'explicar_patron',
        description:
            'Explica un patrón de diseño con ejemplos prácticos en React/Next.js y casos de uso reales',
        inputSchema: {
            type: 'object',
            properties: {
                patron: {
                    type: 'string',
                    description:
                        'Nombre del patrón: repository, factory, observer, strategy, singleton, builder, adapter, decorator, facade, etc.',
                },
            },
            required: ['patron'],
        },
    },
]
