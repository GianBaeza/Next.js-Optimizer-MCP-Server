import type { AnalysisPattern } from '../types/index.js'

/**
 * Patrones de diseño clásicos adaptados para JavaScript/TypeScript
 */

export const designPatterns: AnalysisPattern[] = [
    // Factory Pattern
    {
        pattern: /class\s+\w+Factory/g,
        issue: 'Patrón Factory detectado',
        recommendation: '✅ Usando Factory Pattern para creación de objetos',
        severity: 'good',
        designPattern: 'Factory Pattern',
        explanation:
            'El patrón Factory encapsula la creación de objetos, proporcionando flexibilidad y desacoplamiento.',
        codeExample: `// Factory Pattern
interface IUser {
  getRole(): string;
}

class AdminUser implements IUser {
  getRole(): string { return 'admin'; }
}

class RegularUser implements IUser {
  getRole(): string { return 'user'; }
}

class UserFactory {
  static create(type: 'admin' | 'regular'): IUser {
    switch (type) {
      case 'admin':
        return new AdminUser();
      case 'regular':
        return new RegularUser();
      default:
        throw new Error('Unknown user type');
    }
  }
}

// Uso
const user = UserFactory.create('admin');`,
    },

    // Observer Pattern
    {
        pattern: /class\s+\w+(?:Observer|Subject|Publisher)/g,
        issue: 'Patrón Observer detectado',
        recommendation: '✅ Usando Observer Pattern para comunicación',
        severity: 'good',
        designPattern: 'Observer Pattern',
        explanation:
            'El patrón Observer permite notificación automática de cambios entre objetos.',
        codeExample: `// Observer Pattern
interface Observer {
  update(data: any): void;
}

class Subject {
  private observers: Observer[] = [];

  subscribe(observer: Observer): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: Observer): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(data: any): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

class UserObserver implements Observer {
  update(userData: any): void {
    console.log('User updated:', userData);
  }
}`,
    },

    // Strategy Pattern
    {
        pattern: /class\s+\w+Strategy/g,
        issue: 'Patrón Strategy detectado',
        recommendation:
            '✅ Usando Strategy Pattern para algoritmos intercambiables',
        severity: 'good',
        designPattern: 'Strategy Pattern',
        explanation:
            'El patrón Strategy permite intercambiar algoritmos dinámicamente.',
        codeExample: `// Strategy Pattern
interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardStrategy implements PaymentStrategy {
  pay(amount: number): void {
    console.log(\`Paid \$\${amount} with credit card\`);
  }
}

class PayPalStrategy implements PaymentStrategy {
  pay(amount: number): void {
    console.log(\`Paid \$\${amount} with PayPal\`);
  }
}

class PaymentContext {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  executePayment(amount: number): void {
    this.strategy.pay(amount);
  }
}`,
    },

    // Builder Pattern
    {
        pattern: /class\s+\w+Builder/g,
        issue: 'Patrón Builder detectado',
        recommendation: '✅ Usando Builder Pattern para construcción compleja',
        severity: 'good',
        designPattern: 'Builder Pattern',
        explanation:
            'El patrón Builder simplifica la construcción de objetos complejos.',
        codeExample: `// Builder Pattern
class User {
  constructor(
    public name: string,
    public email: string,
    public age?: number,
    public address?: string
  ) {}
}

class UserBuilder {
  private name!: string;
  private email!: string;
  private age?: number;
  private address?: string;

  setName(name: string): UserBuilder {
    this.name = name;
    return this;
  }

  setEmail(email: string): UserBuilder {
    this.email = email;
    return this;
  }

  setAge(age: number): UserBuilder {
    this.age = age;
    return this;
  }

  setAddress(address: string): UserBuilder {
    this.address = address;
    return this;
  }

  build(): User {
    return new User(this.name, this.email, this.age, this.address);
  }
}

// Uso
const user = new UserBuilder()
  .setName('John')
  .setEmail('john@example.com')
  .setAge(30)
  .build();`,
    },

    // Singleton Pattern (con advertencia)
    {
        pattern:
            /class\s+\w+(?:Singleton|Instance)\s*{[^}]*private\s+static[^}]*getInstance/gs,
        issue: 'Patrón Singleton detectado',
        recommendation:
            '⚠️ Usa Singleton con cuidado - puede dificultar testing',
        severity: 'medium',
        designPattern: 'Singleton Pattern',
        explanation:
            'El patrón Singleton asegura una sola instancia, pero puede crear dependencias globales difíciles de testear.',
        codeExample: `// ❌ Singleton tradicional (problemático para testing)
class DatabaseConnection {
  private static instance: DatabaseConnection;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}

// ✅ Mejor alternativa con DI
class DatabaseConnection {
  constructor() {}
}

// En el contenedor DI
container.registerSingleton('DatabaseConnection', DatabaseConnection);`,
    },

    // Command Pattern
    {
        pattern: /class\s+\w+Command/g,
        issue: 'Patrón Command detectado',
        recommendation: '✅ Usando Command Pattern para encapsular operaciones',
        severity: 'good',
        designPattern: 'Command Pattern',
        explanation:
            'El patrón Command encapsula operaciones como objetos, permitiendo undo/redo y queuing.',
        codeExample: `// Command Pattern
interface Command {
  execute(): void;
  undo(): void;
}

class CreateUserCommand implements Command {
  constructor(
    private userService: UserService,
    private userData: UserData
  ) {}

  execute(): void {
    this.userService.create(this.userData);
  }

  undo(): void {
    this.userService.delete(this.userData.id);
  }
}

class CommandInvoker {
  private history: Command[] = [];

  execute(command: Command): void {
    command.execute();
    this.history.push(command);
  }

  undo(): void {
    const command = this.history.pop();
    if (command) {
      command.undo();
    }
  }
}`,
    },

    // Adapter Pattern
    {
        pattern: /class\s+\w+Adapter/g,
        issue: 'Patrón Adapter detectado',
        recommendation: '✅ Usando Adapter Pattern para compatibilidad',
        severity: 'good',
        designPattern: 'Adapter Pattern',
        explanation:
            'El patrón Adapter permite que interfaces incompatibles trabajen juntas.',
        codeExample: `// Adapter Pattern
// Sistema legado
class LegacyPrinter {
  printOldFormat(text: string): void {
    console.log(\`Legacy: \${text}\`);
  }
}

// Interface moderna
interface ModernPrinter {
  print(document: Document): void;
}

// Adapter
class PrinterAdapter implements ModernPrinter {
  constructor(private legacyPrinter: LegacyPrinter) {}

  print(document: Document): void {
    const text = document.getText();
    this.legacyPrinter.printOldFormat(text);
  }
}

// Uso
const legacyPrinter = new LegacyPrinter();
const adapter = new PrinterAdapter(legacyPrinter);
adapter.print(document);`,
    },
]

export const antiPatterns: AnalysisPattern[] = [
    // God Object
    {
        pattern: /class\s+\w+\s*{[\s\S]{1000,}}/g,
        issue: 'Clase muy grande (God Object)',
        recommendation: 'Divide la clase en responsabilidades más específicas',
        severity: 'critical',
        explanation:
            'Las clases demasiado grandes violan el principio de responsabilidad única y son difíciles de mantener.',
        designPattern: 'Single Responsibility Principle',
        codeExample: `// ❌ God Object
class UserManager {
  // 1000+ líneas haciendo todo:
  // - Validación
  // - Persistencia
  // - Notificaciones
  // - Autenticación
  // - Logging
  // - etc...
}

// ✅ Separación de responsabilidades
class UserValidator { /* validación */ }
class UserRepository { /* persistencia */ }
class UserNotificationService { /* notificaciones */ }
class AuthenticationService { /* autenticación */ }
class Logger { /* logging */ }

class UserService {
  constructor(
    private validator: UserValidator,
    private repository: UserRepository,
    private notificationService: UserNotificationService
  ) {}
}`,
    },

    // Spaghetti Code
    {
        pattern:
            /if\s*\([^)]*\)\s*{[^}]*if\s*\([^)]*\)\s*{[^}]*if\s*\([^)]*\)\s*{/g,
        issue: 'Código espagueti con condicionales anidados',
        recommendation:
            'Usa early returns o patrón Strategy para reducir anidamiento',
        severity: 'high',
        explanation:
            'Los condicionales profundamente anidados son difíciles de leer y mantener.',
        codeExample: `// ❌ Código espagueti
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        if (user.isVerified) {
          // lógica...
        }
      }
    }
  }
}

// ✅ Early returns
function processUser(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.hasPermission) return;
  if (!user.isVerified) return;

  // lógica...
}`,
    },

    // Magic Numbers/Strings
    {
        pattern: /\b\d{2,}\b(?![.]\d)|["']\w{10,}["']/g,
        issue: 'Números/strings mágicos detectados',
        recommendation: 'Usa constantes con nombres descriptivos',
        severity: 'medium',
        explanation:
            'Los valores hardcodeados son difíciles de mantener y no revelan su propósito.',
        codeExample: `// ❌ Números mágicos
if (user.age >= 18 && user.score > 1000) {
  setTimeout(callback, 3600000);
}

// ✅ Constantes descriptivas
const LEGAL_AGE = 18;
const MIN_PREMIUM_SCORE = 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

if (user.age >= LEGAL_AGE && user.score > MIN_PREMIUM_SCORE) {
  setTimeout(callback, ONE_HOUR_MS);
}`,
    },
]
