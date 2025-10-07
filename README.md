# 1️⃣ Clonar el proyecto
git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.git
cd Next.js-Optimizer-MCP-Server

# 2️⃣ Instalar dependencias
npm install

# 3️⃣ Compilar TypeScript a JavaScript
npm run build

# 4️⃣ Verificar que funciona
node build/index.js
# Deberías ver: "🚀 GitHub Next.js Optimizer MCP Server iniciado"

# 5️⃣ Crear token de GitHub
# Ve a: https://github.com/settings/tokens
# Crea un token con permisos: repo, public_repo

# 6️⃣ Editar configuración de Claude Desktop
# Ubicación del archivo:
# Windows: %APPDATA%\Claude\claude_desktop_config.json
# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json

# 7️⃣ Agregar esta configuración:
{
  "mcpServers": {
    "github-nextjs-optimizer": {
      "command": "node",
      "args": ["RUTA_COMPLETA/build/index.js"],
      "env": {
        "GITHUB_TOKEN": "tu_token_github"
      }
    }
  }
}

# 8️⃣ Reiniciar Claude Desktop completamente

# 9️⃣ Probar en Claude Desktop:
# "¿Qué herramientas MCP tengo disponibles?"
