# 🚀 GitHub Next.js Optimizer MCP Server

Servidor **MCP** que analiza repositorios de **GitHub** y proporciona recomendaciones de **optimización para proyectos Next.js y React**.

---

## ⚡ Inicio Rápido (5 minutos)

```bash
# 1. Clonar el repositorio
git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.git
cd Next.js-Optimizer-MCP-Server

# 2. Configurar el token de GitHub en .env
Copy-Item .env.example .env
# Edita .env y agrega tu token de GitHub

# 3. Construir la imagen Docker
docker build -t nextjs-optimizer-mcp:latest .

# 4. Obtener la ruta completa del .env (Windows)
(Get-Item .env).FullName

# 5. Configurar Claude Desktop
# Edita: %APPDATA%\Claude\claude_desktop_config.json
# Agrega la configuración del MCP (ver sección de configuración)

# 6. Reiniciar Claude Desktop
# ¡Listo! Prueba con: "¿Qué herramientas MCP tengo disponibles?"
```

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
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/macOS
cp .env.example .env
```

Editar el archivo `.env` y agregar tu token de GitHub:

```env
GITHUB_TOKEN=tu_token_github_aqui
```

**⚠️ IMPORTANTE:** El token debe ser solo la cadena alfanumérica, sin emojis, comillas ni espacios.

Ejemplo correcto:

```env
GITHUB_TOKEN=github_pat_11A4AD4RI0G2RkBY5TTj0P_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 4️⃣ Construir la imagen Docker

```bash
docker build -t nextjs-optimizer-mcp:latest .
```

#### 5️⃣ Verificar que funciona

```bash
# Probar el contenedor
echo "test" | docker run --rm -i --env-file .env nextjs-optimizer-mcp:latest

# Deberías ver: "🚀 GitHub Next.js Optimizer MCP Server iniciado"
```

#### 6️⃣ Configurar Claude Desktop

Editar el archivo de configuración de Claude Desktop:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/Claude/claude_desktop_config.json`

**Abrir el archivo rápidamente:**

```bash
# Windows (PowerShell)
notepad "$env:APPDATA\Claude\claude_desktop_config.json"

# macOS
open ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Linux
nano ~/.config/Claude/claude_desktop_config.json
```

**Agregar esta configuración:**

```json
{
    "mcpServers": {
        "github-nextjs-optimizer": {
            "command": "docker",
            "args": [
                "run",
                "--rm",
                "-i",
                "--env-file",
                "RUTA_COMPLETA_AL_ARCHIVO_.env",
                "nextjs-optimizer-mcp:latest"
            ]
        }
    }
}
```

**Ejemplo para Windows:**

```json
{
    "mcpServers": {
        "github-nextjs-optimizer": {
            "command": "docker",
            "args": [
                "run",
                "--rm",
                "-i",
                "--env-file",
                "C:\\Users\\TuUsuario\\Desktop\\Next.js-Optimizer-MCP-Server\\.env",
                "nextjs-optimizer-mcp:latest"
            ]
        }
    }
}
```

**⚠️ IMPORTANTE para Windows:**

-   Usa doble barra invertida `\\` en las rutas
-   Para obtener la ruta completa del `.env`, ejecuta:
    ```powershell
    (Get-Item .env).FullName
    ```

#### 7️⃣ Reiniciar Claude Desktop

1. Cierra **completamente** Claude Desktop (verifica en el Administrador de Tareas)
2. Abre Claude Desktop nuevamente
3. Prueba escribiendo: _"¿Qué herramientas MCP tengo disponibles?"_

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

### Construcción de la imagen

```bash
# Construir la imagen
docker build -t nextjs-optimizer-mcp:latest .

# Verificar que la imagen se creó
docker images nextjs-optimizer-mcp
```

### Pruebas del contenedor

```bash
# Probar el contenedor manualmente
echo "test" | docker run --rm -i --env-file .env nextjs-optimizer-mcp:latest

# Ver información de la imagen
docker inspect nextjs-optimizer-mcp:latest
```

### Gestión y limpieza

```bash
# Ver todos los contenedores (incluso detenidos)
docker ps -a

# Ver logs de un contenedor específico
docker logs [CONTAINER_ID]

# Eliminar contenedores detenidos
docker container prune

# Eliminar la imagen
docker rmi nextjs-optimizer-mcp:latest

# Limpiar todo (contenedores, imágenes, volúmenes no usados)
docker system prune -a
```

### Reconstruir después de cambios

```bash
# Si haces cambios en el código fuente
docker build -t nextjs-optimizer-mcp:latest .

# Luego reinicia Claude Desktop
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
