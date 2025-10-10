# 🚀 Script de Instalación Rápida - GitHub Next.js Optimizer MCP
# Ejecutar en PowerShell desde la carpeta del proyecto

Write-Host "🐳 GitHub Next.js Optimizer MCP - Instalación Rápida" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar Docker
Write-Host "📋 Paso 1/4: Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host " Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host " Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "   Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Paso 2: Verificar archivo .env
Write-Host ""
Write-Host "📋 Paso 2/4: Verificando archivo .env..." -ForegroundColor Yellow
if (Test-Path .env) {
    $envContent = Get-Content .env | Select-String "^GITHUB_TOKEN="
    if ($envContent) {
        $token = $envContent.ToString().Replace("GITHUB_TOKEN=", "").Trim()
        if ($token -match "^(ghp_|github_pat_)") {
            Write-Host " Token de GitHub configurado correctamente" -ForegroundColor Green
        } else {
            Write-Host "⚠️  El token no parece tener el formato correcto" -ForegroundColor Yellow
            Write-Host "   Debería comenzar con 'ghp_' o 'github_pat_'" -ForegroundColor Yellow
        }
    } else {
        Write-Host " No se encontró GITHUB_TOKEN en .env" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host " Archivo .env no encontrado" -ForegroundColor Red
    exit 1
}

# Paso 3: Construir imagen Docker
Write-Host ""
Write-Host "📋 Paso 3/4: Construyendo imagen Docker..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar unos minutos la primera vez)" -ForegroundColor Gray
docker build -t nextjs-optimizer-mcp:latest . 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host " Imagen Docker construida exitosamente" -ForegroundColor Green
} else {
    Write-Host " Error al construir la imagen Docker" -ForegroundColor Red
    exit 1
}

# Paso 4: Probar el contenedor
Write-Host ""
Write-Host "📋 Paso 4/4: Probando el contenedor..." -ForegroundColor Yellow
$testOutput = echo "test" | docker run --rm -i --env-file .env nextjs-optimizer-mcp:latest 2>&1
if ($testOutput -match "MCP Server iniciado") {
    Write-Host " Contenedor funciona correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  El contenedor se ejecutó pero no se pudo verificar la salida" -ForegroundColor Yellow
}

# Mostrar configuración para Claude Desktop
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host " ¡Instalación completada!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 SIGUIENTE PASO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abre el archivo de configuración de Claude Desktop:" -ForegroundColor White
Write-Host "   %APPDATA%\Claude\claude_desktop_config.json" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Agrega esta configuración:" -ForegroundColor White
Write-Host ""

$envPath = (Get-Item .env).FullName -replace '\\', '\\'
$config = @"
{
  "mcpServers": {
    "github-nextjs-optimizer": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--env-file",
        "$envPath",
        "nextjs-optimizer-mcp:latest"
      ]
    }
  }
}
"@

Write-Host $config -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Guarda el archivo y reinicia Claude Desktop completamente" -ForegroundColor White
Write-Host ""
Write-Host "4. Prueba en Claude Desktop con:" -ForegroundColor White
Write-Host '   "¿Qué herramientas MCP tengo disponibles?"' -ForegroundColor Gray
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "💾 La configuración también se guardó en:" -ForegroundColor Yellow
Write-Host "   .\claude_desktop_config_COPIAR.json" -ForegroundColor Gray
Write-Host ""

# Guardar configuración en archivo
$config | Out-File -FilePath "claude_desktop_config_COPIAR.json" -Encoding UTF8

# Ofrecer abrir el archivo de configuración
Write-Host "¿Deseas abrir el archivo de configuración de Claude Desktop ahora? (S/N): " -ForegroundColor Yellow -NoNewline
$respuesta = Read-Host
if ($respuesta -eq "S" -or $respuesta -eq "s") {
    notepad "$env:APPDATA\Claude\claude_desktop_config.json"
    Write-Host " Archivo abierto en Notepad" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 ¡Todo listo! Reinicia Claude Desktop para usar el MCP" -ForegroundColor Green
Write-Host ""
