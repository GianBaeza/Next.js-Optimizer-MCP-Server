import type {
    AnalysisIssue,
    FileAnalysisResult,
    Summary,
    ArchitectureSuggestion,
    AnalysisOptions,
    PatternCategory,
} from '../types/index.js'
import {
    solidPrinciples,
    domainLayer,
    useCaseLayer,
    infrastructureLayer,
    presentationLayer,
    reactPatterns,
    nextjsPatterns,
    performancePatterns,
    designPatterns,
    antiPatterns,
} from '../patterns/index.js'
import { getLogger } from '../utils/index.js'

/**
 * Analizador de código mejorado con patrones modulares
 */
export class CodeAnalyzer {
    private readonly logger = getLogger()
    private readonly patterns: PatternCategory

    constructor() {
        // Combinar todos los patrones
        this.patterns = {
            solidPrinciples,
            domainLayer,
            useCaseLayer,
            infrastructureLayer,
            presentationLayer,
            reactPatterns,
            nextjsPatterns,
            performancePatterns,
            designPatterns,
            antiPatterns,
        }
    }

    /**
     * Analiza un archivo individual
     */
    async analyzeFile(
        filepath: string,
        content: string,
        options: AnalysisOptions = {},
    ): Promise<FileAnalysisResult> {
        const startTime = Date.now()
        this.logger.debug('ANALYZER', `Analyzing file: ${filepath}`)

        // Verificar tamaño del archivo
        if (options.maxFileSize && content.length > options.maxFileSize) {
            this.logger.warn('ANALYZER', `File too large: ${filepath}`, {
                size: content.length,
                maxSize: options.maxFileSize,
            })

            return {
                file: filepath,
                totalIssues: 0,
                issues: [
                    {
                        category: 'fileSize',
                        issue: 'Archivo demasiado grande para analizar',
                        recommendation:
                            'Considera dividir este archivo en módulos más pequeños',
                        severity: 'medium',
                        occurrences: 1,
                    },
                ],
                summary: {
                    total: 1,
                    critical: 0,
                    high: 0,
                    medium: 1,
                    low: 0,
                    good: 0,
                    info: 0,
                },
                architectureScore: 50,
                cleanCodeScore: 50,
                suggestions: [],
            }
        }

        // Detectar capa de arquitectura
        const architectureLayer = this.detectArchitectureLayer(filepath)

        // Analizar patrones
        const issues = this.analyzePatterns(
            content,
            filepath,
            architectureLayer,
            options,
        )

        // Generar métricas
        const summary = this.generateSummary(issues)
        const scores = this.calculateScores(issues)
        const suggestions = this.generateSuggestions(issues, filepath)

        const duration = Date.now() - startTime
        this.logger.debug('ANALYZER', `Analysis completed for ${filepath}`, {
            duration,
            issuesFound: issues.length,
            architectureScore: scores.architecture,
            cleanCodeScore: scores.cleanCode,
        })

        return {
            file: filepath,
            totalIssues: issues.length,
            issues,
            summary,
            architectureScore: scores.architecture,
            cleanCodeScore: scores.cleanCode,
            suggestions,
        }
    }

    /**
     * Analiza múltiples archivos
     */
    async analyzeFiles(
        files: Array<{ path: string; content: string }>,
        options: AnalysisOptions = {},
    ): Promise<FileAnalysisResult[]> {
        this.logger.info('ANALYZER', `Analyzing ${files.length} files`)

        const results: FileAnalysisResult[] = []
        const maxConcurrent = 5 // Procesar máximo 5 archivos concurrentemente

        // Procesar archivos en lotes
        for (let i = 0; i < files.length; i += maxConcurrent) {
            const batch = files.slice(i, i + maxConcurrent)

            const batchPromises = batch.map((file) =>
                this.analyzeFile(file.path, file.content, options),
            )

            const batchResults = await Promise.allSettled(batchPromises)

            for (const result of batchResults) {
                if (result.status === 'fulfilled') {
                    results.push(result.value)
                } else {
                    this.logger.error(
                        'ANALYZER',
                        'Failed to analyze file',
                        result.reason,
                    )
                }
            }
        }

        return results
    }

    /**
     * Detecta la capa de arquitectura basada en la ruta del archivo
     */
    private detectArchitectureLayer(filepath: string): string {
        const path = filepath.toLowerCase()

        if (
            path.includes('/domain/') ||
            path.includes('/entities/') ||
            path.includes('/models/')
        ) {
            return 'Domain Layer'
        }

        if (
            path.includes('/usecases/') ||
            path.includes('/application/') ||
            path.includes('/use-cases/')
        ) {
            return 'Application Layer'
        }

        if (
            path.includes('/infrastructure/') ||
            path.includes('/repositories/') ||
            path.includes('/adapters/')
        ) {
            return 'Infrastructure Layer'
        }

        if (
            path.includes('/presentation/') ||
            path.includes('/components/') ||
            path.includes('/pages/') ||
            path.includes('/views/')
        ) {
            return 'Presentation Layer'
        }

        // Detectar por extensión y contenido
        if (path.endsWith('.tsx') || path.endsWith('.jsx')) {
            return 'Presentation Layer'
        }

        return 'Unknown Layer'
    }

    /**
     * Analiza patrones en el contenido del archivo
     */
    private analyzePatterns(
        content: string,
        filepath: string,
        architectureLayer: string,
        options: AnalysisOptions,
    ): AnalysisIssue[] {
        const issues: AnalysisIssue[] = []
        const enabledCategories =
            options.enabledCategories || Object.keys(this.patterns)

        // Analizar cada categoría de patrones
        for (const [categoryName, patterns] of Object.entries(this.patterns)) {
            if (!enabledCategories.includes(categoryName)) {
                continue
            }

            for (const pattern of patterns) {
                try {
                    const matches = content.match(pattern.pattern)

                    if (matches && matches.length > 0) {
                        // Skip good practices si no se especifica incluirlas
                        if (
                            pattern.severity === 'good' &&
                            !options.includeGoodPractices
                        ) {
                            continue
                        }

                        issues.push({
                            category: categoryName,
                            issue: pattern.issue,
                            recommendation: pattern.recommendation,
                            severity: pattern.severity,
                            occurrences: matches.length,
                            explanation: pattern.explanation,
                            designPattern: pattern.designPattern,
                            architectureLayer:
                                pattern.architectureLayer || architectureLayer,
                            codeExample: pattern.codeExample,
                            resources: pattern.resources,
                        })
                    }
                } catch (error) {
                    this.logger.warn('ANALYZER', `Pattern analysis failed`, {
                        categoryName,
                        pattern: pattern.issue,
                        error: (error as Error).message,
                    })
                }
            }
        }

        // Análisis adicional de Clean Code
        issues.push(...this.analyzeCleanCode(content, filepath))

        return issues
    }

    /**
     * Análisis específico de Clean Code
     */
    private analyzeCleanCode(
        content: string,
        filepath: string,
    ): AnalysisIssue[] {
        const issues: AnalysisIssue[] = []

        // Nombres de variables de una letra
        const shortVarNames = content.match(/\b[a-z]\b(?!\s*[=>:|,)\]])/g)
        if (shortVarNames && shortVarNames.length > 5) {
            issues.push({
                category: 'cleanCode',
                issue: 'Variables con nombres de una letra',
                recommendation:
                    'Usa nombres descriptivos que revelen intención',
                severity: 'medium',
                occurrences: shortVarNames.length,
                explanation:
                    'Clean Code: El código se lee más que se escribe. Los nombres deben revelar la intención.',
                codeExample: `//  Mal
const u = getUser();
const d = new Date();
const x = calculateTotal();

//  Bien
const currentUser = getUser();
const createdAt = new Date();
const totalAmount = calculateTotal();`,
            })
        }

        // Funciones muy largas
        const functionPattern =
            /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|(?:async\s+)?function\s*\([^)]*\))\s*{[^}]*}/gs
        const functions = content.match(functionPattern) || []

        functions.forEach((func) => {
            const lines = func.split('\n').length
            if (lines > 25) {
                issues.push({
                    category: 'cleanCode',
                    issue: `Función con ${lines} líneas`,
                    recommendation:
                        'Las funciones deben hacer una sola cosa. Divide en funciones más pequeñas',
                    severity: lines > 50 ? 'high' : 'medium',
                    occurrences: 1,
                    explanation:
                        'Una función debe caber en una pantalla y hacer una sola cosa bien.',
                    codeExample: `//  Mal - Función larga
function processUserData(userData) {
  // 50+ líneas de lógica compleja
  // validación
  // transformación
  // persistencia
  // notificación
  // logging
}

//  Bien - Funciones específicas
function validateUserData(userData) { /* ... */ }
function transformUserData(userData) { /* ... */ }
function saveUserData(userData) { /* ... */ }
function notifyUserCreated(user) { /* ... */ }

function processUserData(userData) {
  const validData = validateUserData(userData);
  const transformedData = transformUserData(validData);
  const savedUser = saveUserData(transformedData);
  notifyUserCreated(savedUser);
  return savedUser;
}`,
                })
            }
        })

        // Comentarios excesivos
        const commentLines = (content.match(/\/\/.+|\/\*[\s\S]*?\*\//g) || [])
            .length
        const codeLines = content
            .split('\n')
            .filter(
                (line) => line.trim() && !line.trim().startsWith('//'),
            ).length

        if (commentLines > codeLines * 0.3 && commentLines > 10) {
            issues.push({
                category: 'cleanCode',
                issue: 'Demasiados comentarios',
                recommendation:
                    'El código debe ser auto-explicativo. Refactoriza en lugar de comentar',
                severity: 'low',
                occurrences: commentLines,
                explanation:
                    'Clean Code: Los comentarios son una forma de fracaso. El código debe explicarse por sí mismo.',
                codeExample: `//  Mal - Comentarios excesivos
// Obtener el usuario desde la base de datos
const user = await getUserFromDatabase(id);
// Verificar si el usuario existe
if (!user) {
  // Lanzar error si no existe
  throw new Error('User not found');
}
// Retornar los datos del usuario
return user;

//  Bien - Código auto-explicativo
const user = await findUserById(id);
if (!user) {
  throw new UserNotFoundError(id);
}
return user;`,
            })
        }

        // Números mágicos
        const magicNumbers = content.match(/\b\d{2,}\b(?![.]\d)/g)?.filter(
            (num) => !['100', '200', '300', '400', '404', '500'].includes(num), // Códigos HTTP comunes
        )

        if (magicNumbers && magicNumbers.length > 3) {
            issues.push({
                category: 'cleanCode',
                issue: 'Números mágicos detectados',
                recommendation: 'Usa constantes con nombres descriptivos',
                severity: 'medium',
                occurrences: magicNumbers.length,
                codeExample: `//  Mal
if (age > 18) { }
setTimeout(callback, 3600000);
const tax = amount * 0.21;

//  Bien
const LEGAL_AGE = 18;
const ONE_HOUR_MS = 60 * 60 * 1000;
const VAT_RATE = 0.21;

if (age > LEGAL_AGE) { }
setTimeout(callback, ONE_HOUR_MS);
const tax = amount * VAT_RATE;`,
            })
        }

        return issues
    }

    /**
     * Genera resumen de issues
     */
    private generateSummary(issues: AnalysisIssue[]): Summary {
        const summary: Summary = {
            total: issues.length,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            good: 0,
            info: 0,
        }

        issues.forEach((issue) => {
            summary[issue.severity]++
        })

        return summary
    }

    /**
     * Calcula puntuaciones de arquitectura y clean code
     */
    private calculateScores(issues: AnalysisIssue[]): {
        architecture: number
        cleanCode: number
    } {
        if (issues.length === 0) {
            return { architecture: 100, cleanCode: 100 }
        }

        const severityWeights = {
            critical: 25,
            high: 15,
            medium: 8,
            low: 3,
            good: -5, // Las buenas prácticas suman puntos
            info: 0,
        }

        const totalPenalty = issues.reduce((penalty, issue) => {
            return penalty + severityWeights[issue.severity] * issue.occurrences
        }, 0)

        const baseScore = 100
        const architectureScore = Math.max(
            0,
            Math.min(100, baseScore - totalPenalty),
        )
        const cleanCodeScore = Math.max(
            0,
            Math.min(100, baseScore - totalPenalty * 0.8),
        )

        return {
            architecture: Math.round(architectureScore),
            cleanCode: Math.round(cleanCodeScore),
        }
    }

    /**
     * Genera sugerencias de arquitectura basadas en los issues encontrados
     */
    private generateSuggestions(
        issues: AnalysisIssue[],
        filepath: string,
    ): ArchitectureSuggestion[] {
        const suggestions: ArchitectureSuggestion[] = []

        // Sugerir separación de responsabilidades si hay violaciones SRP
        const srpViolations = issues.filter(
            (i) =>
                i.issue.includes('SRP') ||
                i.issue.includes('múltiples responsabilidades'),
        )

        if (srpViolations.length > 0) {
            suggestions.push({
                title: 'Aplicar Single Responsibility Principle',
                description:
                    'Separa las responsabilidades de esta clase/función en componentes más específicos',
                pattern: 'Single Responsibility Principle',
                benefit:
                    'Código más mantenible, testeable y con menor acoplamiento',
                implementation:
                    '1. Identifica las diferentes responsabilidades\n2. Crea clases/funciones específicas para cada una\n3. Usa composición para combinar funcionalidades',
                example: `// Separar responsabilidades
class UserValidator { validate(user) { /* ... */ } }
class UserRepository { save(user) { /* ... */ } }
class UserNotifier { notify(user) { /* ... */ } }

// Coordinar en un Use Case
class CreateUserUseCase {
  constructor(validator, repository, notifier) {
    this.validator = validator;
    this.repository = repository;
    this.notifier = notifier;
  }

  async execute(userData) {
    const user = this.validator.validate(userData);
    const savedUser = await this.repository.save(user);
    await this.notifier.notify(savedUser);
    return savedUser;
  }
}`,
            })
        }

        // Sugerir patrón Repository si hay llamadas HTTP directas
        const httpIssues = issues.filter(
            (i) =>
                i.issue.includes('HTTP directa') ||
                i.issue.includes('fetch') ||
                i.issue.includes('axios'),
        )

        if (httpIssues.length > 0) {
            suggestions.push({
                title: 'Implementar Repository Pattern',
                description:
                    'Abstrae las llamadas HTTP en repositorios para mejor testeo y mantenimiento',
                pattern: 'Repository Pattern',
                benefit:
                    'Desacoplamiento de la fuente de datos, facilita testing con mocks',
                implementation:
                    '1. Define interfaces para los repositorios\n2. Crea implementaciones concretas\n3. Inyecta repositorios en los casos de uso',
                example: `interface IUserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<User>;
}

class ApiUserRepository implements IUserRepository {
  constructor(private httpClient: HttpClient) {}

  async findById(id: string): Promise<User> {
    return this.httpClient.get(\`/users/\${id}\`);
  }

  async save(user: User): Promise<User> {
    return this.httpClient.post('/users', user);
  }
}`,
            })
        }

        return suggestions
    }
}

// Instancia global del analizador
let globalAnalyzer: CodeAnalyzer | null = null

/**
 * Inicializa el analizador de código
 */
export function initializeCodeAnalyzer(): CodeAnalyzer {
    globalAnalyzer = new CodeAnalyzer()
    return globalAnalyzer
}

/**
 * Obtiene la instancia global del analizador
 */
export function getCodeAnalyzer(): CodeAnalyzer {
    if (!globalAnalyzer) {
        throw new Error(
            'Code analyzer not initialized. Call initializeCodeAnalyzer first.',
        )
    }
    return globalAnalyzer
}
