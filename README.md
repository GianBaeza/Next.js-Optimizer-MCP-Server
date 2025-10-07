Perfecto 🔧
A continuación te dejo el README.md ya listo para copiar y pegar directamente en tu proyecto.
Incluye únicamente las secciones esenciales para instalación, configuración y uso, con formato Markdown profesional.

# 🚀 GitHub Next.js Optimizer MCP Server

Servidor **MCP** que analiza repositorios de **GitHub** y proporciona recomendaciones de **optimización para proyectos Next.js y React**.

---

## 📦 Instalación

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.git
cd Next.js-Optimizer-MCP-Server

2️⃣ Instalar dependencias
npm install

3️⃣ Compilar el proyecto
npm run build


Esto generará la carpeta /build con el archivo principal index.js, que será el punto de entrada del servidor MCP.

🔑 Configurar el Token de GitHub

El servidor MCP necesita autenticarse con GitHub para poder analizar tus repositorios.

1. Crear un token personal

Ir a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
🔗 https://github.com/settings/tokens

Hacer clic en “Generate new token (classic)”

Configurar el token con:

Nombre: MCP Next.js Optimizer

Expiración: 90 días (recomendado)

Scopes (permisos):

✅ repo

✅ public_repo

✅ read:org (opcional si trabajas con organizaciones)

Copiar el token generado (ghp_... o github_pat_...) y guardarlo en un lugar seguro.

⚙️ Configuración en Claude Desktop

El servidor MCP se conecta a Claude Desktop mediante el archivo claude_desktop_config.json.

📍 Rutas por sistema operativo
Sistema	Ruta
🪟 Windows	%APPDATA%\Claude\claude_desktop_config.json
🍎 macOS	~/Library/Application Support/Claude/claude_desktop_config.json
🐧 Linux	~/.config/Claude/claude_desktop_config.json
🧾 Contenido del archivo

Agrega esta sección dentro del campo "mcpServers":

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

Ejemplo (Windows)
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


⚠️ Importante:

Usa doble barra \\ en Windows.

Guarda el archivo y reinicia Claude Desktop para aplicar los cambios.

🧠 Verificar Instalación

Ejecutar dentro del proyecto:

node build/index.js


Si todo está correcto, deberías ver un mensaje similar a:

🚀 GitHub Next.js Optimizer MCP Server iniciado


Luego, en Claude Desktop, escribí:

¿Qué herramientas MCP tengo disponibles?


Claude debería listar:

analizar_repositorio

listar_archivos_react

analizar_archivo

🧰 Uso del MCP

Una vez configurado, podés usar comandos en Claude Desktop como:

Comando	Descripción	Ejemplo
analizar_repositorio	Analiza un repositorio completo	Analiza vercel/next.js
listar_archivos_react	Lista archivos .jsx / .tsx	Lista archivos React en miusuario/mi-proyecto
analizar_archivo	Analiza un archivo específico	Analiza src/app/page.tsx en miusuario/mi-proyecto
🧩 Solución de Problemas
❌ “No tengo herramientas MCP disponibles”

Verificá que claude_desktop_config.json esté en la ruta correcta.

Comprobá que build/index.js exista.

En Windows, asegurate de usar barras dobles \\.

Reiniciá Claude Desktop completamente.

❌ “Repository not found”

Verificá que el token tenga permisos repo.

Probá el token ejecutando:

curl -H "Authorization: token TU_TOKEN" https://api.github.com/user

❌ “El servidor no inicia”

Ejecutá:

npm install
npm run build
node build/index.js


Verificá que estés usando Node >= 18.

✅ Resumen Rápido
# 1️⃣ Clonar el proyecto
git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.git
cd Next.js-Optimizer-MCP-Server

# 2️⃣ Instalar dependencias
npm install

# 3️⃣ Compilar
npm run build

# 4️⃣ Configurar token y Claude Desktop
# (ver pasos anteriores)

# 5️⃣ Reiniciar Claude Desktop y probar:
# "¿Qué herramientas MCP tengo disponibles?"

🧾 Licencia

MIT © 2025 — Desarrollado por Gian Baeza

---

⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub
```````

