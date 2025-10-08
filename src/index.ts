import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { Octokit } from '@octokit/rest'

// ============================================================================
// TIPOS Y CONFIGURACIÓN
// ============================================================================

interface AnalysisIssue {
    category: string
    issue: string
    recommendation: string
    severity: 'critical' | 'high' | 'medium' | 'low' | 'good' | 'info'
    occurrences: number
    explanation?: string
    designPattern?: string
    architectureLayer?: string
    codeExample?: string
    resources?: string[]
}

interface FileAnalysisResult {
    file: string
    totalIssues: number
    issues: AnalysisIssue[]
    summary: Summary
    architectureScore: number
    cleanCodeScore: number
    suggestions: ArchitectureSuggestion[]
}

interface Summary {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    good: number
}

interface ArchitectureSuggestion {
    title: string
    description: string
    pattern: string
    benefit: string
    implementation: string
    example?: string
}

let octokit: Octokit

// ============================================================================
// SERVIDOR MCP
// ============================================================================

const server = new Server(
    {
        name: 'github-code-mentor',
        version: '2.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    },
)

// ============================================================================
// DEFINICIÓN DE HERRAMIENTAS
// ============================================================================

const tools: Tool[] = [
    {
        name: 'configurar_github',
        description: 'Configura el token de acceso de GitHub',
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
        name: 'analizar_archivo',
        description:
            'Analiza un archivo aplicando principios de Clean Architecture, SOLID y patrones de diseño',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string', description: 'Propietario del repo' },
                repo: { type: 'string', description: 'Nombre del repositorio' },
                path: { type: 'string', description: 'Ruta del archivo' },
                branch: { type: 'string', description: 'Rama (default: main)' },
            },
            required: ['owner', 'repo', 'path'],
        },
    },
    {
        name: 'analizar_repositorio',
        description:
            'Analiza la arquitectura completa del repositorio con recomendaciones de Clean Architecture',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string' },
                repo: { type: 'string' },
                branch: { type: 'string' },
            },
            required: ['owner', 'repo'],
        },
    },
    {
        name: 'sugerir_arquitectura',
        description:
            'Sugiere una estructura de Clean Architecture para el proyecto',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string' },
                repo: { type: 'string' },
                projectType: {
                    type: 'string',
                    description:
                        'Tipo de proyecto: web, api, mobile, fullstack',
                },
            },
            required: ['owner', 'repo'],
        },
    },
    {
        name: 'explicar_patron',
        description:
            'Explica un patrón de diseño con ejemplos prácticos en React/Next.js',
        inputSchema: {
            type: 'object',
            properties: {
                patron: {
                    type: 'string',
                    description:
                        'Nombre del patrón: repository, factory, observer, strategy, etc.',
                },
            },
            required: ['patron'],
        },
    },
    {
        name: 'listar_archivos_react',
        description: 'Lista archivos React/Next.js del repositorio',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string' },
                repo: { type: 'string' },
                path: { type: 'string' },
            },
            required: ['owner', 'repo'],
        },
    },
]

// ============================================================================
// PATRONES DE ANÁLISIS - CLEAN ARCHITECTURE
// ============================================================================

const cleanArchitecturePatterns = {
    // Capa de Dominio (Entities)
    domainLayer: [
        {
            pattern: /class\s+\w+\s*{[^}]*constructor[^}]*}[^}]*}/g,
            issue: 'Entidad de dominio sin validación',
            recommendation:
                'Las entidades deben validar su estado en el constructor',
            severity: 'high' as const,
            explanation:
                'En Clean Architecture, las entidades del dominio deben ser auto-validantes. Esto asegura que nunca existan en un estado inválido.',
            designPattern: 'Domain Entity Pattern',
            architectureLayer: 'Domain Layer (Entities)',
            codeExample: `// ❌ Mal
class User {
  constructor(public email: string, public age: number) {}
}

// ✅ Bien
class User {
  private constructor(
    public readonly email: string,
    public readonly age: number
  ) {}

  static create(email: string, age: number): User {
    if (!email.includes('@')) throw new Error('Email inválido');
    if (age < 0) throw new Error('Edad inválida');
    return new User(email, age);
  }
}`,
            resources: [
                'Clean Architecture - Robert C. Martin',
                'Domain-Driven Design - Eric Evans',
            ],
        },
        {
            pattern: /export\s+(?:interface|type)\s+\w+(?!Props|State)/g,
            issue: 'Interface de dominio detectada',
            recommendation:
                'Asegúrate de que las interfaces de dominio estén en la capa correcta',
            severity: 'info' as const,
            explanation:
                'Las interfaces del dominio deben vivir en la capa más interna y no depender de frameworks externos.',
            architectureLayer: 'Domain Layer',
        },
    ],

    // Capa de Casos de Uso (Use Cases)
    useCaseLayer: [
        {
            pattern: /export\s+(?:function|const)\s+use\w+/g,
            issue: 'Hook personalizado detectado',
            recommendation:
                'Verifica que los hooks solo coordinen casos de uso, no contengan lógica de negocio',
            severity: 'medium' as const,
            explanation:
                'Los hooks son adaptadores de la UI. La lógica de negocio debe estar en casos de uso puros que no dependan de React.',
            designPattern: 'Use Case Pattern',
            architectureLayer: 'Application Layer (Use Cases)',
            codeExample: `// ❌ Mal - Lógica en el hook
export function useUser() {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // Validación y lógica aquí (MAL)
    if (!email.includes('@')) return;
    const response = await fetch('/api/login', {...});
    setUser(response.data);
  };

  return { user, login };
}

// ✅ Bien - Separación de responsabilidades
// useCases/loginUseCase.ts
export class LoginUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private validator: IValidator
  ) {}

  async execute(email: string, password: string): Promise<User> {
    this.validator.validateEmail(email);
    return await this.authRepository.login(email, password);
  }
}

// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  const loginUseCase = useInjection('LoginUseCase');

  const login = async (email: string, password: string) => {
    const user = await loginUseCase.execute(email, password);
    setUser(user);
  };

  return { user, login };
}`,
            resources: [
                'The Clean Architecture - Uncle Bob',
                'Hexagonal Architecture - Alistair Cockburn',
            ],
        },
        {
            pattern:
                /async\s+function\s+\w+\([^)]*\)\s*{[^}]*(?:fetch|axios)[^}]*}/g,
            issue: 'Lógica de datos mezclada con caso de uso',
            recommendation:
                'Separa la obtención de datos (Repository) del caso de uso',
            severity: 'high' as const,
            explanation:
                'Los casos de uso deben orquestar la lógica de negocio, no realizar llamadas HTTP directamente. Usa el patrón Repository.',
            designPattern: 'Repository Pattern',
            architectureLayer: 'Application Layer',
        },
    ],

    // Capa de Infraestructura (Repositories)
    infrastructureLayer: [
        {
            pattern: /class\s+\w+Repository\s+(?:implements|extends)/g,
            issue: 'Repositorio detectado',
            recommendation: '✅ Implementando patrón Repository correctamente',
            severity: 'good' as const,
            explanation:
                'Los repositorios abstraen el acceso a datos, permitiendo cambiar la fuente sin afectar la lógica de negocio.',
            designPattern: 'Repository Pattern',
            architectureLayer: 'Infrastructure Layer',
        },
        {
            pattern: /fetch\(|axios\./g,
            issue: 'Llamada HTTP directa',
            recommendation:
                'Encapsula las llamadas HTTP en un repositorio o servicio',
            severity: 'high' as const,
            explanation:
                'Las llamadas directas a APIs crean acoplamiento. Usa repositorios para abstraer la fuente de datos.',
            codeExample: `// ❌ Mal - Llamada directa
const getUsers = async () => {
  const response = await fetch('/api/users');
  return response.json();
};

// ✅ Bien - Repositorio
interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User>;
}

class UserApiRepository implements IUserRepository {
  constructor(private httpClient: IHttpClient) {}

  async getAll(): Promise<User[]> {
    return this.httpClient.get<User[]>('/users');
  }

  async getById(id: string): Promise<User> {
    return this.httpClient.get<User>(\`/users/\${id}\`);
  }
}`,
        },
    ],

    // Principios SOLID
    solidPrinciples: [
        {
            pattern:
                /class\s+\w+\s*{[^}]*(?:fetch|axios|console|localStorage){2,}/gs,
            issue: 'Violación del SRP (Single Responsibility Principle)',
            recommendation:
                'Esta clase tiene múltiples responsabilidades. Sepáralas en clases diferentes',
            severity: 'critical' as const,
            explanation:
                'SRP: Una clase debe tener una sola razón para cambiar. Si hace HTTP, logging y storage, tiene 3 razones para cambiar.',
            designPattern: 'Single Responsibility Principle',
            codeExample: `// ❌ Mal - Múltiples responsabilidades
class UserService {
  async getUser(id: string) {
    console.log('Getting user...');
    const data = await fetch(\`/api/users/\${id}\`);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  }
}

// ✅ Bien - Responsabilidades separadas
class UserRepository {
  constructor(private httpClient: IHttpClient) {}
  async getById(id: string): Promise<User> {
    return this.httpClient.get(\`/users/\${id}\`);
  }
}

class UserCache {
  set(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

class Logger {
  info(message: string): void {
    console.log(message);
  }
}`,
        },
        {
            pattern:
                /export\s+(?:function|const)\s+\w+[^=]*=[^{]*\([^)]*:\s*(?:any|unknown)\)/g,
            issue: 'Parámetro con tipo any/unknown',
            recommendation:
                'Define interfaces específicas (Interface Segregation Principle)',
            severity: 'medium' as const,
            explanation:
                'ISP: Los clientes no deben depender de interfaces que no usan. Define contratos específicos.',
            designPattern: 'Interface Segregation Principle',
        },
        {
            pattern: /new\s+\w+\([^)]*\)\s*(?!.*inject|provide)/g,
            issue: 'Instanciación directa con "new"',
            recommendation:
                'Usa Dependency Injection para invertir dependencias (DIP)',
            severity: 'high' as const,
            explanation:
                'DIP: Depende de abstracciones, no de concreciones. Inyecta dependencias en lugar de crearlas.',
            designPattern: 'Dependency Injection Pattern',
            codeExample: `// ❌ Mal - Dependencia concreta
class UserController {
  private repository = new UserApiRepository();

  async getUsers() {
    return this.repository.getAll();
  }
}

// ✅ Bien - Inyección de dependencias
class UserController {
  constructor(private repository: IUserRepository) {}

  async getUsers() {
    return this.repository.getAll();
  }
}

// Uso
const repository = new UserApiRepository(httpClient);
const controller = new UserController(repository);`,
        },
    ],

    // Patrones de Diseño Específicos
    designPatterns: [
        {
            pattern: /class\s+\w+Factory/g,
            issue: 'Patrón Factory detectado',
            recommendation: '✅ Usando Factory Pattern para creación de objetos',
            severity: 'good' as const,
            designPattern: 'Factory Pattern',
        },
        {
            pattern: /class\s+\w+(?:Observer|Subject|Publisher)/g,
            issue: 'Patrón Observer detectado',
            recommendation: '✅ Usando Observer Pattern para comunicación',
            severity: 'good' as const,
            designPattern: 'Observer Pattern',
        },
        {
            pattern: /class\s+\w+Strategy/g,
            issue: 'Patrón Strategy detectado',
            recommendation:
                '✅ Usando Strategy Pattern para algoritmos intercambiables',
            severity: 'good' as const,
            designPattern: 'Strategy Pattern',
        },
        {
            pattern: /if\s*\([^)]*===\s*['"][^'"]+['"]\)\s*{[^}]*return/g,
            issue: 'Condicionales que podrían usar Strategy Pattern',
            recommendation:
                'Considera usar Strategy Pattern para eliminar condicionales',
            severity: 'medium' as const,
            explanation:
                'Múltiples if/switch pueden reemplazarse con Strategy Pattern para mejor extensibilidad.',
            designPattern: 'Strategy Pattern',
            codeExample: `// ❌ Mal - Condicionales
function processPayment(type: string, amount: number) {
  if (type === 'credit') {
    return processCreditCard(amount);
  } else if (type === 'paypal') {
    return processPaypal(amount);
  } else if (type === 'crypto') {
    return processCrypto(amount);
  }
}

// ✅ Bien - Strategy Pattern
interface IPaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

class CreditCardStrategy implements IPaymentStrategy {
  async process(amount: number) { /* ... */ }
}

class PaymentProcessor {
  constructor(private strategy: IPaymentStrategy) {}

  async pay(amount: number) {
    return this.strategy.process(amount);
  }
}`,
        },
    ],

    // React/Next.js Best Practices
    reactPatterns: [
        {
            pattern: /export\s+default\s+function\s+\w+\([^)]*\)\s*{[\s\S]{300,}}/g,
            issue: 'Componente muy grande (>300 líneas)',
            recommendation:
                'Aplica el patrón Composite y divide en componentes más pequeños',
            severity: 'high' as const,
            explanation:
                'Componentes grandes son difíciles de mantener y testear. Aplica composición.',
            designPattern: 'Composite Pattern',
        },
        {
            pattern: /useState\([^)]*\)[\s\S]{0,100}useState\([^)]*\)[\s\S]{0,100}useState/g,
            issue: 'Múltiples useState',
            recommendation:
                'Considera useReducer o un hook personalizado (Facade Pattern)',
            severity: 'medium' as const,
            explanation:
                'Múltiples estados relacionados indican necesidad de un reducer o estado consolidado.',
            designPattern: 'Facade Pattern / State Pattern',
            codeExample: `// ❌ Mal - Estados dispersos
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// ✅ Bien - Estado consolidado
const [state, dispatch] = useReducer(reducer, {
  loading: false,
  error: null,
  data: null
});

// Mejor aún - Custom Hook (Facade)
const { data, loading, error } = useUserData(userId);`,
        },
        {
            pattern: /<[A-Z][^>]*\s+\w+={{[^}]+}}/g,
            issue: 'Objeto inline como prop',
            recommendation:
                'Usa useMemo para evitar re-renders innecesarios (Memoization)',
            severity: 'high' as const,
            explanation:
                'Objetos inline crean nuevas referencias en cada render, causando re-renders.',
            codeExample: `// ❌ Mal
<Component config={{ theme: 'dark', size: 'lg' }} />

// ✅ Bien
const config = useMemo(() => ({ theme: 'dark', size: 'lg' }), []);
<Component config={config} />`,
        },
        {
            pattern: /\.map\([^)]*=>\s*<[^>]+onClick={[^}]*=>/g,
            issue: 'Función inline en map',
            recommendation:
                'Usa useCallback para funciones en listas (Command Pattern)',
            severity: 'high' as const,
            designPattern: 'Command Pattern',
            codeExample: `// ❌ Mal
{items.map(item => (
  <Item onClick={() => handleClick(item.id)} />
))}

// ✅ Bien
const handleItemClick = useCallback((id: string) => {
  handleClick(id);
}, [handleClick]);

{items.map(item => (
  <Item onClick={() => handleItemClick(item.id)} />
))}`,
        },
    ],

    // Testing & Quality
    testingPatterns: [
        {
            pattern: /\.test\.(tsx?|jsx?)|\.spec\.(tsx?|jsx?)/g,
            issue: 'Tests detectados',
            recommendation: '✅ Implementando tests (excelente práctica)',
            severity: 'good' as const,
        },
        {
            pattern: /export\s+(?:function|const|class)\s+\w+/g,
            issue: 'Función/clase sin tests',
            recommendation:
                'Considera agregar tests unitarios para esta función',
            severity: 'low' as const,
            explanation:
                'Los tests aseguran que el código funciona y facilitan refactoring seguro.',
        },
    ],
}

// ============================================================================
// ANÁLISIS DE ARQUITECTURA
// ============================================================================

function analyzeArchitecture(
    content: string,
    filepath: string,
): AnalysisIssue[] {
    const issues: AnalysisIssue[] = []

    // Detectar capa de arquitectura
    const layer = detectArchitectureLayer(filepath)

    // Analizar todos los patrones
    Object.entries(cleanArchitecturePatterns).forEach(([category, patterns]) => {
        patterns.forEach((pattern) => {
            const matches = content.match(pattern.pattern)
            if (matches && matches.length > 0) {
                issues.push({
                    category,
                    issue: pattern.issue,
                    recommendation: pattern.recommendation,
                    severity: pattern.severity,
                    occurrences: matches.length,
                    explanation: pattern.explanation,
                    designPattern: pattern.designPattern,
                    architectureLayer: pattern.architectureLayer || layer,
                    codeExample: pattern.codeExample,
                    resources: pattern.resources,
                })
            }
        })
    })

    // Análisis adicional de Clean Code
    issues.push(...analyzeCleanCode(content, filepath))

    return issues
}

function detectArchitectureLayer(filepath: string): string {
    if (filepath.includes('/domain/') || filepath.includes('/entities/'))
        return 'Domain Layer'
    if (filepath.includes('/usecases/') || filepath.includes('/application/'))
        return 'Application Layer'
    if (
        filepath.includes('/infrastructure/') ||
        filepath.includes('/repositories/')
    )
        return 'Infrastructure Layer'
    if (
        filepath.includes('/presentation/') ||
        filepath.includes('/components/')
    )
        return 'Presentation Layer'
    return 'Unknown Layer'
}

function analyzeCleanCode(content: string, filepath: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = []

    // Nombres descriptivos
    const shortVarNames = content.match(/\b[a-z]\b(?!\s*=>)/g)
    if (shortVarNames && shortVarNames.length > 5) {
        issues.push({
            category: 'cleanCode',
            issue: 'Variables con nombres de una letra',
            recommendation: 'Usa nombres descriptivos que revelen intención',
            severity: 'medium',
            occurrences: shortVarNames.length,
            explanation:
                'Clean Code: El código se lee más que se escribe. Los nombres deben revelar la intención.',
            codeExample: `// ❌ Mal
const u = getUser();
const d = new Date();

// ✅ Bien
const currentUser = getUser();
const createdAt = new Date();`,
        })
    }

    // Funciones largas
    const functions = content.match(/function\s+\w+[^}]+\{[^}]+\}/gs) || []
    functions.forEach((func) => {
        const lines = func.split('\n').length
        if (lines > 20) {
            issues.push({
                category: 'cleanCode',
                issue: `Función con ${lines} líneas`,
                recommendation:
                    'Las funciones deben hacer una sola cosa. Divide en funciones más pequeñas',
                severity: 'high',
                occurrences: 1,
                explanation:
                    'Una función debe caber en una pantalla y hacer una sola cosa bien.',
            })
        }
    })

    // Comentarios excesivos
    const commentLines = (content.match(/\/\/.+/g) || []).length
    const codeLines = content.split('\n').length
    if (commentLines > codeLines * 0.3) {
        issues.push({
            category: 'cleanCode',
            issue: 'Demasiados comentarios',
            recommendation:
                'El código debe ser auto-explicativo. Refactoriza en lugar de comentar',
            severity: 'low',
            occurrences: commentLines,
            explanation:
                'Clean Code: Los comentarios son una forma de fracaso. El código debe explicarse por sí mismo.',
        })
    }

    // Magic numbers
    const magicNumbers = content.match(/\b\d{2,}\b(?![.]\d)/g)
    if (magicNumbers && magicNumbers.length > 3) {
        issues.push({
            category: 'cleanCode',
            issue: 'Números mágicos detectados',
            recommendation: 'Usa constantes con nombres descriptivos',
            severity: 'medium',
            occurrences: magicNumbers.length,
            codeExample: `// ❌ Mal
if (age > 18) { }
setTimeout(callback, 3600000);

// ✅ Bien
const LEGAL_AGE = 18;
const ONE_HOUR_MS = 60 * 60 * 1000;
if (age > LEGAL_AGE) { }
setTimeout(callback, ONE_HOUR_MS);`,
        })
    }

    return issues
}

// ============================================================================
// SUGERENCIAS DE ARQUITECTURA
// ============================================================================

function generateArchitectureSuggestions(
    issues: AnalysisIssue[],
): ArchitectureSuggestion[] {
    const suggestions: ArchitectureSuggestion[] = []

    // Sugerir Clean Architecture
    const hasRepositoryIssues = issues.some((i) =>
        i.issue.includes('HTTP directa'),
    )
    if (hasRepositoryIssues) {
        suggestions.push({
            title: 'Implementar Patrón Repository',
            description:
                'Abstrae el acceso a datos para independencia de la fuente',
            pattern: 'Repository Pattern',
            benefit:
                'Permite cambiar de API REST a GraphQL o base de datos local sin cambiar la lógica de negocio',
            implementation: `1. Crea una interfaz IRepository en el dominio
2. Implementa repositorios concretos en infrastructure
3. Inyecta el repositorio en los casos de uso
4. Usa el repositorio en lugar de fetch/axios`,
            example: `// domain/repositories/IUserRepository.ts
export interface IUserRepository {
  getById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

// infrastructure/repositories/UserApiRepository.ts
export class UserApiRepository implements IUserRepository {
  constructor(private http: IHttpClient) {}

  async getById(id: string): Promise<User> {
    return this.http.get(\`/users/\${id}\`);
  }

  async save(user: User): Promise<void> {
    await this.http.post('/users', user);
  }
}`,
        })
    }

    // Sugerir Dependency Injection
    const hasNewInstances = issues.some((i) => i.issue.includes('new'))
    if (hasNewInstances) {
        suggestions.push({
            title: 'Implementar Dependency Injection',
            description: 'Invierte las dependencias para código más testeable',
            pattern: 'Dependency Injection',
            benefit:
                'Facilita testing con mocks, reduce acoplamiento y mejora mantenibilidad',
            implementation: `1. Define interfaces para todas las dependencias
2. Usa un contenedor de DI (como tsyringe o InversifyJS)
3. Inyecta dependencias en constructores
4. Registra implementaciones en el contenedor`,
            example: `// Usando tsyringe
import { injectable, inject, container } from 'tsyringe';

@injectable()
export class LoginUseCase {
  constructor(
    @inject('IAuthRepository') private authRepo: IAuthRepository,
    @inject('ITokenService') private tokenService: ITokenService
  ) {}

  async execute(email: string, password: string) {
    const user = await this.authRepo.authenticate(email, password);
    const token = this.tokenService.generate(user);
    return { user, token };
  }
}

// Registro
container.register('IAuthRepository', { useClass: AuthApiRepository });
container.register('ITokenService', { useClass: JwtTokenService });`,
        })
    }

    // Sugerir separación de capas
    if (issues.some((i) => i.severity === 'critical')) {
        suggestions.push({
            title: 'Estructura de Clean Architecture',
            description: 'Organiza el código en capas con dependencias claras',
            pattern: 'Clean Architecture Layers',
            benefit:
                'Código mantenible, testeable e independiente de frameworks',
            implementation: `src/
├── domain/                 # Capa interna (sin dependencias)
│   ├── entities/          # Modelos de negocio
│   ├── repositories/      # Interfaces de repos
│   └── value-objects/     # Objetos de valor
├── application/           # Casos de uso
│   └── use-cases/
├── infrastructure/        # Implementaciones
│   ├── repositories/      # Repos concretos
│   ├── services/          # Servicios externos
│   └── http/              # Cliente HTTP
└── presentation/          # UI (React/Next.js)
    ├── components/
    ├── hooks/             # Adaptadores a casos de uso
    └── pages/`,
            example: `// Flujo de dependencias:
// Presentation -> Application -> Domain
// Infrastructure -> Domain (implementa interfaces)

// ❌ Mal: Dependencias incorrectas
// Domain depende de Infrastructure

// ✅ Bien: Domain es el centro
// Todos dependen del Domain, Domain no depende de nadie`,
        })
    }

    return suggestions
}

// ============================================================================
// SCORING
// ============================================================================

function calculateScores(issues: AnalysisIssue[]): {
    architecture: number
    cleanCode: number
} {
    const total = issues.length || 1
    const critical = issues.filter((i) => i.severity === 'critical').length
    const high = issues.filter((i) => i.severity === 'high').length
    const medium = issues.filter((i) => i.severity === 'medium').length
    const good = issues.filter((i) => i.severity === 'good').length

    // Score de arquitectura (0-100)
    const architecture = Math.max(
        0,
        100 - critical * 25 -import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { Octokit } from '@octokit/rest'

// ============================================================================
// TIPOS Y CONFIGURACIÓN
// ============================================================================

interface AnalysisIssue {
    category: string
    issue: string
    recommendation: string
    severity: 'critical' | 'high' | 'medium' | 'low' | 'good' | 'info'
    occurrences: number
    explanation?: string
    designPattern?: string
    architectureLayer?: string
    codeExample?: string
    resources?: string[]
}

interface FileAnalysisResult {
    file: string
    totalIssues: number
    issues: AnalysisIssue[]
    summary: Summary
    architectureScore: number
    cleanCodeScore: number
    suggestions: ArchitectureSuggestion[]
}

interface Summary {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    good: number
}

interface ArchitectureSuggestion {
    title: string
    description: string
    pattern: string
    benefit: string
    implementation: string
    example?: string
}

let octokit: Octokit

// ============================================================================
// SERVIDOR MCP
// ============================================================================

const server = new Server(
    {
        name: 'github-code-mentor',
        version: '2.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    },
)

// ============================================================================
// DEFINICIÓN DE HERRAMIENTAS
// ============================================================================

const tools: Tool[] = [
    {
        name: 'configurar_github',
        description: 'Configura el token de acceso de GitHub',
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
        name: 'analizar_archivo',
        description:
            'Analiza un archivo aplicando principios de Clean Architecture, SOLID y patrones de diseño',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string', description: 'Propietario del repo' },
                repo: { type: 'string', description: 'Nombre del repositorio' },
                path: { type: 'string', description: 'Ruta del archivo' },
                branch: { type: 'string', description: 'Rama (default: main)' },
            },
            required: ['owner', 'repo', 'path'],
        },
    },
    {
        name: 'analizar_repositorio',
        description:
            'Analiza la arquitectura completa del repositorio con recomendaciones de Clean Architecture',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string' },
                repo: { type: 'string' },
                branch: { type: 'string' },
            },
            required: ['owner', 'repo'],
        },
    },
    {
        name: 'sugerir_arquitectura',
        description:
            'Sugiere una estructura de Clean Architecture para el proyecto',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string' },
                repo: { type: 'string' },
                projectType: {
                    type: 'string',
                    description:
                        'Tipo de proyecto: web, api, mobile, fullstack',
                },
            },
            required: ['owner', 'repo'],
        },
    },
    {
        name: 'explicar_patron',
        description:
            'Explica un patrón de diseño con ejemplos prácticos en React/Next.js',
        inputSchema: {
            type: 'object',
            properties: {
                patron: {
                    type: 'string',
                    description:
                        'Nombre del patrón: repository, factory, observer, strategy, etc.',
                },
            },
            required: ['patron'],
        },
    },
    {
        name: 'listar_archivos_react',
        description: 'Lista archivos React/Next.js del repositorio',
        inputSchema: {
            type: 'object',
            properties: {
                owner: { type: 'string' },
                repo: { type: 'string' },
                path: { type: 'string' },
            },
            required: ['owner', 'repo'],
        },
    },
]

// ============================================================================
// PATRONES DE ANÁLISIS - CLEAN ARCHITECTURE
// ============================================================================

const cleanArchitecturePatterns = {
    // Capa de Dominio (Entities)
    domainLayer: [
        {
            pattern: /class\s+\w+\s*{[^}]*constructor[^}]*}[^}]*}/g,
            issue: 'Entidad de dominio sin validación',
            recommendation:
                'Las entidades deben validar su estado en el constructor',
            severity: 'high' as const,
            explanation:
                'En Clean Architecture, las entidades del dominio deben ser auto-validantes. Esto asegura que nunca existan en un estado inválido.',
            designPattern: 'Domain Entity Pattern',
            architectureLayer: 'Domain Layer (Entities)',
            codeExample: `// ❌ Mal
class User {
  constructor(public email: string, public age: number) {}
}

// ✅ Bien
class User {
  private constructor(
    public readonly email: string,
    public readonly age: number
  ) {}

  static create(email: string, age: number): User {
    if (!email.includes('@')) throw new Error('Email inválido');
    if (age < 0) throw new Error('Edad inválida');
    return new User(email, age);
  }
}`,
            resources: [
                'Clean Architecture - Robert C. Martin',
                'Domain-Driven Design - Eric Evans',
            ],
        },
        {
            pattern: /export\s+(?:interface|type)\s+\w+(?!Props|State)/g,
            issue: 'Interface de dominio detectada',
            recommendation:
                'Asegúrate de que las interfaces de dominio estén en la capa correcta',
            severity: 'info' as const,
            explanation:
                'Las interfaces del dominio deben vivir en la capa más interna y no depender de frameworks externos.',
            architectureLayer: 'Domain Layer',
        },
    ],

    // Capa de Casos de Uso (Use Cases)
    useCaseLayer: [
        {
            pattern: /export\s+(?:function|const)\s+use\w+/g,
            issue: 'Hook personalizado detectado',
            recommendation:
                'Verifica que los hooks solo coordinen casos de uso, no contengan lógica de negocio',
            severity: 'medium' as const,
            explanation:
                'Los hooks son adaptadores de la UI. La lógica de negocio debe estar en casos de uso puros que no dependan de React.',
            designPattern: 'Use Case Pattern',
            architectureLayer: 'Application Layer (Use Cases)',
            codeExample: `// ❌ Mal - Lógica en el hook
export function useUser() {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // Validación y lógica aquí (MAL)
    if (!email.includes('@')) return;
    const response = await fetch('/api/login', {...});
    setUser(response.data);
  };

  return { user, login };
}

// ✅ Bien - Separación de responsabilidades
// useCases/loginUseCase.ts
export class LoginUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private validator: IValidator
  ) {}

  async execute(email: string, password: string): Promise<User> {
    this.validator.validateEmail(email);
    return await this.authRepository.login(email, password);
  }
}

// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  const loginUseCase = useInjection('LoginUseCase');

  const login = async (email: string, password: string) => {
    const user = await loginUseCase.execute(email, password);
    setUser(user);
  };

  return { user, login };
}`,
            resources: [
                'The Clean Architecture - Uncle Bob',
                'Hexagonal Architecture - Alistair Cockburn',
            ],
        },
        {
            pattern:
                /async\s+function\s+\w+\([^)]*\)\s*{[^}]*(?:fetch|axios)[^}]*}/g,
            issue: 'Lógica de datos mezclada con caso de uso',
            recommendation:
                'Separa la obtención de datos (Repository) del caso de uso',
            severity: 'high' as const,
            explanation:
                'Los casos de uso deben orquestar la lógica de negocio, no realizar llamadas HTTP directamente. Usa el patrón Repository.',
            designPattern: 'Repository Pattern',
            architectureLayer: 'Application Layer',
        },
    ],

    // Capa de Infraestructura (Repositories)
    infrastructureLayer: [
        {
            pattern: /class\s+\w+Repository\s+(?:implements|extends)/g,
            issue: 'Repositorio detectado',
            recommendation: '✅ Implementando patrón Repository correctamente',
            severity: 'good' as const,
            explanation:
                'Los repositorios abstraen el acceso a datos, permitiendo cambiar la fuente sin afectar la lógica de negocio.',
            designPattern: 'Repository Pattern',
            architectureLayer: 'Infrastructure Layer',
        },
        {
            pattern: /fetch\(|axios\./g,
            issue: 'Llamada HTTP directa',
            recommendation:
                'Encapsula las llamadas HTTP en un repositorio o servicio',
            severity: 'high' as const,
            explanation:
                'Las llamadas directas a APIs crean acoplamiento. Usa repositorios para abstraer la fuente de datos.',
            codeExample: `// ❌ Mal - Llamada directa
const getUsers = async () => {
  const response = await fetch('/api/users');
  return response.json();
};

// ✅ Bien - Repositorio
interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User>;
}

class UserApiRepository implements IUserRepository {
  constructor(private httpClient: IHttpClient) {}

  async getAll(): Promise<User[]> {
    return this.httpClient.get<User[]>('/users');
  }

  async getById(id: string): Promise<User> {
    return this.httpClient.get<User>(\`/users/\${id}\`);
  }
}`,
        },
    ],

    // Principios SOLID
    solidPrinciples: [
        {
            pattern:
                /class\s+\w+\s*{[^}]*(?:fetch|axios|console|localStorage){2,}/gs,
            issue: 'Violación del SRP (Single Responsibility Principle)',
            recommendation:
                'Esta clase tiene múltiples responsabilidades. Sepáralas en clases diferentes',
            severity: 'critical' as const,
            explanation:
                'SRP: Una clase debe tener una sola razón para cambiar. Si hace HTTP, logging y storage, tiene 3 razones para cambiar.',
            designPattern: 'Single Responsibility Principle',
            codeExample: `// ❌ Mal - Múltiples responsabilidades
class UserService {
  async getUser(id: string) {
    console.log('Getting user...');
    const data = await fetch(\`/api/users/\${id}\`);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  }
}

// ✅ Bien - Responsabilidades separadas
class UserRepository {
  constructor(private httpClient: IHttpClient) {}
  async getById(id: string): Promise<User> {
    return this.httpClient.get(\`/users/\${id}\`);
  }
}

class UserCache {
  set(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

class Logger {
  info(message: string): void {
    console.log(message);
  }
}`,
        },
        {
            pattern:
                /export\s+(?:function|const)\s+\w+[^=]*=[^{]*\([^)]*:\s*(?:any|unknown)\)/g,
            issue: 'Parámetro con tipo any/unknown',
            recommendation:
                'Define interfaces específicas (Interface Segregation Principle)',
            severity: 'medium' as const,
            explanation:
                'ISP: Los clientes no deben depender de interfaces que no usan. Define contratos específicos.',
            designPattern: 'Interface Segregation Principle',
        },
        {
            pattern: /new\s+\w+\([^)]*\)\s*(?!.*inject|provide)/g,
            issue: 'Instanciación directa con "new"',
            recommendation:
                'Usa Dependency Injection para invertir dependencias (DIP)',
            severity: 'high' as const,
            explanation:
                'DIP: Depende de abstracciones, no de concreciones. Inyecta dependencias en lugar de crearlas.',
            designPattern: 'Dependency Injection Pattern',
            codeExample: `// ❌ Mal - Dependencia concreta
class UserController {
  private repository = new UserApiRepository();

  async getUsers() {
    return this.repository.getAll();
  }
}

// ✅ Bien - Inyección de dependencias
class UserController {
  constructor(private repository: IUserRepository) {}

  async getUsers() {
    return this.repository.getAll();
  }
}

// Uso
const repository = new UserApiRepository(httpClient);
const controller = new UserController(repository);`,
        },
    ],

    // Patrones de Diseño Específicos
    designPatterns: [
        {
            pattern: /class\s+\w+Factory/g,
            issue: 'Patrón Factory detectado',
            recommendation: '✅ Usando Factory Pattern para creación de objetos',
            severity: 'good' as const,
            designPattern: 'Factory Pattern',
        },
        {
            pattern: /class\s+\w+(?:Observer|Subject|Publisher)/g,
            issue: 'Patrón Observer detectado',
            recommendation: '✅ Usando Observer Pattern para comunicación',
            severity: 'good' as const,
            designPattern: 'Observer Pattern',
        },
        {
            pattern: /class\s+\w+Strategy/g,
            issue: 'Patrón Strategy detectado',
            recommendation:
                '✅ Usando Strategy Pattern para algoritmos intercambiables',
            severity: 'good' as const,
            designPattern: 'Strategy Pattern',
        },
        {
            pattern: /if\s*\([^)]*===\s*['"][^'"]+['"]\)\s*{[^}]*return/g,
            issue: 'Condicionales que podrían usar Strategy Pattern',
            recommendation:
                'Considera usar Strategy Pattern para eliminar condicionales',
            severity: 'medium' as const,
            explanation:
                'Múltiples if/switch pueden reemplazarse con Strategy Pattern para mejor extensibilidad.',
            designPattern: 'Strategy Pattern',
            codeExample: `// ❌ Mal - Condicionales
function processPayment(type: string, amount: number) {
  if (type === 'credit') {
    return processCreditCard(amount);
  } else if (type === 'paypal') {
    return processPaypal(amount);
  } else if (type === 'crypto') {
    return processCrypto(amount);
  }
}

// ✅ Bien - Strategy Pattern
interface IPaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

class CreditCardStrategy implements IPaymentStrategy {
  async process(amount: number) { /* ... */ }
}

class PaymentProcessor {
  constructor(private strategy: IPaymentStrategy) {}

  async pay(amount: number) {
    return this.strategy.process(amount);
  }
}`,
        },
    ],

    // React/Next.js Best Practices
    reactPatterns: [
        {
            pattern: /export\s+default\s+function\s+\w+\([^)]*\)\s*{[\s\S]{300,}}/g,
            issue: 'Componente muy grande (>300 líneas)',
            recommendation:
                'Aplica el patrón Composite y divide en componentes más pequeños',
            severity: 'high' as const,
            explanation:
                'Componentes grandes son difíciles de mantener y testear. Aplica composición.',
            designPattern: 'Composite Pattern',
        },
        {
            pattern: /useState\([^)]*\)[\s\S]{0,100}useState\([^)]*\)[\s\S]{0,100}useState/g,
            issue: 'Múltiples useState',
            recommendation:
                'Considera useReducer o un hook personalizado (Facade Pattern)',
            severity: 'medium' as const,
            explanation:
                'Múltiples estados relacionados indican necesidad de un reducer o estado consolidado.',
            designPattern: 'Facade Pattern / State Pattern',
            codeExample: `// ❌ Mal - Estados dispersos
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// ✅ Bien - Estado consolidado
const [state, dispatch] = useReducer(reducer, {
  loading: false,
  error: null,
  data: null
});

// Mejor aún - Custom Hook (Facade)
const { data, loading, error } = useUserData(userId);`,
        },
        {
            pattern: /<[A-Z][^>]*\s+\w+={{[^}]+}}/g,
            issue: 'Objeto inline como prop',
            recommendation:
                'Usa useMemo para evitar re-renders innecesarios (Memoization)',
            severity: 'high' as const,
            explanation:
                'Objetos inline crean nuevas referencias en cada render, causando re-renders.',
            codeExample: `// ❌ Mal
<Component config={{ theme: 'dark', size: 'lg' }} />

// ✅ Bien
const config = useMemo(() => ({ theme: 'dark', size: 'lg' }), []);
<Component config={config} />`,
        },
        {
            pattern: /\.map\([^)]*=>\s*<[^>]+onClick={[^}]*=>/g,
            issue: 'Función inline en map',
            recommendation:
                'Usa useCallback para funciones en listas (Command Pattern)',
            severity: 'high' as const,
            designPattern: 'Command Pattern',
            codeExample: `// ❌ Mal
{items.map(item => (
  <Item onClick={() => handleClick(item.id)} />
))}

// ✅ Bien
const handleItemClick = useCallback((id: string) => {
  handleClick(id);
}, [handleClick]);

{items.map(item => (
  <Item onClick={() => handleItemClick(item.id)} />
))}`,
        },
    ],

    // Testing & Quality
    testingPatterns: [
        {
            pattern: /\.test\.(tsx?|jsx?)|\.spec\.(tsx?|jsx?)/g,
            issue: 'Tests detectados',
            recommendation: '✅ Implementando tests (excelente práctica)',
            severity: 'good' as const,
        },
        {
            pattern: /export\s+(?:function|const|class)\s+\w+/g,
            issue: 'Función/clase sin tests',
            recommendation:
                'Considera agregar tests unitarios para esta función',
            severity: 'low' as const,
            explanation:
                'Los tests aseguran que el código funciona y facilitan refactoring seguro.',
        },
    ],
}

// ============================================================================
// ANÁLISIS DE ARQUITECTURA
// ============================================================================

function analyzeArchitecture(
    content: string,
    filepath: string,
): AnalysisIssue[] {
    const issues: AnalysisIssue[] = []

    // Detectar capa de arquitectura
    const layer = detectArchitectureLayer(filepath)

    // Analizar todos los patrones
    Object.entries(cleanArchitecturePatterns).forEach(([category, patterns]) => {
        patterns.forEach((pattern) => {
            const matches = content.match(pattern.pattern)
            if (matches && matches.length > 0) {
                issues.push({
                    category,
                    issue: pattern.issue,
                    recommendation: pattern.recommendation,
                    severity: pattern.severity,
                    occurrences: matches.length,
                    explanation: pattern.explanation,
                    designPattern: pattern.designPattern,
                    architectureLayer: pattern.architectureLayer || layer,
                    codeExample: pattern.codeExample,
                    resources: pattern.resources,
                })
            }
        })
    })

    // Análisis adicional de Clean Code
    issues.push(...analyzeCleanCode(content, filepath))

    return issues
}

function detectArchitectureLayer(filepath: string): string {
    if (filepath.includes('/domain/') || filepath.includes('/entities/'))
        return 'Domain Layer'
    if (filepath.includes('/usecases/') || filepath.includes('/application/'))
        return 'Application Layer'
    if (
        filepath.includes('/infrastructure/') ||
        filepath.includes('/repositories/')
    )
        return 'Infrastructure Layer'
    if (
        filepath.includes('/presentation/') ||
        filepath.includes('/components/')
    )
        return 'Presentation Layer'
    return 'Unknown Layer'
}

function analyzeCleanCode(content: string, filepath: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = []

    // Nombres descriptivos
    const shortVarNames = content.match(/\b[a-z]\b(?!\s*=>)/g)
    if (shortVarNames && shortVarNames.length > 5) {
        issues.push({
            category: 'cleanCode',
            issue: 'Variables con nombres de una letra',
            recommendation: 'Usa nombres descriptivos que revelen intención',
            severity: 'medium',
            occurrences: shortVarNames.length,
            explanation:
                'Clean Code: El código se lee más que se escribe. Los nombres deben revelar la intención.',
            codeExample: `// ❌ Mal
const u = getUser();
const d = new Date();

// ✅ Bien
const currentUser = getUser();
const createdAt = new Date();`,
        })
    }

    // Funciones largas
    const functions = content.match(/function\s+\w+[^}]+\{[^}]+\}/gs) || []
    functions.forEach((func) => {
        const lines = func.split('\n').length
        if (lines > 20) {
            issues.push({
                category: 'cleanCode',
                issue: `Función con ${lines} líneas`,
                recommendation:
                    'Las funciones deben hacer una sola cosa. Divide en funciones más pequeñas',
                severity: 'high',
                occurrences: 1,
                explanation:
                    'Una función debe caber en una pantalla y hacer una sola cosa bien.',
            })
        }
    })

    // Comentarios excesivos
    const commentLines = (content.match(/\/\/.+/g) || []).length
    const codeLines = content.split('\n').length
    if (commentLines > codeLines * 0.3) {
        issues.push({
            category: 'cleanCode',
            issue: 'Demasiados comentarios',
            recommendation:
                'El código debe ser auto-explicativo. Refactoriza en lugar de comentar',
            severity: 'low',
            occurrences: commentLines,
            explanation:
                'Clean Code: Los comentarios son una forma de fracaso. El código debe explicarse por sí mismo.',
        })
    }

    // Magic numbers
    const magicNumbers = content.match(/\b\d{2,}\b(?![.]\d)/g)
    if (magicNumbers && magicNumbers.length > 3) {
        issues.push({
            category: 'cleanCode',
            issue: 'Números mágicos detectados',
            recommendation: 'Usa constantes con nombres descriptivos',
            severity: 'medium',
            occurrences: magicNumbers.length,
            codeExample: `// ❌ Mal
if (age > 18) { }
setTimeout(callback, 3600000);

// ✅ Bien
const LEGAL_AGE = 18;
const ONE_HOUR_MS = 60 * 60 * 1000;
if (age > LEGAL_AGE) { }
setTimeout(callback, ONE_HOUR_MS);`,
        })
    }

    return issues
}

// ============================================================================
// SUGERENCIAS DE ARQUITECTURA
// ============================================================================

function generateArchitectureSuggestions(
    issues: AnalysisIssue[],
): ArchitectureSuggestion[] {
    const suggestions: ArchitectureSuggestion[] = []

    // Sugerir Clean Architecture
    const hasRepositoryIssues = issues.some((i) =>
        i.issue.includes('HTTP directa'),
    )
    if (hasRepositoryIssues) {
        suggestions.push({
            title: 'Implementar Patrón Repository',
            description:
                'Abstrae el acceso a datos para independencia de la fuente',
            pattern: 'Repository Pattern',
            benefit:
                'Permite cambiar de API REST a GraphQL o base de datos local sin cambiar la lógica de negocio',
            implementation: `1. Crea una interfaz IRepository en el dominio
2. Implementa repositorios concretos en infrastructure
3. Inyecta el repositorio en los casos de uso
4. Usa el repositorio en lugar de fetch/axios`,
            example: `// domain/repositories/IUserRepository.ts
export interface IUserRepository {
  getById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

// infrastructure/repositories/UserApiRepository.ts
export class UserApiRepository implements IUserRepository {
  constructor(private http: IHttpClient) {}

  async getById(id: string): Promise<User> {
    return this.http.get(\`/users/\${id}\`);
  }

  async save(user: User): Promise<void> {
    await this.http.post('/users', user);
  }
}`,
        })
    }

    // Sugerir Dependency Injection
    const hasNewInstances = issues.some((i) => i.issue.includes('new'))
    if (hasNewInstances) {
        suggestions.push({
            title: 'Implementar Dependency Injection',
            description: 'Invierte las dependencias para código más testeable',
            pattern: 'Dependency Injection',
            benefit:
                'Facilita testing con mocks, reduce acoplamiento y mejora mantenibilidad',
            implementation: `1. Define interfaces para todas las dependencias
2. Usa un contenedor de DI (como tsyringe o InversifyJS)
3. Inyecta dependencias en constructores
4. Registra implementaciones en el contenedor`,
            example: `// Usando tsyringe
import { injectable, inject, container } from 'tsyringe';

@injectable()
export class LoginUseCase {
  constructor(
    @inject('IAuthRepository') private authRepo: IAuthRepository,
    @inject('ITokenService') private tokenService: ITokenService
  ) {}

  async execute(email: string, password: string) {
    const user = await this.authRepo.authenticate(email, password);
    const token = this.tokenService.generate(user);
    return { user, token };
  }
}

// Registro
container.register('IAuthRepository', { useClass: AuthApiRepository });
container.register('ITokenService', { useClass: JwtTokenService });`,
        })
    }

    // Sugerir separación de capas
    if (issues.some((i) => i.severity === 'critical')) {
        suggestions.push({
            title: 'Estructura de Clean Architecture',
            description: 'Organiza el código en capas con dependencias claras',
            pattern: 'Clean Architecture Layers',
            benefit:
                'Código mantenible, testeable e independiente de frameworks',
            implementation: `src/
├── domain/                 # Capa interna (sin dependencias)
│   ├── entities/          # Modelos de negocio
│   ├── repositories/      # Interfaces de repos
│   └── value-objects/     # Objetos de valor
├── application/           # Casos de uso
│   └── use-cases/
├── infrastructure/        # Implementaciones
│   ├── repositories/      # Repos concretos
│   ├── services/          # Servicios externos
│   └── http/              # Cliente HTTP
└── presentation/          # UI (React/Next.js)
    ├── components/
    ├── hooks/             # Adaptadores a casos de uso
    └── pages/`,
            example: `// Flujo de dependencias:
// Presentation -> Application -> Domain
// Infrastructure -> Domain (implementa interfaces)

// ❌ Mal: Dependencias incorrectas
// Domain depende de Infrastructure

// ✅ Bien: Domain es el centro
// Todos dependen del Domain, Domain no depende de nadie`,
        })
    }

    return suggestions
}

// ============================================================================
// SCORING
// ============================================================================

function calculateScores(issues: AnalysisIssue[]): {
    architecture: number
    cleanCode: number
} {
    const total = issues.length || 1
    const critical = issues.filter((i) => i.severity === 'critical').length
    const high = issues.filter((i) => i.severity === 'high').length
    const medium = issues.filter((i) => i.severity === 'medium').length
    const good = issues.filter((i) => i.severity === 'good').length

    // Score de arquitectura (0-100)
    const architecture = Math.max(
        0,
        100 - critical * 25 - high * 15 - medium * 5 + good * 5,
    )

    // Score de clean code (0-100)
    const cleanCodeIssues = issues.filter((i) => i.category === 'cleanCode')
    const cleanCode = Math.max(
        0,
        100 - cleanCodeIssues.length * 10 + good * 3,
    )

    return { architecture, cleanCode }
}

// ============================================================================
// HANDLERS
// ============================================================================

function configurarGitHub(token: string): string {
    octokit = new Octokit({ auth: token })
    return '✅ Token de GitHub configurado correctamente'
}

async function listarArchivosReact(
    owner: string,
    repo: string,
    path: string = '',
): Promise<string[]> {
    if (!octokit) {
        throw new Error(
            "Primero debes configurar el token de GitHub usando 'configurar_github'",
        )
    }

    const { data } = await octokit.repos.getContent({ owner, repo, path })
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
                try {
                    const { data: subItems } = await octokit.repos.getContent({
                        owner,
                        repo,
                        path: item.path,
                    })
                    if (Array.isArray(subItems)) {
                        await processItems(subItems)
                    }
                } catch (error) {
                    console.error(`Error procesando ${item.path}:`, error)
                }
            }
        }
    }

    if (Array.isArray(data)) {
        await processItems(data)
    }

    return reactFiles
}

async function analizarArchivo(
    owner: string,
    repo: string,
    path: string,
    branch: string = 'main',
): Promise<FileAnalysisResult> {
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
    const issues = analyzeArchitecture(content, path)
    const scores = calculateScores(issues)
    const suggestions = generateArchitectureSuggestions(issues)

    return {
        file: path,
        totalIssues: issues.length,
        issues,
        summary: generateSummary(issues),
        architectureScore: scores.architecture,
        cleanCodeScore: scores.cleanCode,
        suggestions,
    }
}

async function analizarRepositorio(
    owner: string,
    repo: string,
    branch: string = 'main',
) {
    const files = await listarArchivosReact(owner, repo)
    const results: FileAnalysisResult[] = []

    // Analizar hasta 30 archivos
    for (const file of files.slice(0, 30)) {
        try {
            const analysis = await analizarArchivo(owner, repo, file, branch)
            results.push(analysis)
        } catch (error) {
            console.error(`Error analizando ${file}:`, error)
        }
    }

    const allIssues = results.flatMap((r) => r.issues)
    const avgArchScore =
        results.reduce((sum, r) => sum + r.architectureScore, 0) /
            results.length || 0
    const avgCleanScore =
        results.reduce((sum, r) => sum + r.cleanCodeScore, 0) /
            results.length || 0

    // Agrupar sugerencias por patrón
    const allSuggestions = results.flatMap((r) => r.suggestions)
    const uniqueSuggestions = allSuggestions.reduce((acc, sug) => {
        if (!acc.find((s) => s.pattern === sug.pattern)) {
            acc.push(sug)
        }
        return acc
    }, [] as ArchitectureSuggestion[])

    // Top issues del repositorio
    const topIssues = getTopIssues(allIssues)

    // Recomendaciones de arquitectura general
    const architectureRecommendations = generateRepositoryRecommendations(
        allIssues,
        files,
    )

    return {
        repository: `${owner}/${repo}`,
        filesAnalyzed: results.length,
        totalFiles: files.length,
        scores: {
            architecture: Math.round(avgArchScore),
            cleanCode: Math.round(avgCleanScore),
            overall: Math.round((avgArchScore + avgCleanScore) / 2),
        },
        summary: generateSummary(allIssues),
        topIssues,
        architectureRecommendations,
        designPatternSuggestions: uniqueSuggestions,
        fileResults: results.slice(0, 10), // Primeros 10 para no saturar
        criticalFiles: results
            .filter((r) => r.architectureScore < 50)
            .map((r) => ({
                file: r.file,
                score: r.architectureScore,
                criticalIssues: r.issues.filter((i) => i.severity === 'critical')
                    .length,
            })),
    }
}

async function sugerirArquitectura(
    owner: string,
    repo: string,
    projectType: string = 'web',
) {
    const files = await listarArchivosReact(owner, repo)

    const structure = {
        web: {
            title: 'Clean Architecture para Web App (Next.js/React)',
            description:
                'Estructura modular y escalable para aplicaciones web',
            structure: `src/
├── core/                          # Núcleo de la aplicación
│   ├── domain/                    # Lógica de negocio pura
│   │   ├── entities/              # Entidades del dominio
│   │   │   └── User.ts
│   │   ├── value-objects/         # Objetos de valor inmutables
│   │   │   └── Email.ts
│   │   ├── repositories/          # Contratos de repositorios
│   │   │   └── IUserRepository.ts
│   │   └── errors/                # Errores de dominio
│   │       └── DomainError.ts
│   │
│   ├── application/               # Casos de uso
│   │   ├── use-cases/
│   │   │   ├── user/
│   │   │   │   ├── CreateUser.ts
│   │   │   │   ├── GetUser.ts
│   │   │   │   └── UpdateUser.ts
│   │   └── dtos/                  # Data Transfer Objects
│   │       └── UserDTO.ts
│   │
│   └── infrastructure/            # Implementaciones técnicas
│       ├── repositories/
│       │   └── UserApiRepository.ts
│       ├── http/
│       │   ├── HttpClient.ts
│       │   └── AxiosHttpClient.ts
│       ├── cache/
│       │   └── LocalStorageCache.ts
│       └── config/
│           └── dependencyInjection.ts
│
├── presentation/                  # Capa de presentación
│   ├── components/
│   │   ├── ui/                    # Componentes de UI puros
│   │   ├── features/              # Componentes por feature
│   │   └── layouts/
│   ├── hooks/                     # React hooks (adaptadores)
│   │   └── useUser.ts
│   ├── pages/                     # Next.js pages
│   └── styles/
│
├── shared/                        # Código compartido
│   ├── utils/
│   ├── constants/
│   └── types/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/`,
            benefits: [
                '✅ Independencia de frameworks: Cambiar React/Next.js sin tocar lógica',
                '✅ Testeable: Lógica de negocio 100% testeable sin UI',
                '✅ Mantenible: Cada capa tiene responsabilidad clara',
                '✅ Escalable: Fácil agregar features sin romper existentes',
                '✅ Reusable: Lógica compartible entre web, mobile, etc.',
            ],
            implementation: [
                '1. Identifica las entidades de tu dominio',
                '2. Define casos de uso como clases o funciones puras',
                '3. Crea interfaces para dependencias externas',
                '4. Implementa repositorios y servicios en infrastructure',
                '5. Conecta UI con casos de uso mediante hooks',
            ],
        },
        api: {
            title: 'Clean Architecture para API REST',
            description: 'Backend escalable y mantenible',
            structure: `src/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── services/              # Servicios de dominio
│
├── application/
│   ├── use-cases/
│   └── validators/            # Validación de input
│
├── infrastructure/
│   ├── database/
│   │   ├── repositories/
│   │   └── models/            # Modelos de DB
│   ├── http/
│   │   └── middlewares/
│   └── external-services/
│
└── presentation/
    ├── controllers/
    ├── routes/
    └── dtos/`,
        },
        fullstack: {
            title: 'Clean Architecture Full-Stack',
            description: 'Monorepo con frontend y backend desacoplados',
            structure: `apps/
├── web/                       # Frontend (Next.js)
│   └── src/ (estructura web)
│
└── api/                       # Backend (Express/Fastify)
    └── src/ (estructura api)

packages/
├── domain/                    # Compartido entre apps
│   ├── entities/
│   └── value-objects/
│
├── shared/                    # Utils compartidos
│   └── types/
│
└── ui/                        # Componentes compartidos
    └── design-system/`,
        },
    }

    const suggestion = structure[projectType as keyof typeof structure] || structure.web

    return {
        projectType,
        currentFiles: files.length,
        recommendation: suggestion,
        nextSteps: [
            '1. Crea la estructura de carpetas propuesta',
            '2. Migra código existente capa por capa (empieza por domain)',
            '3. Implementa Dependency Injection',
            '4. Escribe tests para casos de uso',
            '5. Refactoriza componentes para usar casos de uso',
        ],
        resources: [
            '📚 Clean Architecture - Robert C. Martin',
            '📚 Domain-Driven Design - Eric Evans',
            '📺 https://youtu.be/CnailTcJV_U (Clean Architecture explanation)',
            '📝 https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html',
        ],
    }
}

function explicarPatron(patron: string) {
    const patrones: Record<string, any> = {
        repository: {
            nombre: 'Repository Pattern',
            descripcion:
                'Abstrae el acceso a datos, permitiendo cambiar la fuente sin afectar la lógica de negocio',
            cuandoUsar: [
                'Cuando consumes APIs REST',
                'Cuando quieres poder cambiar de API a GraphQL',
                'Cuando necesitas cachear datos',
                'Cuando quieres testear sin hacer llamadas reales',
            ],
            ventajas: [
                'Desacopla la lógica de la fuente de datos',
                'Facilita testing con mocks',
                'Centraliza la lógica de acceso a datos',
                'Permite implementar caché transparentemente',
            ],
            implementacion: `// 1. Define la interfaz (Domain Layer)
export interface IUserRepository {
  getById(id: string): Promise<User>;
  getAll(): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// 2. Implementación con API (Infrastructure)
export class UserApiRepository implements IUserRepository {
  constructor(private httpClient: IHttpClient) {}

  async getById(id: string): Promise<User> {
    const response = await this.httpClient.get<UserDTO>(\`/users/\${id}\`);
    return UserMapper.toDomain(response);
  }

  async getAll(): Promise<User[]> {
    const response = await this.httpClient.get<UserDTO[]>('/users');
    return response.map(UserMapper.toDomain);
  }

  async save(user: User): Promise<void> {
    const dto = UserMapper.toDTO(user);
    await this.httpClient.post('/users', dto);
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(\`/users/\${id}\`);
  }
}

// 3. Uso en caso de uso
export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    return this.userRepository.getById(userId);
  }
}

// 4. Inyección en React
const userRepository = new UserApiRepository(httpClient);
const getUserUseCase = new GetUserUseCase(userRepository);

function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUserUseCase.execute(id).then(setUser);
  }, [id]);

  return user;
}`,
            ejemplo_real: `// Puedes tener múltiples implementaciones:

// Para producción
class UserApiRepository implements IUserRepository { /* API real */ }

// Para tests
class UserMockRepository implements IUserRepository {
  async getById(id: string) {
    return new User('test@example.com', 'Test User');
  }
}

// Para desarrollo offline
class UserLocalRepository implements IUserRepository {
  async getById(id: string) {
    const data = localStorage.getItem(\`user-\${id}\`);
    return data ? JSON.parse(data) : null;
  }
}

// Caché automático
class UserCachedRepository implements IUserRepository {
  constructor(
    private repository: IUserRepository,
    private cache: ICache
  ) {}

  async getById(id: string): Promise<User> {
    const cached = this.cache.get(\`user-\${id}\`);
    if (cached) return cached;

    const user = await this.repository.getById(id);
    this.cache.set(\`user-\${id}\`, user);
    return user;
  }
}`,
        },
        factory: {
            nombre: 'Factory Pattern',
            descripcion:
                'Encapsula la creación de objetos complejos, separando construcción de uso',
            cuandoUsar: [
                'Cuando crear un objeto requiere lógica compleja',
                'Cuando tienes múltiples tipos relacionados',
                'Cuando necesitas decidir qué clase instanciar en runtime',
            ],
            implementacion: `// Problema: Creación compleja y repetida
function createUser(data: any) {
  if (!data.email.includes('@')) throw new Error('Email inválido');
  if (data.age < 18) throw new Error('Menor de edad');
  return new User(data.email, data.name, data.age);
}

// Solución: Factory
export class UserFactory {
  static create(data: CreateUserDTO): User {
    this.validate(data);
    return new User(
      Email.create(data.email),
      data.name,
      data.age
    );
  }

  static createAdmin(data: CreateUserDTO): Admin {
    this.validate(data);
    return new Admin(
      Email.create(data.email),
      data.name,
      data.age,
      ['ALL_PERMISSIONS']
    );
  }

  private static validate(data: CreateUserDTO): void {
    if (!data.email) throw new DomainError('Email requerido');
    if (data.age < 18) throw new DomainError('Menor de edad');
  }
}

// Uso
const user = UserFactory.create({ email: 'john@example.com', name: 'John', age: 25 });
const admin = UserFactory.createAdmin({ email: 'admin@example.com', name: 'Admin', age: 30 });`,
        },
        strategy: {
            nombre: 'Strategy Pattern',
            descripcion:
                'Define una familia de algoritmos intercambiables, permitiendo cambiarlos en runtime',
            cuandoUsar: [
                'Cuando tienes múltiples if/else o switch',
                'Cuando diferentes clases difieren solo en comportamiento',
                'Cuando necesitas seleccionar algoritmo en runtime',
            ],
            implementacion: `// Problema: Condicionales repetitivos
function calculateShipping(type: string, weight: number): number {
  if (type === 'standard') return weight * 5;
  if (type === 'express') return weight * 10 + 15;
  if (type === 'overnight') return weight * 20 + 30;
  throw new Error('Tipo desconocido');
}

// Solución: Strategy Pattern
interface IShippingStrategy {
  calculate(weight: number): number;
  getEstimatedDays(): number;
}

class StandardShipping implements IShippingStrategy {
  calculate(weight: number): number {
    return weight * 5;
  }

  getEstimatedDays(): number {
    return 7;
  }
}

class ExpressShipping implements IShippingStrategy {
  calculate(weight: number): number {
    return weight * 10 + 15;
  }

  getEstimatedDays(): number {
    return 3;
  }
}

class OvernightShipping implements IShippingStrategy {
  calculate(weight: number): number {
    return weight * 20 + 30;
  }

  getEstimatedDays(): number {
    return 1;
  }
}

// Context
class ShippingCalculator {
  constructor(private strategy: IShippingStrategy) {}

  setStrategy(strategy: IShippingStrategy): void {
    this.strategy = strategy;
  }

  calculateCost(weight: number): number {
    return this.strategy.calculate(weight);
  }

  getDeliveryTime(): number {
    return this.strategy.getEstimatedDays();
  }
}

// Uso
const calculator = new ShippingCalculator(new StandardShipping());
console.log(calculator.calculateCost(10)); // 50

calculator.setStrategy(new ExpressShipping());
console.log(calculator.calculateCost(10)); // 115

// En React
function CheckoutForm() {
  const [strategy, setStrategy] = useState<IShippingStrategy>(
    new StandardShipping()
  );

  const calculator = useMemo(
    () => new ShippingCalculator(strategy),
    [strategy]
  );

  return (
    <div>
      <select onChange={(e) => {
        const strategies = {
          standard: new StandardShipping(),
          express: new ExpressShipping(),
          overnight: new OvernightShipping(),
        };
        setStrategy(strategies[e.target.value]);
      }}>
        <option value="standard">Standard</option>
        <option value="express">Express</option>
        <option value="overnight">Overnight</option>
      </select>

      <p>Costo: ${calculator.calculateCost(weight)}</p>
      <p>Días: {calculator.getDeliveryTime()}</p>
    </div>
  );
}`,
        },
        observer: {
            nombre: 'Observer Pattern',
            descripcion:
                'Define una dependencia uno-a-muchos para notificar cambios automáticamente',
            cuandoUsar: [
                'Cuando un cambio afecta múltiples objetos',
                'Cuando necesitas event-driven architecture',
                'Cuando quieres desacoplar emisores de receptores',
            ],
            implementacion: `// Implementación básica
interface IObserver {
  update(data: any): void;
}

interface ISubject {
  attach(observer: IObserver): void;
  detach(observer: IObserver): void;
  notify(): void;
}

class UserStore implements ISubject {
  private observers: IObserver[] = [];
  private user: User | null = null;

  attach(observer: IObserver): void {
    this.observers.push(observer);
  }

  detach(observer: IObserver): void {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notify(): void {
    for (const observer of this.observers) {
      observer.update(this.user);
    }
  }

  setUser(user: User): void {
    this.user = user;
    this.notify();
  }
}

// Observers
class UserProfileObserver implements IObserver {
  update(user: User): void {
    console.log('Actualizando perfil:', user);
  }
}

class UserAnalyticsObserver implements IObserver {
  update(user: User): void {
    console.log('Enviando a analytics:', user);
  }
}

// Uso
const store = new UserStore();
store.attach(new UserProfileObserver());
store.attach(new UserAnalyticsObserver());

store.setUser(newUser); // Notifica a todos

// En React (más simple con hooks)
function createEventEmitter<T>() {
  const listeners = new Set<(data: T) => void>();

  return {
    subscribe(listener: (data: T) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit(data: T) {
      listeners.forEach(listener => listener(data));
    }
  };
}

const userEvents = createEventEmitter<User>();

function ProfileComponent() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return userEvents.subscribe(setUser);
  }, []);

  return <div>{user?.name}</div>;
}

function LoginButton() {
  const login = () => {
    const user = authenticate();
    userEvents.emit(user); // Notifica a todos los componentes
  };

  return <button onClick={login}>Login</button>;
}`,
        },
    }

    const pattern = patrones[patron.toLowerCase()]

    if (!pattern) {
        const available = Object.keys(patrones).join(', ')
        return {
            error: `Patrón "${patron}" no encontrado`,
            disponibles: available,
            sugerencia: `Prueba con: ${available}`,
        }
    }

    return pattern
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function generateSummary(issues: AnalysisIssue[]): Summary {
    const bySeverity = issues.reduce((acc: any, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1
        return acc
    }, {})

    return {
        total: issues.length,
        critical: bySeverity.critical || 0,
        high: bySeverity.high || 0,
        medium: bySeverity.medium || 0,
        low: bySeverity.low || 0,
        good: bySeverity.good || 0,
    }
}

function getTopIssues(issues: AnalysisIssue[]) {
    const issueCount = issues.reduce((acc: any, issue) => {
        const key = `${issue.issue} | ${issue.severity}`
        if (!acc[key]) {
            acc[key] = {
                issue: issue.issue,
                severity: issue.severity,
                count: 0,
                recommendation: issue.recommendation,
                designPattern: issue.designPattern,
            }
        }
        acc[key].count += issue.occurrences
        return acc
    }, {})

    return Object.values(issueCount)
        .sort((a: any, b: any) => {
            const severityOrder = {
                critical: 4,
                high: 3,
                medium: 2,
                low: 1,
                info: 0,
            }
            if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                return severityOrder[b.severity] - severityOrder[a.severity]
            }
            return b.count - a.count
        })
        .slice(0, 15)
}

function generateRepositoryRecommendations(
    issues: AnalysisIssue[],
    files: string[],
): string[] {
    const recommendations: string[] = []

    // Análisis de estructura
    const hasLayeredStructure =
        files.some((f) => f.includes('/domain/')) &&
        files.some((f) => f.includes('/application/')) &&
        files.some((f) => f.includes('/infrastructure/'))

    if (!hasLayeredStructure) {
        recommendations.push(
            '🏗️ CRÍTICO: Implementa una estructura de Clean Architecture con capas separadas (domain, application, infrastructure, presentation)',
        )
    }

    // Análisis de dependencias
    const criticalIssues = issues.filter((i) => i.severity === 'critical')
    if (criticalIssues.length > 5) {
        recommendations.push(
            '⚠️ ALTA PRIORIDAD: Refactoriza las violaciones críticas de SOLID. Comienza por separar responsabilidades.',
        )
    }

    // Patrones faltantes
    const hasRepositories = issues.some(
        (i) =>
            i.issue.includes('Repository') && i.severity === 'good',
    )
    if (!hasRepositories) {
        recommendations.push(
            '📦 Implementa el patrón Repository para abstraer el acceso a datos',
        )
    }

    const hasDI = files.some(
        (f) =>
            f.includes('dependency') ||
            f.includes('injection') ||
            f.includes('container'),
    )
    if (!hasDI) {
        recommendations.push(
            '💉 Implementa Dependency Injection para mejorar testability y desacoplamiento',
        )
    }

    // Testing
    const hasTests = files.some((f) => f.includes('.test.') || f.includes('.spec.'))
    if (!hasTests) {
        recommendations.push(
            '🧪 FUNDAMENTAL: Agrega tests unitarios, especialmente para casos de uso y entidades de dominio',
        )
    }

    // Clean Code
    const cleanCodeIssues = issues.filter((i) => i.category === 'cleanCode')
    if (cleanCodeIssues.length > 20) {
        recommendations.push(
            '📖 Mejora la calidad del código: nombres descriptivos, funciones pequeñas, elimina números mágicos',
        )
    }

    return recommendations
}

// ============================================================================
// CONFIGURACIÓN DE HANDLERS
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    console.error(`🔧 [${new Date().toISOString()}] Herramienta: ${name}`)

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

            case 'sugerir_arquitectura':
                result = await sugerirArquitectura(
                    args?.owner as string,
                    args?.repo as string,
                    args?.projectType as string,
                )
                break

            case 'explicar_patron':
                result = explicarPatron(args?.patron as string)
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

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

async function main() {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error('🚀 GitHub Code Mentor MCP Server v2.0 iniciado')
    console.error('🎓 Guiando en Clean Architecture y mejores prácticas')
    console.error('📡 Esperando conexiones de Claude Desktop...')
}

main().catch((error) => {
    console.error('Error fatal:', error)
    process.exit(1)
})
