# 🚀 GitHub Next.js Optimizer MCP Server

Servidor **MCP** que analiza repositorios de **GitHub** y proporciona recomendaciones de **optimización para proyectos Next.js y React**.

---

## 📦 Instalación

### Opción A: � Instalación con Docker (Recomendado)

La forma más rápida y sencilla de empezar:

#### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.git
cd Next.js-Optimizer-MCP-Server
```

#### 2️⃣ Crear token de GitHub

Ve a: [https://github.com/settings/tokens](https://github.com/settings/tokens)

Crea un token con permisos:

-   ✅ `repo`
-   ✅ `public_repo`
-   ✅ `read:org` (opcional)

#### 3️⃣ Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env y agregar tu token
# GITHUB_TOKEN=tu_token_github_aqui
```

#### 4️⃣ Construir y ejecutar con Docker

```bash
# Construir la imagen
docker build -t github-nextjs-optimizer-mcp .

# O usar docker-compose (recomendado)
docker-compose up -d
```

#### 5️⃣ Verificar que funciona

```bash
docker logs mcp-nextjs-optimizer
# Deberías ver: "🚀 GitHub Next.js Optimizer MCP Server iniciado"
```

#### 6️⃣ Configurar Claude Desktop con Docker

Editar el archivo de configuración de Claude Desktop:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

Agregar esta configuración:

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
                "GITHUB_TOKEN=tu_token_github",
                "github-nextjs-optimizer-mcp:latest"
            ]
        }
    }
}
```

---

### Opción B: � Instalación Manual (Sin Docker)

#### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.git
cd Next.js-Optimizer-MCP-Server
```

#### 2️⃣ Instalar dependencias

```bash
npm install
```

#### 3️⃣ Compilar TypeScript a JavaScript

```bash
npm run build
```

#### 4️⃣ Verificar que funciona

```bash
node build/index.js
# Deberías ver: "🚀 GitHub Next.js Optimizer MCP Server iniciado"
```

#### 5️⃣ Crear token de GitHub

Ve a: [https://github.com/settings/tokens](https://github.com/settings/tokens)

Crea un token con permisos:

-   ✅ `repo`
-   ✅ `public_repo`
-   ✅ `read:org` (opcional)

#### 6️⃣ Configurar Claude Desktop

Editar el archivo de configuración según tu sistema operativo.

---

## 🔑 Configurar el Token de GitHub

### 1. Crear un token personal

1. Ir a **GitHub** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   🔗 [https://github.com/settings/tokens](https://github.com/settings/tokens)

2. Hacer clic en **"Generate new token (classic)"**

3. Configurar el token con:

    - **Nombre:** `MCP Next.js Optimizer`
    - **Expiración:** 90 días (recomendado)
    - **Scopes (permisos):**
        - ✅ `repo`
        - ✅ `public_repo`
        - ✅ `read:org` (opcional)

4. Copiar el token generado (`ghp_...` o `github_pat_...`)

---

## 🐳 Comandos Docker Útiles

### Gestión del contenedor

```bash
# Construir la imagen
docker build -t github-nextjs-optimizer-mcp .

# Ejecutar con docker-compose (recomendado)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener el contenedor
docker-compose down

# Reconstruir y reiniciar
docker-compose up -d --build

# Ejecutar manualmente (sin docker-compose)
docker run -it --rm \
  -e GITHUB_TOKEN=tu_token_github \
  github-nextjs-optimizer-mcp:latest
```

### Limpieza

```bash
# Eliminar contenedor
docker-compose down

# Eliminar imagen
docker rmi github-nextjs-optimizer-mcp:latest

# Limpiar todo (contenedores, imágenes, volúmenes)
docker system prune -a --volumes
```

---

## ⚙️ Configuración en Claude Desktop

### 📍 Rutas por sistema operativo

| Sistema        | Ruta                                                              |
| -------------- | ----------------------------------------------------------------- |
| 🪟 **Windows** | `%APPDATA%\Claude\claude_desktop_config.json`                     |
| 🍎 **macOS**   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| 🐧 **Linux**   | `~/.config/Claude/claude_desktop_config.json`                     |

### 🧾 Contenido del archivo

Agrega esta sección dentro del campo `"mcpServers"`:

```json
{
    "mcpServers": {
        "github-nextjs-optimizer": {
            "command": "node",
            "args": ["RUTA_COMPLETA_AL_PROYECTO/build/index.js"],
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

-   Usa doble barra `\\` en Windows
-   Reinicia Claude Desktop después de guardar

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

| Comando                 | Ejemplo                                             |
| ----------------------- | --------------------------------------------------- |
| `analizar_repositorio`  | _Analiza vercel/next.js_                            |
| `listar_archivos_react` | _Lista archivos React en miusuario/mi-proyecto_     |
| `analizar_archivo`      | _Analiza src/app/page.tsx en miusuario/mi-proyecto_ |

---

## 🧩 Solución de Problemas

### ❌ "No tengo herramientas MCP disponibles"

-   Verificá que `claude_desktop_config.json` esté en la ruta correcta
-   Comprobá que `build/index.js` exista
-   En Windows, usa barras dobles `\\`
-   Reiniciá Claude Desktop completamente

### ❌ "Repository not found"

-   Verificá que el token tenga permisos `repo`
-   Probá: `curl -H "Authorization: token TU_TOKEN" https://api.github.com/user`

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
