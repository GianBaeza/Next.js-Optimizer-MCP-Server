# 🚀 GitHub Next.js Optimizer MCP Server v2.1

Un servidor MCP (Model Context Protocol) avanzado para análisis de arquitectura, Clean Code y mejores prácticas en repositorios React/Next.js.

## ✨ Características

### 🏗️ Análisis de Arquitectura Avanzado

-   **Clean Architecture**: Detección de capas y separación de responsabilidades
-   **Principios SOLID**: Análisis detallado con ejemplos de refactoring
-   **Patrones de Diseño**: Repository, Factory, Observer, Strategy y más
-   **React/Next.js Específico**: Optimizaciones de rendimiento y mejores prácticas

### 🛠️ Características Técnicas

-   **Sistema de Caché**: Reduce llamadas a GitHub API con TTL configurable
-   **Rate Limiting**: Manejo inteligente de límites de API
-   **Logging Estructurado**: Logs detallados con niveles configurables
-   **Validación Robusta**: Sanitización de entrada y validación de esquemas
-   **Manejo de Errores**: Sistema robusto con retry automático
-   **Modular**: Arquitectura limpia y extensible

## 🔧 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/GianBaeza/github-nextjs-optimizer-mcp.git
cd github-nextjs-optimizer-mcp

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# O usar la nueva versión mejorada
npm run build:new
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# GitHub
GITHUB_TOKEN=ghp_your_token_here
GITHUB_CACHE_ENABLED=true
GITHUB_CACHE_TTL=300000

# Análisis
MAX_CONCURRENT_FILES=10
MAX_FILE_SIZE=1048576

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=false
LOG_FILE_PATH=./logs/mcp-server.log
```

### Claude Desktop Configuration

Agrega a tu `claude_desktop_config.json`:

```json
{
    "mcpServers": {
        "github-code-mentor": {
            "command": "node",
            "args": ["/path/to/github-nextjs-optimizer-mcp/build/index.js"],
            "env": {
                "GITHUB_TOKEN": "tu_github_token_aqui"
            }
        }
    }
}
```

## 🎯 Herramientas Disponibles

### 🔑 Herramientas Básicas

#### `configurar_github`

Configura el token de acceso de GitHub para poder analizar repositorios.

```typescript
{
    token: string // Personal Access Token de GitHub
}
```

#### `listar_archivos_react`

Lista todos los archivos React/Next.js del repositorio organizados por directorio.

```typescript
{
  owner: string,    // Propietario del repositorio
  repo: string,     // Nombre del repositorio
  path?: string     // Directorio base (opcional)
}
```

#### `analizar_archivo`

Analiza un archivo específico aplicando principios de Clean Architecture y SOLID.

```typescript
{
  owner: string,    // Propietario del repositorio
  repo: string,     // Nombre del repositorio
  path: string,     // Ruta del archivo
  branch?: string   // Rama (default: main)
}
```

### 🚀 Herramientas Avanzadas

#### `analizar_repositorio`

Analiza la arquitectura completa del repositorio con recomendaciones personalizadas.

```typescript
{
  owner: string,    // Propietario del repositorio
  repo: string,     // Nombre del repositorio
  branch?: string   // Rama a analizar
}
```

#### `sugerir_arquitectura`

Sugiere una estructura de Clean Architecture personalizada para el proyecto.

```typescript
{
  owner: string,
  repo: string,
  projectType?: "web" | "api" | "mobile" | "fullstack" | "library"
}
```

#### `explicar_patron`

Explica un patrón de diseño con ejemplos prácticos en React/Next.js.

```typescript
{
    patron: string // repository, factory, observer, strategy, etc.
}
```

## 📊 Ejemplo de Análisis

```json
{
    "repository": "facebook/react",
    "file": "src/components/Button.tsx",
    "analysis": {
        "scores": {
            "architecture": 85,
            "cleanCode": 78,
            "overall": 82
        },
        "summary": {
            "total": 12,
            "critical": 1,
            "high": 3,
            "medium": 6,
            "low": 2,
            "good": 0
        },
        "topIssues": [
            {
                "issue": "Violación del SRP (Single Responsibility Principle)",
                "severity": "critical",
                "recommendation": "Separa las responsabilidades en clases diferentes",
                "designPattern": "Single Responsibility Principle"
            }
        ],
        "suggestions": [
            {
                "title": "Implementar Repository Pattern",
                "description": "Abstrae las llamadas HTTP en repositorios",
                "pattern": "Repository Pattern",
                "benefit": "Desacoplamiento y mejor testeo"
            }
        ]
    }
}
```

## 🏗️ Arquitectura del Proyecto

```
src/
├── types/              # Definiciones de tipos TypeScript
│   ├── analysis.ts     # Tipos para análisis de código
│   ├── server.ts       # Tipos de configuración
│   └── index.ts        # Exportador de tipos
├── utils/              # Utilidades del sistema
│   ├── config.ts       # Sistema de configuración
│   ├── logger.ts       # Sistema de logging
│   ├── validation.ts   # Validación y sanitización
│   ├── cache.ts        # Sistema de caché en memoria
│   ├── errors.ts       # Manejo de errores
│   └── index.ts        # Exportador de utilidades
├── patterns/           # Patrones de análisis
│   ├── solid-principles.ts    # Principios SOLID
│   ├── clean-architecture.ts  # Clean Architecture
│   ├── react-nextjs.ts       # Patrones React/Next.js
│   ├── design-patterns.ts    # Patrones de diseño
│   └── index.ts              # Exportador de patrones
├── services/           # Servicios externos
│   ├── github.ts       # Servicio de GitHub optimizado
│   └── index.ts        # Exportador de servicios
├── analyzers/          # Analizadores de código
│   ├── code-analyzer.ts # Analizador principal
│   └── index.ts         # Exportador de analizadores
├── tools/              # Herramientas MCP
│   ├── basic-tools.ts   # Herramientas básicas
│   ├── advanced-tools.ts # Herramientas avanzadas
│   └── index.ts         # Exportador de herramientas
├── tests/              # Suite de tests
│   └── basic-tests.ts   # Tests básicos
├── index-new.ts        # Servidor principal mejorado
└── index.ts            # Servidor original (compatible)
```

## 🧪 Testing

```bash
# Ejecutar tests básicos
npm test

# Verificar tipos
npm run lint

# Desarrollo con recarga automática
npm run dev:new
```

## 📈 Métricas de Calidad

### Puntuación de Arquitectura (0-100)

-   **90-100**: Excelente arquitectura, sigue Clean Architecture
-   **70-89**: Buena arquitectura, algunas mejoras necesarias
-   **50-69**: Arquitectura aceptable, refactoring recomendado
-   **0-49**: Arquitectura problemática, refactoring urgente

### Puntuación de Clean Code (0-100)

-   **90-100**: Código muy limpio y legible
-   **70-89**: Código limpio con pequeñas mejoras
-   **50-69**: Código aceptable, algunas mejoras necesarias
-   **0-49**: Código difícil de mantener, refactoring necesario

## 🔍 Patrones Detectados

### Principios SOLID

-   ✅ **SRP**: Single Responsibility Principle
-   ✅ **OCP**: Open/Closed Principle
-   ✅ **LSP**: Liskov Substitution Principle
-   ✅ **ISP**: Interface Segregation Principle
-   ✅ **DIP**: Dependency Inversion Principle

### Clean Architecture

-   ✅ **Domain Layer**: Entidades y reglas de negocio
-   ✅ **Application Layer**: Casos de uso
-   ✅ **Infrastructure Layer**: Repositorios y servicios
-   ✅ **Presentation Layer**: UI y controladores

### Patrones de Diseño

-   ✅ **Repository**: Abstracción de datos
-   ✅ **Factory**: Creación de objetos
-   ✅ **Observer**: Comunicación entre componentes
-   ✅ **Strategy**: Algoritmos intercambiables
-   ✅ **Command**: Encapsulación de operaciones

### React/Next.js

-   ✅ **Performance**: useMemo, useCallback, lazy loading
-   ✅ **Architecture**: Component composition, custom hooks
-   ✅ **Best Practices**: Key props, conditional rendering
-   ✅ **Next.js**: SSR/SSG, API routes, optimization

## 🚀 Novedades v2.1

### ✨ Nuevas Características

-   **Sistema de Caché Avanzado**: Reduce llamadas API en 80%
-   **Análisis Concurrente**: Procesa múltiples archivos en paralelo
-   **Validación Robusta**: Schemas de validación con sanitización
-   **Logging Estructurado**: Logs con rotación y niveles configurables
-   **Rate Limiting**: Manejo inteligente de límites de GitHub API
-   **Error Recovery**: Sistema de retry automático con backoff exponencial

### 🏗️ Mejoras de Arquitectura

-   **Modularización Completa**: Separación en módulos especializados
-   **Inyección de Dependencias**: Sistema DI para mejor testeo
-   **Configuración Flexible**: Variables de entorno y configuración dinámica
-   **Extensibilidad**: Fácil adición de nuevos patrones y reglas

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Versión original
npm run dev:new      # Versión mejorada v2.1

# Compilación
npm run build        # Compilar versión original
npm run build:new    # Compilar versión mejorada

# Ejecución
npm start            # Ejecutar versión original
npm run start:new    # Ejecutar versión mejorada

# Testing y calidad
npm test             # Ejecutar tests
npm run lint         # Verificar tipos TypeScript
npm run clean        # Limpiar archivos build
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Gian Baeza**

-   GitHub: [@GianBaeza](https://github.com/GianBaeza)
-   LinkedIn: [Gian Baeza](https://linkedin.com/in/gianbaeza)

---

⭐ Si este proyecto te ayuda, ¡dale una estrella en GitHub!

🚀 **¡Lleva tu código al siguiente nivel con análisis de arquitectura inteligente!**
