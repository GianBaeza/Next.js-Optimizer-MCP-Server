import type { AnalysisPattern } from '../types/index.js'

/**
 * Patrones para detectar violaciones de principios SOLID
 */

export const solidPrinciples: AnalysisPattern[] = [
    // Single Responsibility Principle
    {
        pattern:
            /class\s+\w+\s*{[^}]*(?:fetch|axios|console|localStorage){2,}/gs,
        issue: 'Violación del SRP (Single Responsibility Principle)',
        recommendation:
            'Esta clase tiene múltiples responsabilidades. Sepáralas en clases diferentes',
        severity: 'critical',
        explanation:
            'SRP: Una clase debe tener una sola razón para cambiar. Si hace HTTP, logging y storage, tiene 3 razones para cambiar.',
        designPattern: 'Single Responsibility Principle',
        codeExample: `//  Mal - Múltiples responsabilidades
class UserService {
  async getUser(id: string) {
    console.log('Getting user...');
    const data = await fetch(\`/api/users/\${id}\`);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  }
}

//  Bien - Responsabilidades separadas
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

    // Open/Closed Principle
    {
        pattern:
            /if\s*\([^)]*===\s*['"][^'"]+['"]\)\s*{[^}]*return[^}]*}\s*else\s*if/g,
        issue: 'Posible violación del OCP (Open/Closed Principle)',
        recommendation:
            'Considera usar Strategy Pattern o polimorfismo para extensibilidad',
        severity: 'medium',
        explanation:
            'OCP: Las clases deben estar abiertas para extensión pero cerradas para modificación. Los múltiples if/else sugieren que necesitarás modificar la clase para nuevos casos.',
        designPattern: 'Strategy Pattern',
        codeExample: `//  Mal - Violar OCP
function calculateDiscount(customerType: string, amount: number) {
  if (customerType === 'regular') {
    return amount * 0.05;
  } else if (customerType === 'premium') {
    return amount * 0.10;
  } else if (customerType === 'vip') {
    return amount * 0.15;
  }
  // Para agregar un nuevo tipo, hay que modificar esta función
}

//  Bien - Cumplir OCP
interface DiscountStrategy {
  calculate(amount: number): number;
}

class RegularDiscount implements DiscountStrategy {
  calculate(amount: number): number {
    return amount * 0.05;
  }
}

class PremiumDiscount implements DiscountStrategy {
  calculate(amount: number): number {
    return amount * 0.10;
  }
}

class DiscountCalculator {
  constructor(private strategy: DiscountStrategy) {}

  calculate(amount: number): number {
    return this.strategy.calculate(amount);
  }
}`,
    },

    // Interface Segregation Principle
    {
        pattern: /interface\s+\w+\s*{[^}]{200,}}/gs,
        issue: 'Interface muy grande - posible violación del ISP',
        recommendation:
            'Divide en interfaces más específicas (Interface Segregation Principle)',
        severity: 'medium',
        explanation:
            'ISP: Los clientes no deben depender de interfaces que no usan. Las interfaces grandes fuerzan a implementar métodos innecesarios.',
        designPattern: 'Interface Segregation Principle',
        codeExample: `//  Mal - Interface demasiado grande
interface UserService {
  // User management
  createUser(data: UserData): Promise<User>;
  updateUser(id: string, data: Partial<UserData>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Authentication
  login(email: string, password: string): Promise<AuthResult>;
  logout(token: string): Promise<void>;

  // Notifications
  sendEmail(userId: string, subject: string, body: string): Promise<void>;
  sendSMS(userId: string, message: string): Promise<void>;

  // Analytics
  trackUserAction(userId: string, action: string): Promise<void>;
  getUserAnalytics(userId: string): Promise<Analytics>;
}

//  Bien - Interfaces segregadas
interface IUserRepository {
  create(data: UserData): Promise<User>;
  update(id: string, data: Partial<UserData>): Promise<User>;
  delete(id: string): Promise<void>;
}

interface IAuthService {
  login(email: string, password: string): Promise<AuthResult>;
  logout(token: string): Promise<void>;
}

interface INotificationService {
  sendEmail(userId: string, subject: string, body: string): Promise<void>;
  sendSMS(userId: string, message: string): Promise<void>;
}`,
    },

    // Dependency Inversion Principle
    {
        pattern: /new\s+\w+\([^)]*\)\s*(?!.*inject|provide)/g,
        issue: 'Instanciación directa con "new"',
        recommendation:
            'Usa Dependency Injection para invertir dependencias (DIP)',
        severity: 'high',
        explanation:
            'DIP: Depende de abstracciones, no de concreciones. Inyecta dependencias en lugar de crearlas.',
        designPattern: 'Dependency Injection Pattern',
        codeExample: `//  Mal - Dependencia concreta
class UserController {
  private repository = new UserApiRepository(); // Dependencia concreta

  async getUsers() {
    return this.repository.getAll();
  }
}

//  Bien - Inyección de dependencias
class UserController {
  constructor(private repository: IUserRepository) {} // Dependencia abstracta

  async getUsers() {
    return this.repository.getAll();
  }
}

// Configuración de DI
const httpClient = new HttpClient();
const repository = new UserApiRepository(httpClient);
const controller = new UserController(repository);`,
    },

    // Liskov Substitution Principle
    {
        pattern: /class\s+\w+\s+extends\s+\w+\s*{[^}]*throw\s+new\s+Error/gs,
        issue: 'Posible violación del LSP (Liskov Substitution Principle)',
        recommendation:
            'Las subclases deben ser sustituibles por su clase base sin romper funcionalidad',
        severity: 'high',
        explanation:
            'LSP: Los objetos de una clase derivada deben poder reemplazar objetos de la clase base sin alterar el funcionamiento correcto del programa.',
        designPattern: 'Liskov Substitution Principle',
        codeExample: `//  Mal - Violar LSP
class Bird {
  fly(): void {
    console.log('Flying...');
  }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error('Penguins cannot fly!'); // Viola LSP
  }
}

//  Bien - Cumplir LSP
abstract class Bird {
  abstract move(): void;
}

class FlyingBird extends Bird {
  move(): void {
    this.fly();
  }

  private fly(): void {
    console.log('Flying...');
  }
}

class SwimmingBird extends Bird {
  move(): void {
    this.swim();
  }

  private swim(): void {
    console.log('Swimming...');
  }
}`,
    },
]
