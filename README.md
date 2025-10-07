# 🚀 GitHub Next.js Optimizer MCP Server# 1️⃣ Clonar el proyecto

git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.git

Servidor **MCP** que analiza repositorios de **GitHub** y proporciona recomendaciones de **optimización para proyectos Next.js y React**.cd Next.js-Optimizer-MCP-Server



---# 2️⃣ Instalar dependencias

npm install

## 📦 Instalación

# 3️⃣ Compilar TypeScript a JavaScript

### 1️⃣ Clonar el repositorionpm run build



```bash# 4️⃣ Verificar que funciona

git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.gitnode build/index.js

cd Next.js-Optimizer-MCP-Server# Deberías ver: "🚀 GitHub Next.js Optimizer MCP Server iniciado"

```

# 5️⃣ Crear token de GitHub

### 2️⃣ Instalar dependencias# Ve a: https://github.com/settings/tokens

# Crea un token con permisos: repo, public_repo

```bash

npm install# 6️⃣ Editar configuración de Claude Desktop

```# Ubicación del archivo:

# Windows: %APPDATA%\Claude\claude_desktop_config.json

### 3️⃣ Compilar el proyecto# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json



```bash# 7️⃣ Agregar esta configuración:

npm run build{

```  "mcpServers": {

    "github-nextjs-optimizer": {

---      "command": "node",

      "args": ["RUTA_COMPLETA/build/index.js"],

## 🔑 Configurar el Token de GitHub      "env": {

        "GITHUB_TOKEN": "tu_token_github"

### 1. Crear un token personal      }

    }

1. Ir a **GitHub** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**    }

   🔗 [https://github.com/settings/tokens](https://github.com/settings/tokens)}



2. Hacer clic en **"Generate new token (classic)"**# 8️⃣ Reiniciar Claude Desktop completamente



3. Configurar el token con:# 9️⃣ Probar en Claude Desktop:

   - **Nombre:** `MCP Next.js Optimizer`# "¿Qué herramientas MCP tengo disponibles?"

   - **Expiración:** 90 días (recomendado)
   - **Scopes (permisos):**
     - ✅ `repo`
     - ✅ `public_repo`
     - ✅ `read:org` (opcional)

4. Copiar el token generado (`ghp_...` o `github_pat_...`)

---

## ⚙️ Configuración en Claude Desktop

### 📍 Rutas por sistema operativo

| Sistema | Ruta |
|---------|------|
| 🪟 **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| 🍎 **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| 🐧 **Linux** | `~/.config/Claude/claude_desktop_config.json` |

### 🧾 Contenido del archivo

Agrega esta sección dentro del campo `"mcpServers"`:

```json
{
  "mcpServers": {
    "github-nextjs-optimizer": {
      "command": "node",
      "args": [
        "RUTA_COMPLETA_AL_PROYECTO/build/index.js"
      ],
      "env": {
        "GITHUB_TOKEN": "TU_TOKEN_DE_GITHUB_AQUÍ"
      }
    }
  }
}
```

### Ejemplo (Windows)

```json
{
  "mcpServers": {
    "github-nextjs-optimizer": {
      "command": "node",
      "args": [
        "C:\\Users\\TuUsuario\\Desktop\\Next.js-Optimizer-MCP-Server\\build\\index.js"
      ],
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

⚠️ **Importante:**
- Usa doble barra `\\` en Windows
- Reinicia Claude Desktop después de guardar

---

## 🧠 Verificar Instalación

```bash
node build/index.js
```

Luego, en **Claude Desktop**, escribí:

```
¿Qué herramientas MCP tengo disponibles?
```

---

## 🧰 Uso del MCP

| Comando | Ejemplo |
|---------|---------|
| `analizar_repositorio` | *Analiza vercel/next.js* |
| `listar_archivos_react` | *Lista archivos React en miusuario/mi-proyecto* |
| `analizar_archivo` | *Analiza src/app/page.tsx en miusuario/mi-proyecto* |

---

## 🧩 Solución de Problemas

### ❌ "No tengo herramientas MCP disponibles"

- Verificá que `claude_desktop_config.json` esté en la ruta correcta
- Comprobá que `build/index.js` exista
- En Windows, usa barras dobles `\\`
- Reiniciá Claude Desktop completamente

### ❌ "Repository not found"

- Verificá que el token tenga permisos `repo`
- Probá: `curl -H "Authorization: token TU_TOKEN" https://api.github.com/user`

### ❌ "El servidor no inicia"

```bash
npm install
npm run build
node build/index.js
```

Verificá que estés usando **Node >= 18**

---

## 🧾 Licencia

**MIT** © 2025 — Desarrollado por **Gian Baeza**
