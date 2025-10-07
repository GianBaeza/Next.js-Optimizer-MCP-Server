# GitHub Next.js Optimizer MCP Server

Servidor MCP que analiza repositorios de GitHub y proporciona recomendaciones de optimización para proyectos Next.js y React, enfocándose en evitar re-renderizados innecesarios y seguir mejores prácticas.

## 🚀 Instalación

```bash
# Clonar o crear el proyecto
mkdir github-nextjs-optimizer-mcp
cd github-nextjs-optimizer-mcp

# Instalar dependencias
npm install

# Compilar
npm run build
```

## 🔑 Obtener Token de GitHub

1. Ve a GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con estos permisos:
    - `repo` (acceso completo a repositorios)
    - `read:org` (si necesitas leer repos de organizaciones)
3. Copia el token generado

## ⚙️ Configuración en Claude Desktop

### macOS

Edita: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows

Edita: `%APPDATA%\Claude\claude_desktop_config.json`

### Linux

Edita: `~/.config/Claude/claude_desktop_config.json`

Agrega esta configuración:

```json
{
    "mcpServers": {
        "github-nextjs-optimizer": {
            "command": "node",
            "args": ["/ruta/completa/al/proyecto/build/index.js"]
        }
    }
}
```

**Para desarrollo (sin compilar):**

```json
{
    "mcpServers": {
        "github-nextjs-optimizer": {
            "command": "npx",
            "args": ["-y", "tsx", "/ruta/completa/al/proyecto/src/index.ts"]
        }
    }
}
```

## 📖 Uso en Claude

Una vez configurado, reinicia Claude Desktop y podrás usar estas herramientas:

### 1. Configurar GitHub

```
Configura mi acceso a GitHub con el token: ghp_xxxxxxxxxxxxx
```

### 2. Listar archivos React/Next.js

```
Lista todos los archivos React en el repositorio vercel/next.js
```

### 3. Analizar un archivo específico

```
Analiza el archivo app/page.tsx del repositorio miusuario/mi-proyecto
```

### 4. Analizar repositorio completo

```
Analiza el repositorio completo miusuario/mi-proyecto-nextjs
```

## 🎯 Qué detecta el analizador

### Re-renders innecesarios

-   ✅ Funciones inline en loops (.map, .filter)
-   ✅ Objetos creados inline como props
-   ✅ useState sin memoización apropiada
-   ✅ Falta de useCallback/useMemo

### Optimizaciones Next.js

-   ✅ Uso de `<img>` en lugar de `next/image`
-   ✅ getServerSideProps en Next.js 13+
-   ✅ Uso apropiado de Server Components
-   ✅ Metadata API

### Arquitectura y patrones

-   ✅ Componentes muy grandes (>300 líneas)
-   ✅ Múltiples responsabilidades en un componente
-   ✅ Falta de definición de tipos
-   ✅ Imports no optimizados (tree-shaking)
-   ✅ CSS-in-JS vs alternativas más eficientes

### Performance

-   ✅ Bundle size issues
-   ✅ React.memo sin comparación personalizada
-   ✅ Componentes sin optimización

## 📊 Ejemplo de salida

```json
{
    "repository": "usuario/proyecto",
    "filesAnalyzed": 20,
    "totalIssues": 45,
    "summary": {
        "total": 45,
        "high": 12,
        "medium": 20,
        "low": 10,
        "good": 3
    },
    "topIssues": [
        {
            "issue": "Función inline en map",
            "count": 15
        },
        {
            "issue": "Uso de <img> en lugar de next/image",
            "count": 8
        }
    ]
}
```

## 🛠️ Desarrollo

```bash
# Modo desarrollo (recarga automática)
npm run dev

# Compilar
npm run build

# Watch mode (recompila al guardar)
npm run watch

# Ejecutar compilado
npm start
```

## 📝 Notas importantes

-   El análisis se limita a 20 archivos por repositorio para evitar rate limits
-   Requiere token de GitHub con permisos de lectura
-   No modifica ningún código, solo proporciona recomendaciones
-   Los resultados son análisis estáticos basados en patrones conocidos

## 🔒 Seguridad

-   Nunca compartas tu token de GitHub
-   El token solo se almacena en memoria durante la sesión
-   Usa tokens con permisos mínimos necesarios
-   Considera usar Fine-grained tokens para mayor seguridad

## 🤝 Contribuir

Las sugerencias y mejoras son bienvenidas. Considera agregar:

-   Más patrones de detección
-   Soporte para otros frameworks (Vue, Angular)
-   Análisis de rendimiento en tiempo de ejecución
-   Integración con herramientas de linting

## 📄 Licencia

MIT
