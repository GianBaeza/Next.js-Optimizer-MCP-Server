import type { AnalysisPattern } from '../types/index.js'

/**
 * Patrones para detectar violaciones y buenas prácticas de Clean Architecture
 */

export const domainLayer: AnalysisPattern[] = [
    {
        pattern: /class\s+\w+\s*{[^}]*constructor[^}]*}[^}]*}/g,
        issue: 'Entidad de dominio sin validación',
        recommendation:
            'Las entidades deben validar su estado en el constructor',
        severity: 'high',
        explanation:
            'En Clean Architecture, las entidades del dominio deben ser auto-validantes. Esto asegura que nunca existan en un estado inválido.',
        designPattern: 'Domain Entity Pattern',
        architectureLayer: 'Domain Layer (Entities)',
        codeExample: `//  Mal
class User {
  constructor(public email: string, public age: number) {}
}

// Bien
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
        severity: 'info',
        explanation:
            'Las interfaces del dominio deben vivir en la capa más interna y no depender de frameworks externos.',
        architectureLayer: 'Domain Layer',
    },

    {
        pattern:
            /class\s+\w+(?:Entity|Model|Domain)\s*{[^}]*(?:import|require)[^}]*}/gs,
        issue: 'Entidad de dominio con dependencias externas',
        recommendation:
            'Las entidades de dominio no deben depender de librerías externas',
        severity: 'critical',
        explanation:
            'El dominio debe ser puro y no depender de frameworks, librerías o detalles de implementación.',
        architectureLayer: 'Domain Layer',
        codeExample: `// Mal
import axios from 'axios';
import { v4 as uuid } from 'uuid';

class UserEntity {
  constructor(private id: string = uuid()) {} // Dependencia externa

  async save() {
    await axios.post('/users', this); // Dependencia externa
  }
}

// Bien
class UserEntity {
  private constructor(private readonly id: string) {}

  static create(idGenerator: () => string): UserEntity {
    return new UserEntity(idGenerator());
  }

  getId(): string {
    return this.id;
  }

  // No tiene conocimiento de persistencia
}`,
    },
]

export const useCaseLayer: AnalysisPattern[] = [
    {
        pattern: /export\s+(?:function|const)\s+use\w+/g,
        issue: 'Hook personalizado detectado',
        recommendation:
            'Verifica que los hooks solo coordinen casos de uso, no contengan lógica de negocio',
        severity: 'medium',
        explanation:
            'Los hooks son adaptadores de la UI. La lógica de negocio debe estar en casos de uso puros que no dependan de React.',
        designPattern: 'Use Case Pattern',
        architectureLayer: 'Application Layer (Use Cases)',
        codeExample: `// Mal - Lógica en el hook
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

// Bien - Separación de responsabilidades
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
        severity: 'high',
        explanation:
            'Los casos de uso deben orquestar la lógica de negocio, no realizar llamadas HTTP directamente. Usa el patrón Repository.',
        designPattern: 'Repository Pattern',
        architectureLayer: 'Application Layer',
    },

    {
        pattern: /class\s+\w+UseCase\s*{[^}]*new\s+\w+/gs,
        issue: 'Caso de uso creando dependencias',
        recommendation:
            'Los casos de uso deben recibir dependencias por inyección',
        severity: 'high',
        explanation:
            'Los casos de uso no deben crear sus dependencias. Esto viola el principio de inversión de dependencias.',
        architectureLayer: 'Application Layer',
        codeExample: `// Mal
class CreateUserUseCase {
  async execute(userData: UserData) {
    const repository = new UserRepository(); // Creando dependencia
    const validator = new UserValidator(); // Creando dependencia

    validator.validate(userData);
    return repository.save(userData);
  }
}

// Bien
class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private validator: IUserValidator
  ) {}

  async execute(userData: UserData) {
    this.validator.validate(userData);
    return this.userRepository.save(userData);
  }
}`,
    },
]

export const infrastructureLayer: AnalysisPattern[] = [
    {
        pattern: /class\s+\w+Repository\s+(?:implements|extends)/g,
        issue: 'Repositorio detectado',
        recommendation: ' Implementando patrón Repository correctamente',
        severity: 'good',
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
        severity: 'high',
        explanation:
            'Las llamadas directas a APIs crean acoplamiento. Usa repositorios para abstraer la fuente de datos.',
        codeExample: `//  Mal - Llamada directa
const getUsers = async () => {
  const response = await fetch('/api/users');
  return response.json();
};

// Bien - Repositorio
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

    {
        pattern: /localStorage\.|sessionStorage\./g,
        issue: 'Acceso directo al storage del navegador',
        recommendation:
            'Crea un servicio de storage para abstraer la persistencia local',
        severity: 'medium',
        explanation:
            'El acceso directo al storage acopla el código al navegador. Un servicio permite cambiar la implementación.',
        architectureLayer: 'Infrastructure Layer',
        codeExample: `//  Mal
function saveUser(user: User) {
  localStorage.setItem('user', JSON.stringify(user));
}

//  Bien
interface IStorageService {
  save<T>(key: string, data: T): void;
  load<T>(key: string): T | null;
  remove(key: string): void;
}

class LocalStorageService implements IStorageService {
  save<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  load<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}`,
    },
]

export const presentationLayer: AnalysisPattern[] = [
    {
        pattern: /function\s+\w+Component\s*\([^)]*\)\s*{[\s\S]{200,}}/g,
        issue: 'Componente muy grande',
        recommendation:
            'Divide el componente en partes más pequeñas usando composición',
        severity: 'high',
        explanation:
            'Los componentes grandes son difíciles de mantener y testear. Aplica el principio de responsabilidad única.',
        designPattern: 'Composite Pattern',
        architectureLayer: 'Presentation Layer',
    },

    {
        pattern: /function\s+\w+\([^)]*\)\s*{[^}]*(?:fetch|axios)[^}]*}/g,
        issue: 'Componente haciendo llamadas HTTP directas',
        recommendation: 'Mueve las llamadas HTTP a custom hooks o servicios',
        severity: 'high',
        explanation:
            'Los componentes deben enfocarse en renderizado. Las llamadas a APIs deben estar en la capa de aplicación.',
        architectureLayer: 'Presentation Layer',
        codeExample: `//  Mal
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user/123')
      .then(res => res.json())
      .then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}

// Bien
// Hook personalizado
function useUser(id: string) {
  const [user, setUser] = useState(null);
  const getUserUseCase = useInjection('GetUserUseCase');

  useEffect(() => {
    getUserUseCase.execute(id).then(setUser);
  }, [id]);

  return user;
}

// Componente
function UserProfile({ userId }: { userId: string }) {
  const user = useUser(userId);

  return <div>{user?.name}</div>;
}`,
    },
]
