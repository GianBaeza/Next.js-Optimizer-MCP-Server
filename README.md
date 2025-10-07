# 🚀 Next.js Optimizer MCP Server

Un servidor MCP (Model Context Protocol) para analizar y optimizar proyectos de Next.js y React directamente desde GitHub.

## 📋 Descripción

Este servidor MCP permite a Claude analizar repositorios de Next.js/React en GitHub, identificar problemas de rendimiento, detectar anti-patrones y proporcionar recomendaciones específicas para mejorar tu código.

## ✨ Características

- 🔍 **Análisis completo de repositorios** Next.js/React
- 📁 **Análisis de archivos individuales** con recomendaciones detalladas
- 📊 **Detección de problemas de rendimiento**
- 🎯 **Identificación de anti-patrones**
- 🔐 **Soporte para repositorios privados** mediante GitHub Token
- 📝 **Listado de archivos React/Next.js** en el proyecto

## 🛠️ Instalación

### Prerrequisitos

- Node.js 16 o superior
- npm o yarn
- Cuenta de GitHub (y token para repos privados)

### Pasos de instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/tu-usuario/nextjs-optimizer-mcp-server.git
cd nextjs-optimizer-mcp-server
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Compila el proyecto**
```bash
npm run build
```

## ⚙️ Configuración

### Configuración en Claude Desktop

1. **Localiza el archivo de configuración de Claude Desktop:**

   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. **Edita el archivo y añade la configuración del servidor MCP:**

```json
{
  "mcpServers": {
    "github-nextjs-optimizer": {
      "command": "node",
      "args": [
        "/ruta/absoluta/a/nextjs-optimizer-mcp-server/build/index.js"
      ],
      "env": {
        "GITHUB_TOKEN": "tu_github_personal_access_token_aqui"
      }
    }
  }
}
```

3. **Reemplaza los valores:**
   - `/ruta/absoluta/a/nextjs-optimizer-mcp-server/build/index.js`: Ruta completa al archivo compilado
   - `tu_github_personal_access_token_aqui`: Tu token de GitHub (opcional si solo trabajas con repos públicos)

### Obtener un GitHub Personal Access Token

1. Ve a GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en "Generate new token" → "Generate new token (classic)"
3. Dale un nombre descriptivo (ej: "Next.js Optimizer MCP")
4. Selecciona los siguientes scopes:
   - `repo` (acceso completo a repositorios privados)
   - `read:user` (leer información del perfil)
5. Click en "Generate token"
6. **¡Importante!** Copia el token inmediatamente (no podrás verlo de nuevo)

## 🚀 Uso

Una vez configurado, reinicia Claude Desktop. El servidor estará disponible automáticamente.

### Comandos disponibles

#### 1. Configurar GitHub Token (si no lo hiciste en el archivo de config)

```
Configura mi GitHub token: ghp_tu_token_aqui
```

#### 2. Listar archivos React/Next.js

```
Lista los archivos React en el repositorio owner/nombre-repo
```

#### 3. Analizar repositorio completo

```
Analiza el repositorio owner/nombre-repo
```

#### 4. Analizar archivo específico

```
Analiza el archivo src/components/Header.tsx del repositorio owner/nombre-repo
```

### Ejemplos prácticos

**Ejemplo 1: Análisis rápido**
```
Analiza el repositorio vercel/next.js rama canary
```

**Ejemplo 2: Análisis de componente**
```
Analiza el archivo app/page.tsx del repositorio mi-usuario/mi-proyecto
```

**Ejemplo 3: Explorar estructura**
```
Lista todos los componentes React en el directorio src/components del repo mi-usuario/mi-app
```

## 📊 Qué detecta el analizador

- ✅ Componentes Client vs Server en Next.js 13+
- ✅ Uso inadecuado de `useEffect`
- ✅ Props drilling excesivo
- ✅ Componentes sin memoización donde es necesario
- ✅ Imports innecesarios
- ✅ Falta de lazy loading
- ✅ Problemas de hidratación
- ✅ Anti-patrones de rendimiento
- ✅ Oportunidades de optimización

## 🔧 Desarrollo

### Scripts disponibles

```bash
# Compilar el proyecto
npm run build

# Modo desarrollo con watch
npm run watch

# Limpiar archivos compilados
npm run clean
```

## 🐛 Solución de problemas

### El servidor no aparece en Claude

1. Verifica que la ruta en `claude_desktop_config.json` sea absoluta y correcta
2. Asegúrate de haber ejecutado `npm run build`
3. Reinicia Claude Desktop completamente
4. Revisa los logs de Claude Desktop

### Errores de autenticación con GitHub

1. Verifica que tu token tenga los permisos correctos
2. Asegúrate de que el token no haya expirado
3. Para repos privados, el token debe tener scope `repo`

### No encuentra archivos en el repositorio

1. Verifica que el nombre del repositorio y owner sean correctos
2. Asegúrate de que la rama existe (por defecto busca en `main`)
3. Confirma que tienes permisos para acceder al repositorio

## 📝 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en GitHub.

---

**Nota:** Este es un servidor MCP diseñado para trabajar con Claude Desktop. Asegúrate de tener la última versión de Claude Desktop instalada.

