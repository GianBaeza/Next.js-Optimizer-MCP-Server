# 🐳 Configuración del GitHub Next.js Optimizer MCP Server con Docker

## ✅ Estado Actual del Proyecto

-   ✅ Imagen Docker construida: `nextjs-optimizer-mcp:latest`
-   ✅ Token de GitHub configurado en `.env`
-   ✅ Dockerfile optimizado con multi-stage build
-   ✅ Listo para usar con Claude Desktop

---

## 📝 Configuración de Claude Desktop

### Paso 1: Ubicar el archivo de configuración

Abre el archivo de configuración de Claude Desktop según tu sistema operativo:

**Windows:**

```
%APPDATA%\Claude\claude_desktop_config.json
```

Para abrirlo rápidamente, ejecuta en PowerShell:

```powershell
notepad "$env:APPDATA\Claude\claude_desktop_config.json"
```

**macOS:**

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**

```
~/.config/Claude/claude_desktop_config.json
```

---

### Paso 2: Agregar la configuración del MCP Server

Edita el archivo `claude_desktop_config.json` y agrega esta configuración:

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
                "C:\\Users\\PC\\Desktop\\MCP\\github-nextjs-optimizer-mcp\\.env",
                "nextjs-optimizer-mcp:latest"
            ]
        }
    }
}
```

**⚠️ IMPORTANTE para Windows:**

-   Usa doble barra invertida `\\` en las rutas
-   Reemplaza `C:\\Users\\PC\\Desktop\\MCP\\github-nextjs-optimizer-mcp\\.env` con la ruta completa a tu archivo `.env`

---

### Paso 3: Explicación de los argumentos

| Argumento                     | Descripción                                          |
| ----------------------------- | ---------------------------------------------------- |
| `docker run`                  | Ejecuta un nuevo contenedor                          |
| `--rm`                        | Elimina el contenedor automáticamente cuando termine |
| `-i`                          | Modo interactivo (necesario para stdio/MCP)          |
| `--env-file`                  | Carga variables de entorno desde el archivo `.env`   |
| `nextjs-optimizer-mcp:latest` | Nombre de la imagen Docker                           |

---

### Paso 4: Verificar la ruta del archivo .env

Para obtener la ruta completa del archivo `.env`:

```powershell
# En PowerShell (desde la carpeta del proyecto)
(Get-Item .env).FullName
```

Copia esa ruta y úsala en la configuración, asegurándote de usar `\\` en vez de `\`.

---

### Paso 5: Ejemplo completo de configuración

Si tienes otros servidores MCP configurados, tu archivo debería verse así:

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
                "C:\\Users\\PC\\Desktop\\MCP\\github-nextjs-optimizer-mcp\\.env",
                "nextjs-optimizer-mcp:latest"
            ]
        },
        "otro-servidor-mcp": {
            "command": "node",
            "args": ["C:\\ruta\\al\\otro\\servidor.js"]
        }
    }
}
```

---

### Paso 6: Reiniciar Claude Desktop

1. **Cierra completamente Claude Desktop**

    - No solo minimices, cierra la aplicación
    - En Windows, verifica en el Administrador de Tareas que no esté ejecutándose

2. **Abre Claude Desktop nuevamente**

3. **Verifica que el MCP esté disponible**
    - Escribe en el chat: "¿Qué herramientas MCP tengo disponibles?"
    - Deberías ver las herramientas del GitHub Next.js Optimizer

---

## 🧪 Probar la Configuración

Una vez reiniciado Claude Desktop, prueba con:

```
Analiza el repositorio GianBaeza/Next.js-Optimizer-MCP-Server
```

O:

```
Lista los archivos React del repositorio [usuario]/[repositorio]
```

---

## 🐛 Solución de Problemas

### ❌ "No tengo herramientas MCP disponibles"

**Verificar que la imagen existe:**

```powershell
docker images | findstr nextjs-optimizer
```

**Verificar la ruta del .env:**

```powershell
Test-Path "C:\Users\PC\Desktop\MCP\github-nextjs-optimizer-mcp\.env"
```

**Probar el contenedor manualmente:**

```powershell
docker run --rm -i --env-file .env nextjs-optimizer-mcp:latest
```

---

### ❌ "Repository not found" o errores de autenticación

**Verificar el token en el .env:**

```powershell
Get-Content .env
```

El archivo debe contener:

```
GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxxxx
```

**Probar el token con GitHub API:**

```powershell
$token = (Get-Content .env | Select-String "GITHUB_TOKEN").ToString().Split("=")[1]
curl -H "Authorization: token $token" https://api.github.com/user
```

---

### ❌ "Error al iniciar el contenedor"

**Ver logs de Docker:**

```powershell
docker ps -a
docker logs [CONTAINER_ID]
```

**Reconstruir la imagen:**

```powershell
docker build -t nextjs-optimizer-mcp:latest .
```

---

## 🔄 Actualizar el Proyecto

Si haces cambios en el código fuente:

```powershell
# 1. Reconstruir la imagen
docker build -t nextjs-optimizer-mcp:latest .

# 2. Reiniciar Claude Desktop
# (Cierra y abre la aplicación)
```

---

## 📊 Comandos Útiles de Docker

```powershell
# Ver imágenes
docker images

# Ver contenedores (incluso detenidos)
docker ps -a

# Eliminar contenedores viejos
docker container prune

# Eliminar la imagen (para reconstruir)
docker rmi nextjs-optimizer-mcp:latest

# Ver logs de un contenedor
docker logs [CONTAINER_ID]

# Limpiar todo Docker
docker system prune -a
```

---

## 🎯 Resumen Rápido

1. ✅ Imagen construida
2. ✅ Token configurado en `.env`
3. 📝 Editar `claude_desktop_config.json`
4. 🔄 Reiniciar Claude Desktop
5. 🧪 Probar con consultas al MCP

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que Docker Desktop esté corriendo
2. Comprueba que la imagen existe (`docker images`)
3. Verifica la ruta del `.env` en la configuración
4. Revisa los logs de Docker
5. Reinicia Claude Desktop completamente

---

**Creado por:** Gian Baeza
**Fecha:** Octubre 2025
**Versión:** 1.0.0
