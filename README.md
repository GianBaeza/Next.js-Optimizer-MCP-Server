# 🚀 GitHub Next.js Optimizer MCP Server v2.1

Un servidor MCP (Model Context Protocol) avanzado para análisis de arquitectura, Clean Code y mejores prácticas en repositorios React/Next.js.

## ✨ Características Principales

### 🏗️ Análisis de Arquitectura Avanzado

-   **Clean Architecture**: Detección automática de capas y separación de responsabilidades
-   **Principios SOLID**: Análisis detallado con ejemplos de refactoring
-   **Patrones de Diseño**: Repository, Factory, Observer, Strategy y más
-   **React/Next.js Específico**: Optimizaciones de rendimiento y mejores prácticas

### 🛠️ Características Técnicas

-   **Auto-Configuración Inteligente**: Configuración automática desde token de GitHub
-   **Sistema de Caché**: Reduce llamadas a GitHub API con TTL configurable
-   **Rate Limiting**: Manejo inteligente de límites de API
-   **Logging Estructurado**: Logs detallados con niveles configurables
-   **Validación Robusta**: Sanitización de entrada y validación de esquemas
-   **Manejo de Errores**: Sistema robusto con retry automático
-   **Modular**: Arquitectura limpia y extensible

## 🔧 Instalación

### Requisitos Previos

-   **Docker**: v20.10 o superior
-   **Docker Compose**: v2.0 o superior (opcional, pero recomendado)
-   **Git**: Para clonar el repositorio
-   **Token de GitHub**: Con permisos `repo` y `read:user`

> 💡 **Nota**: Este proyecto está diseñado para ejecutarse exclusivamente con Docker. No requiere Node.js instalado localmente.

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.git
cd Next.js-Optimizer-MCP-Server
```

### Paso 2: Construir la Imagen Docker 🐳

```bash
# Opción A: Usar Docker Compose (RECOMENDADO)
docker-compose build

# Opción B: Construcción manual
docker build -t nextjs-optimizer-mcp:latest .
```

**Ventajas de Docker:**

-   ✅ No requiere instalar Node.js v22.20.0 localmente
-   ✅ Ambiente aislado y consistente
-   ✅ Imagen Alpine optimizada (~150MB)
-   ✅ Configuración lista para producción
-   ✅ Fácil actualización y despliegue

## ⚙️ Configuración Rápida

### 1️⃣ Obtener Token de GitHub

1. Ve a [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click en "Generate new token (classic)"
3. Selecciona los siguientes permisos:
    - ✅ `repo` (acceso completo a repositorios)
    - ✅ `read:user` (lectura de perfil de usuario)
4. Copia el token generado (comienza con `ghp_`)

### 2️⃣ Configurar Claude Desktop con Docker

Edita tu archivo de configuración de Claude Desktop:

**📍 Ubicación del archivo:**

-   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
-   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
-   **Linux**: `~/.config/Claude/claude_desktop_config.json`

**📝 Configuración para Docker:**

```json
{
    "mcpServers": {
        "github-nextjs-optimizer": {
            "command": "docker",
            "args": [
                "run",
                "--rm",
                "-i",
                "-e",
                "GITHUB_TOKEN=ghp_tu_token_aqui",
                "nextjs-optimizer-mcp:latest"
            ]
        }
    }
}
```

**Parámetros Docker explicados:**

-   `run`: Ejecuta un nuevo contenedor
-   `--rm`: Elimina el contenedor al terminar
-   `-i`: Modo interactivo (requerido por MCP)
-   `-e GITHUB_TOKEN=...`: Pasa tu token de GitHub
-   `nextjs-optimizer-mcp:latest`: Nombre de la imagen

> **💡 Nota**: El servidor detecta automáticamente tu usuario desde el token. ¡No necesitas configurar nada más!

### 3️⃣ Variables de Entorno (Opcional)

Puedes personalizar el comportamiento creando un archivo `.env`:

```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_token_here

# Cache Settings
GITHUB_CACHE_ENABLED=true
GITHUB_CACHE_TTL=300000

# Analysis Settings
MAX_CONCURRENT_FILES=10
MAX_FILE_SIZE=1048576

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=false
LOG_FILE_PATH=./logs/mcp-server.log
```

### 4️⃣ Configuración con Docker (Opcional)

Si prefieres usar Docker, edita el archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
    nextjs-optimizer:
        build:
            context: .
            dockerfile: Dockerfile
        image: nextjs-optimizer-mcp:latest
        container_name: mcp-nextjs-optimizer
        environment:
            - GITHUB_TOKEN=ghp_your_token_here
            - NODE_ENV=production
        volumes:
            - ./logs:/app/logs
        restart: unless-stopped
```

**Comandos útiles de Docker:**

```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener el servidor
docker-compose down

# Reconstruir después de cambios
docker-compose up -d --build
```

### 5️⃣ Verificar Instalación

1. Reinicia Claude Desktop
2. En el chat, verifica que aparezca el servidor conectado
3. Prueba con: `"Analiza mi repositorio GianBaeza/mi-proyecto"`

¡Listo! 🎉

## 🎯 Uso y Herramientas

### � Inicio Rápido

Una vez configurado, puedes usar el servidor directamente desde Claude:

**Ejemplo 1: Analizar un repositorio completo**

```
Analiza el repositorio GianBaeza/Next.js-Optimizer-MCP-Server
```

**Ejemplo 2: Analizar un archivo específico**

```
Analiza el archivo src/components/Button.tsx del repo facebook/react
```

**Ejemplo 3: Obtener sugerencias de arquitectura**

```
Sugiere una arquitectura Clean para mi proyecto web Next.js: usuario/mi-proyecto
```

### 📋 Herramientas Disponibles

#### 1️⃣ `listar_archivos_react`

Lista todos los archivos React/Next.js del repositorio organizados por directorio.

**Parámetros:**

```typescript
{
  owner: string,    // Tu usuario de GitHub (auto-detectado)
  repo: string,     // Nombre del repositorio
  path?: string     // Directorio base (opcional, default: raíz)
}
```

**Ejemplo:**

```
Lista los archivos React de mi repositorio awesome-app
```

---

#### 2️⃣ `analizar_archivo`

Analiza un archivo específico aplicando principios de Clean Architecture y SOLID.

**Parámetros:**

```typescript
{
  owner: string,    // Usuario propietario del repo
  repo: string,     // Nombre del repositorio
  path: string,     // Ruta del archivo
  branch?: string   // Rama (default: main)
}
```

**Ejemplo:**

```
Analiza src/pages/index.tsx de mi repo portfolio
```

---

#### 3️⃣ `analizar_repositorio`

Analiza la arquitectura completa del repositorio con recomendaciones personalizadas.

**Parámetros:**

```typescript
{
  owner: string,    // Usuario propietario
  repo: string,     // Nombre del repositorio
  branch?: string   // Rama a analizar (default: main)
}
```

**Ejemplo:**

```
Analiza mi repositorio e-commerce-nextjs y dame recomendaciones
```

---

#### 4️⃣ `sugerir_arquitectura`

Sugiere una estructura de Clean Architecture personalizada para el proyecto.

**Parámetros:**

```typescript
{
  owner: string,
  repo: string,
  projectType?: "web" | "api" | "mobile" | "fullstack" | "library"
}
```

**Ejemplo:**

```
Sugiere arquitectura para mi proyecto API REST: usuario/api-project
```

---

#### 5️⃣ `explicar_patron`

Explica un patrón de diseño con ejemplos prácticos en React/Next.js.

**Parámetros:**

```typescript
{
    patron: string // repository, factory, observer, strategy, etc.
}
```

**Ejemplo:**

```
Explícame el patrón Repository con ejemplo en Next.js
```

## 📊 Ejemplo de Análisis

### Resultado de Análisis Completo

```json
{
    "repository": "GianBaeza/mi-proyecto-nextjs",
    "branch": "main",
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
            "info": 0
        },
        "topIssues": [
            {
                "file": "src/components/UserForm.tsx",
                "issue": "Violación del SRP (Single Responsibility Principle)",
                "severity": "critical",
                "line": 45,
                "recommendation": "Separa la lógica de validación y la lógica de envío en componentes diferentes",
                "designPattern": "Single Responsibility Principle",
                "example": "// Antes\nfunction UserForm() {\n  // validación + envío + UI\n}\n\n// Después\nfunction useUserValidation() { /* ... */ }\nfunction useUserSubmit() { /* ... */ }\nfunction UserForm() { /* solo UI */ }"
            }
        ],
        "suggestions": [
            {
                "title": "Implementar Repository Pattern",
                "description": "Abstrae las llamadas a la API en repositorios dedicados",
                "pattern": "Repository Pattern",
                "benefit": "Mejor desacoplamiento y facilita testing",
                "implementation": "src/repositories/UserRepository.ts"
            }
        ]
    }
}
```

### Interpretación de Puntuaciones

**Arquitectura (0-100)**

-   🟢 **90-100**: Excelente - Sigue Clean Architecture fielmente
-   🟡 **70-89**: Buena - Algunas mejoras recomendadas
-   🟠 **50-69**: Aceptable - Refactoring recomendado
-   🔴 **0-49**: Problemática - Refactoring urgente

**Clean Code (0-100)**

-   🟢 **90-100**: Código muy limpio y mantenible
-   🟡 **70-89**: Código limpio con mejoras menores
-   🟠 **50-69**: Código aceptable, necesita mejoras
-   🔴 **0-49**: Código difícil de mantener

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

-   **SRP**: Single Responsibility Principle
-   **OCP**: Open/Closed Principle
-   **LSP**: Liskov Substitution Principle
-   **ISP**: Interface Segregation Principle
-   **DIP**: Dependency Inversion Principle

### Clean Architecture

-   **Domain Layer**: Entidades y reglas de negocio
-   **Application Layer**: Casos de uso
-   **Infrastructure Layer**: Repositorios y servicios
-   **Presentation Layer**: UI y controladores

### Patrones de Diseño

-   **Repository**: Abstracción de datos
-   **Factory**: Creación de objetos
-   **Observer**: Comunicación entre componentes
-   **Strategy**: Algoritmos intercambiables
-   **Command**: Encapsulación de operaciones

### React/Next.js

-   **Performance**: useMemo, useCallback, lazy loading
-   **Architecture**: Component composition, custom hooks
-   **Best Practices**: Key props, conditional rendering
-   **Next.js**: SSR/SSG, API routes, optimization

## 🚀 Novedades v2.1

### ✨ Nuevas Características

-   **Auto-Configuración Inteligente**: Ya no necesitas especificar tu usuario de GitHub, se detecta automáticamente desde el token
-   **Sistema de Caché Avanzado**: Reduce llamadas API en 80% con TTL configurable
-   **Análisis Concurrente**: Procesa múltiples archivos en paralelo para mayor velocidad
-   **Validación Robusta**: Schemas de validación con sanitización automática
-   **Logging Estructurado**: Logs con rotación y niveles configurables (debug, info, warn, error)
-   **Rate Limiting Inteligente**: Manejo automático de límites de GitHub API
-   **Error Recovery**: Sistema de retry automático con backoff exponencial

### 🏗️ Mejoras de Arquitectura

-   **Modularización Completa**: Separación en módulos especializados (types, utils, patterns, services, analyzers, tools)
-   **Inyección de Dependencias**: Sistema DI para mejor testeo y mantenibilidad
-   **Configuración Flexible**: Variables de entorno con fallbacks sensatos
-   **Extensibilidad**: Fácil adición de nuevos patrones y reglas de análisis

### 🔄 Migración desde v1.0

Si estás usando la versión anterior:

1. Actualiza tu `claude_desktop_config.json` con la nueva configuración (ver arriba)
2. Recompila el proyecto: `npm run build:new`
3. Reinicia Claude Desktop
4. ¡Ya no necesitas llamar a `configurar_github`! El servidor se auto-configura

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

⭐ **Si este proyecto te ayuda, ¡dale una estrella en GitHub!**

🚀 **¡Lleva tu código al siguiente nivel con análisis de arquitectura inteligente!**
