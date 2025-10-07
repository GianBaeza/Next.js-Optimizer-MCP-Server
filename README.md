# 🚀 GitHub Next.js Optimizer MCP Server# 🚀 GitHub Next.js Optimizer MCP Server# GitHub Next.js Optimizer MCP Server# GitHub Next.js Optimizer MCP Server



<div align="center">**Servidor MCP que analiza repositorios de GitHub y proporciona recomendaciones de optimización para proyectos Next.js y React.**



![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)Detecta automáticamente problemas de rendimiento, re-renderizados innecesarios, y sugiere mejores prácticas para optimizar tu código.Servidor MCP que analiza repositorios de GitHub y proporciona recomendaciones de optimización para proyectos Next.js y React, enfocándose en evitar re-renderizados innecesarios y seguir mejores prácticas.> **Creado por Gian Baeza**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)> **Creado por [Gian Baeza](https://github.com/GianBaeza)**

![Claude](https://img.shields.io/badge/Claude%20MCP-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white)

---## 🚀 InstalaciónServidor MCP que analiza repositorios de GitHub y proporciona recomendaciones de optimización para proyectos Next.js y React, enfocándose en evitar re-renderizados innecesarios y seguir mejores prácticas.

**Servidor MCP que analiza repositorios de GitHub y proporciona recomendaciones de optimización automáticas para proyectos Next.js y React**

## 🎯 Características

*Detecta problemas de rendimiento, re-renderizados innecesarios y sugiere mejores prácticas*

### **Detección de Re-renders Innecesarios**```bash## 🚀 Instalación

[🚀 Instalación](#-instalación) • [⚙️ Configuración](#️-configuración) • [📖 Uso](#-uso) • [🔧 Solución de Problemas](#-solución-de-problemas)

-   ✅ Funciones inline en loops (`.map`, `.filter`)

</div>

-   ✅ Objetos creados inline como props# Clonar o crear el proyecto

---

-   ✅ `useState` sin memoización apropiada

## 🎯 ¿Qué hace este MCP?

-   ✅ Falta de `useCallback`/`useMemo`mkdir github-nextjs-optimizer-mcp```bash

### **🔍 Detección Automática de Problemas**

### **Optimizaciones Específicas de Next.js**cd github-nextjs-optimizer-mcp# Clonar el repositorio

| Categoría | Detecciones |

|-----------|-------------|-   ✅ Uso de `<img>` en lugar de `next/image`

| **Re-renders** | Funciones inline en `.map()`, objetos como props, `useState` sin memoización |

| **Next.js** | `<img>` vs `next/image`, `getServerSideProps` obsoleto, Server Components |-   ✅ `getServerSideProps` en Next.js 13+git clone https://github.com/tu-usuario/github-nextjs-optimizer-mcp.git

| **Performance** | Componentes grandes (+300 líneas), imports no optimizados |

| **TypeScript** | Falta de tipos, `any` innecesario, interfaces vs types |-   ✅ Uso apropiado de Server Components



### **📊 Ejemplo de Análisis**-   ✅ Metadata API vs `next/head`# Instalar dependenciascd github-nextjs-optimizer-mcp



```json### **Análisis de Arquitectura**npm install

{

  "repository": "mi-usuario/mi-proyecto-nextjs",-   ✅ Componentes muy grandes (>300 líneas)

  "summary": {

    "filesAnalyzed": 15,-   ✅ Múltiples responsabilidades en un componente# Instalar dependencias

    "issues": { "high": 8, "medium": 12, "low": 3 }

  },-   ✅ Falta de definición de tipos TypeScript

  "topIssues": [

    { "issue": "Función inline en map", "count": 6, "severity": "high" },-   ✅ Imports no optimizados (tree-shaking)# Compilarnpm install

    { "issue": "Uso de <img> vs next/image", "count": 4, "severity": "medium" }

  ],---npm run build

  "recommendations": [

    "Implementar useCallback en componentes con loops",## 📦 Instalación```# Compilar

    "Migrar imágenes a next/image para mejor SEO"

  ]````bashnpm run build

}

```# Clonar el repositorio



---git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.git## 🔑 Obtener Token de GitHub```



## 🚀 Instalacióncd Next.js-Optimizer-MCP-Server



### **Paso 1: Clonar el Repositorio**



```bash# Instalar dependencias

git clone https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server.git

cd Next.js-Optimizer-MCP-Servernpm install1. Ve a GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)## 🔑 Obtener Token de GitHub

```



### **Paso 2: Instalar Dependencias**

# Compilar el proyecto2. Genera un nuevo token con estos permisos:

```bash

npm installnpm run build

npm run build

``````    - `repo` (acceso completo a repositorios)1. Ve a [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)



### **Paso 3: Verificar Instalación**



```bash---    - `read:org` (si necesitas leer repos de organizaciones)2. Genera un nuevo token con estos permisos:

# Debería mostrar: "🚀 GitHub Next.js Optimizer MCP Server iniciado"

node build/index.js

```

## 🔑 Configuración del Token de GitHub3. Copia el token generado    - `repo` (acceso completo a repositorios)

---



## 🔑 Configurar Token de GitHub

### **Paso 1: Crear el Token**    - `read:org` (opcional, si necesitas leer repos de organizaciones)

### **1. Crear Token Personal**



1. Ve a [GitHub → Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)

2. Click **"Generate new token (classic)"**1. Ve a **GitHub.com** → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**## ⚙️ Configuración en Claude Desktop3. Copia el token generado

3. Configura el token:

   - **Name:** `MCP Next.js Optimizer`2. Haz clic en **"Generate new token (classic)"**

   - **Expiration:** `90 days` (recomendado)

   - **Scopes:** Selecciona:3. Selecciona estos permisos:

     - ✅ `repo` - Acceso completo a repositorios

     - ✅ `public_repo` - Repositorios públicos   - ✅ `repo` - Acceso completo a repositorios

     - ✅ `read:org` - Leer organizaciones (opcional)

   - ✅ `public_repo` - Acceso a repositorios públicos### Windows## ⚙️ Configuración en Claude Desktop

4. **Copia el token** (empieza con `ghp_` o `github_pat_`)

4. Copia el token generado (empieza con `ghp_` o `github_pat_`)

> ⚠️ **Importante:** Guarda el token en un lugar seguro. No podrás verlo nuevamente.



---

---

## ⚙️ Configuración en Claude Desktop

Edita: `%APPDATA%\Claude\claude_desktop_config.json`### macOS

### **Ubicar el Archivo de Configuración**

## ⚙️ Configuración en Claude Desktop

| Sistema Operativo | Ruta del Archivo |

|-------------------|------------------|

| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |

| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |### **Ubicación del Archivo:**

| **Linux** | `~/.config/Claude/claude_desktop_config.json` |

```jsonEdita: `~/Library/Application Support/Claude/claude_desktop_config.json`

### **Configuración Completa**

| Sistema | Ruta |

Abre el archivo `claude_desktop_config.json` y pega esta configuración:

|---------|------|{

```json

{| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |

  "mcpServers": {

    "github-nextjs-optimizer": {| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |    "mcpServers": {### Windows

      "command": "node",

      "args": [| **Linux** | `~/.config/Claude/claude_desktop_config.json` |

        "RUTA_COMPLETA_AL_PROYECTO/build/index.js"

      ],        "github-nextjs-optimizer": {

      "env": {

        "GITHUB_TOKEN": "TU_TOKEN_DE_GITHUB_AQUÍ"### **Configuración:**

      }

    }            "command": "node",Edita: `%APPDATA%\Claude\claude_desktop_config.json`

  }

}```json

```

{            "args": ["C:\\Users\\PC\\Desktop\\MCP\\github-nextjs-optimizer-mcp\\build\\index.js"],

### **Ejemplos por Sistema**

    "mcpServers": {

<details>

<summary><strong>🪟 Windows</strong></summary>        "github-nextjs-optimizer": {            "env": {### Linux



```json            "command": "node",

{

  "mcpServers": {            "args": [                "GITHUB_TOKEN": "tu_token_aqui"

    "github-nextjs-optimizer": {

      "command": "node",                "RUTA_COMPLETA_AL_PROYECTO/build/index.js"

      "args": [

        "C:\\Users\\TuUsuario\\Desktop\\Next.js-Optimizer-MCP-Server\\build\\index.js"            ],            }Edita: `~/.config/Claude/claude_desktop_config.json`

      ],

      "env": {            "env": {

        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

      }                "GITHUB_TOKEN": "TU_TOKEN_DE_GITHUB_AQUÍ"        }

    }

  }            }

}

```        }    }Agrega esta configuración:



**Ruta rápida para abrir el archivo:**    }

1. Presiona `Win + R`

2. Escribe: `%APPDATA%\Claude`}}

3. Abre `claude_desktop_config.json`

````

</details>

```````json

<details>

<summary><strong>🍎 macOS</strong></summary>### **Ejemplo Windows:**



```json```json{

{

  "mcpServers": {{

    "github-nextjs-optimizer": {

      "command": "node",    "mcpServers": {## 📖 Uso en Claude    "mcpServers": {

      "args": [

        "/Users/tuusuario/Desktop/Next.js-Optimizer-MCP-Server/build/index.js"        "github-nextjs-optimizer": {

      ],

      "env": {            "command": "node",        "github-nextjs-optimizer": {

        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

      }            "args": [

    }

  }                "C:\\MCP\\Next.js-Optimizer-MCP-Server\\build\\index.js"Una vez configurado, reinicia Claude Desktop y podrás usar estas herramientas:            "command": "node",

}

```            ],



**Abrir archivo desde Terminal:**            "env": {            "args": ["/ruta/completa/al/proyecto/build/index.js"]

```bash

open ~/Library/Application\ Support/Claude/claude_desktop_config.json                "GITHUB_TOKEN": "github_pat_11XXXXXXXXXXXXXXX"

```

            }### 1. Analizar repositorio completo        }

</details>

        }

<details>

<summary><strong>🐧 Linux</strong></summary>    }    }



```json}

{

  "mcpServers": {``````}

    "github-nextjs-optimizer": {

      "command": "node",

      "args": [

        "/home/tuusuario/Desktop/Next.js-Optimizer-MCP-Server/build/index.js"**⚠️ Importante:**Analiza el repositorio completo miusuario/mi-proyecto-nextjs```

      ],

      "env": {1. Reemplaza `RUTA_COMPLETA_AL_PROYECTO` con la ruta real

        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

      }2. Reemplaza `TU_TOKEN_DE_GITHUB_AQUÍ` con tu token real```

    }

  }3. Reinicia Claude Desktop después de guardar

}

```**Para desarrollo (sin compilar):**



**Abrir archivo desde Terminal:**---

```bash

nano ~/.config/Claude/claude_desktop_config.json### 2. Listar archivos React/Next.js

```

## 🏃‍♂️ Uso

</details>

```json

### **⚠️ Pasos Críticos**

### **1. Verificar instalación:**

1. **Reemplaza `RUTA_COMPLETA_AL_PROYECTO`** con la ruta real donde clonaste el proyecto

2. **Reemplaza `TU_TOKEN_DE_GITHUB_AQUÍ`** con tu token real de GitHub``````{

3. **Usa barras dobles (`\\`)** en Windows para las rutas

4. **Guarda el archivo** y **reinicia Claude Desktop completamente**¿Qué herramientas MCP tienes disponibles?



---```Lista todos los archivos React en el repositorio vercel/next.js    "mcpServers": {



## 📖 Uso



### **1. Verificar que Funciona**### **2. Analizar repositorio:**```        "github-nextjs-optimizer": {



En Claude Desktop, escribe:```



```Analiza el repositorio vercel/next.js para optimizaciones            "command": "npx",

¿Qué herramientas MCP tienes disponibles?

``````



**✅ Respuesta esperada:** Deberías ver herramientas como `analizar_repositorio`, `listar_archivos_react`, etc.### 3. Analizar un archivo específico            "args": ["-y", "tsx", "/ruta/completa/al/proyecto/src/index.ts"]



### **2. Comandos de Ejemplo**### **3. Listar archivos React:**



#### **Analizar Repositorio Completo**```        }

```

Analiza el repositorio vercel/next.js para encontrar optimizacionesLista archivos React del repositorio facebook/react

```

``````    }

#### **Listar Archivos React**

```

Lista todos los archivos React en el repositorio facebook/react

```### **4. Analizar archivo específico:**Analiza el archivo app/page.tsx del repositorio miusuario/mi-proyecto}



#### **Analizar Archivo Específico**```

```

Analiza el archivo src/components/Header.tsx del repositorio mi-usuario/mi-proyectoAnaliza el archivo src/app/page.tsx del repositorio mi-usuario/mi-proyecto``````

```

```

#### **Análisis Avanzado**

```

Revisa el repositorio mi-usuario/mi-nextjs-app buscando problemas de rendimiento y re-renderizados

```---



---## 🎯 Qué detecta el analizador## 📖 Uso en Claude



## 🛠️ Comandos Disponibles## 🛠️ Comandos Disponibles



| Comando | Descripción | Ejemplo de Uso |

|---------|-------------|----------------|

| `analizar_repositorio` | Análisis completo del repositorio | `Analiza miusuario/mi-proyecto` || Comando | Descripción |

| `listar_archivos_react` | Lista archivos `.jsx`, `.tsx` | `Lista archivos React en vercel/next.js` |

| `analizar_archivo` | Analiza un archivo específico | `Analiza src/app/page.tsx de mi-repo` ||---------|-------------|### Re-renders innecesariosUna vez configurado, reinicia Claude Desktop y podrás usar estas herramientas:



---| `analizar_repositorio` | Analiza todo el repositorio |



## 🔧 Solución de Problemas| `listar_archivos_react` | Lista archivos .jsx/.tsx |- ✅ Funciones inline en loops (.map, .filter)



### **❌ "No tengo herramientas MCP disponibles"**| `analizar_archivo` | Analiza un archivo específico |



**Posibles causas y soluciones:**- ✅ Objetos creados inline como props### 1. Configurar GitHub



<details>---

<summary><strong>1. Configuración incorrecta</strong></summary>

- ✅ useState sin memoización apropiada

- ✅ Verifica que `claude_desktop_config.json` existe en la ruta correcta

- ✅ Confirma que la ruta a `build/index.js` es absoluta y correcta## 🔧 Solución de Problemas

- ✅ Asegúrate de usar barras dobles `\\` en Windows

- ✅ Falta de useCallback/useMemo```

**Verificar ruta:**

```bash### **❌ "No tengo herramientas MCP disponibles"**

# Windows

dir "C:\tu\ruta\al\proyecto\build\index.js"1. Verifica que el archivo `claude_desktop_config.json` existeConfigura mi acceso a GitHub con el token: ghp_xxxxxxxxxxxxx



# macOS/Linux2. Confirma que la ruta al `build/index.js` es correcta

ls "/tu/ruta/al/proyecto/build/index.js"

```3. Ejecuta `npm run build` ### Optimizaciones Next.js```



</details>4. Reinicia Claude Desktop completamente



<details>- ✅ Uso de `<img>` en lugar de `next/image`

<summary><strong>2. Archivo no compilado</strong></summary>

### **❌ "Repository not found"**

```bash

cd Next.js-Optimizer-MCP-Server1. Verifica que el token es correcto- ✅ getServerSideProps en Next.js 13+### 2. Listar archivos React/Next.js

npm run build

```2. Confirma que el token tiene permisos `repo`



Deberías ver el archivo `build/index.js` creado.3. Prueba: `curl -H "Authorization: token TU_TOKEN" https://api.github.com/user`- ✅ Uso apropiado de Server Components



</details>



<details>### **❌ El servidor no inicia**- ✅ Metadata API```

<summary><strong>3. Claude Desktop no reiniciado</strong></summary>

1. Reinstala dependencias: `npm install`

1. Cierra **completamente** Claude Desktop

2. En Windows: Verifica que no esté en la bandeja del sistema2. Recompila: `npm run build`Lista todos los archivos React en el repositorio vercel/next.js

3. Reabre Claude Desktop

4. Espera 30 segundos antes de probar3. Verifica Node.js versión 18+: `node --version`



</details>### Arquitectura y patrones```



### **❌ "Repository not found" o errores de GitHub**---



<details>- ✅ Componentes muy grandes (>300 líneas)

<summary><strong>Token inválido o sin permisos</strong></summary>

## 📝 Desarrollo

**Verificar token:**

```bash- ✅ Múltiples responsabilidades en un componente### 3. Analizar un archivo específico

curl -H "Authorization: token TU_TOKEN" https://api.github.com/user

``````bash



**Respuesta esperada:** Información de tu usuario de GitHub# Modo desarrollo- ✅ Falta de definición de tipos



**Si falla:**npm run dev

1. Verifica que el token es correcto

2. Confirma que tiene permisos `repo`- ✅ Imports no optimizados (tree-shaking)```

3. Regenera el token si es necesario

# Compilar

</details>

npm run buildAnaliza el archivo app/page.tsx del repositorio miusuario/mi-proyecto

### **❌ El servidor no inicia**



<details>

<summary><strong>Problemas de dependencias</strong></summary># Watch mode## 🛠️ Desarrollo```



```bashnpm run watch

# Limpiar e instalar

rm -rf node_modules package-lock.json```

npm install

npm run build



# Verificar Node.js---```bash### 4. Analizar repositorio completo

node --version  # Debe ser 18.0.0 o superior

```



</details>## 🔒 Seguridad# Modo desarrollo (recarga automática)



### **❌ Errores de permisos**



<details>- ❌ **NUNCA** compartas tu token de GitHubnpm run dev```

<summary><strong>Permisos de archivos</strong></summary>

- ✅ Usa tokens con permisos mínimos necesarios

**Windows:** Ejecuta PowerShell como administrador

**macOS/Linux:** - ✅ Revoca tokens no utilizadosAnaliza el repositorio completo miusuario/mi-proyecto-nextjs

```bash

chmod +x build/index.js

# Si es necesario, usa sudo para operaciones de archivo

```---# Compilar```



</details>



---## 📄 Licencianpm run build



## 📝 Para Desarrolladores



### **Estructura del Proyecto**MIT License## 🎯 Qué detecta el analizador



```

Next.js-Optimizer-MCP-Server/

├── src/---# Ejecutar compilado

│   ├── index.ts          # Código fuente principal

│   └── patterns/         # Patrones de análisis

├── build/

│   └── index.js          # Código compilado## 👨‍💻 Autornpm start### Re-renders innecesarios

├── package.json          # Configuración npm

├── tsconfig.json         # Configuración TypeScript

└── README.md            # Este archivo

```**Gian Baeza**```



### **Comandos de Desarrollo**- GitHub: [@GianBaeza](https://github.com/GianBaeza)



```bash- Proyecto: [Next.js-Optimizer-MCP-Server](https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server)-   ✅ Funciones inline en loops (.map, .filter)

# Desarrollo con recarga automática

npm run dev



# Compilar para producción---## 📄 Licencia-   ✅ Objetos creados inline como props

npm run build



# Watch mode (recompila al guardar)

npm run watch⭐ **¿Te fue útil? ¡Dale una estrella al repositorio!**-   ✅ useState sin memoización apropiada



# Ejecutar testsMIT-   ✅ Falta de useCallback/useMemo

npm test

```### Optimizaciones Next.js



### **Agregar Nuevos Patrones**-   ✅ Uso de `<img>` en lugar de `next/image`

-   ✅ getServerSideProps en Next.js 13+

Edita `src/index.ts` y añade patrones en `analysisPatterns`:-   ✅ Uso apropiado de Server Components

-   ✅ Metadata API

```typescript

{### Arquitectura y patrones

    pattern: /tu-regex-aqui/g,

    issue: 'Descripción del problema',-   ✅ Componentes muy grandes (>300 líneas)

    recommendation: 'Cómo solucionarlo',-   ✅ Múltiples responsabilidades en un componente

    severity: 'high' | 'medium' | 'low'-   ✅ Falta de definición de tipos

}-   ✅ Imports no optimizados (tree-shaking)

```-   ✅ CSS-in-JS vs alternativas más eficientes



---### Performance



## 🤝 Contribuir-   ✅ Bundle size issues

-   ✅ React.memo sin comparación personalizada

¡Las contribuciones son bienvenidas!-   ✅ Componentes sin optimización



### **Proceso de Contribución**## 📊 Ejemplo de salida



1. **Fork** el repositorio```json

2. **Crea una rama:** `git checkout -b feature/nueva-caracteristica`{

3. **Haz cambios** y pruébalos    "repository": "usuario/proyecto",

4. **Commit:** `git commit -m "Agregar nueva característica"`    "filesAnalyzed": 20,

5. **Push:** `git push origin feature/nueva-caracteristica`    "totalIssues": 45,

6. **Abre un Pull Request**    "summary": {

        "total": 45,

### **Ideas para Contribuir**        "high": 12,

        "medium": 20,

- 🔍 Más patrones de detección        "low": 10,

- 🎨 Soporte para Vue.js, Angular        "good": 3

- 📊 Métricas de rendimiento en tiempo real    },

- 🔧 Integración con ESLint/Prettier    "topIssues": [

- 📱 Optimizaciones para móviles        {

- 🌐 Análisis de Web Vitals            "issue": "Función inline en map",

            "count": 15

---        },

        {

## 🔒 Seguridad            "issue": "Uso de <img> en lugar de next/image",

            "count": 8

### **Mejores Prácticas**        }

    ]

- ❌ **NUNCA** compartas tu token de GitHub públicamente}

- ❌ **NO** incluyas tokens en commits o código```

- ✅ Usa tokens con **permisos mínimos** necesarios

- ✅ **Revoca tokens** no utilizados regularmente## 🛠️ Desarrollo

- ✅ Considera usar **Fine-grained tokens** para mayor seguridad

- ✅ Configura **expiración** en tus tokens```bash

# Modo desarrollo (recarga automática)

### **Reportar Vulnerabilidades**npm run dev



Si encuentras una vulnerabilidad de seguridad, por favor **NO** abras un issue público. En su lugar:# Compilar

npm run build

1. Envía un email a: `security@tu-dominio.com`

2. Incluye una descripción detallada# Watch mode (recompila al guardar)

3. Espera respuesta antes de divulgación públicanpm run watch



---# Ejecutar compilado

npm start

## 📄 Licencia```



```## 📝 Notas importantes

MIT License

-   El análisis se limita a 20 archivos por repositorio para evitar rate limits

Copyright (c) 2025 Gian Baeza-   Requiere token de GitHub con permisos de lectura

-   No modifica ningún código, solo proporciona recomendaciones

Permission is hereby granted, free of charge, to any person obtaining a copy-   Los resultados son análisis estáticos basados en patrones conocidos

of this software and associated documentation files (the "Software"), to deal

in the Software without restriction, including without limitation the rights## 🔒 Seguridad

to use, copy, modify, merge, publish, distribute, sublicense, and/or sell

copies of the Software, and to permit persons to whom the Software is-   Nunca compartas tu token de GitHub

furnished to do so, subject to the following conditions:-   El token solo se almacena en memoria durante la sesión

-   Usa tokens con permisos mínimos necesarios

The above copyright notice and this permission notice shall be included in all-   Considera usar Fine-grained tokens para mayor seguridad

copies or substantial portions of the Software.

## 🤝 Contribuir

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR

IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,Las contribuciones son bienvenidas. Por favor:

FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE

AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER1. Fork el proyecto

LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)

OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)

SOFTWARE.4. Push a la rama (`git push origin feature/AmazingFeature`)

```5. Abre un Pull Request



---### Ideas para contribuir:



## 👨‍💻 Autor-   Más patrones de detección

-   Soporte para otros frameworks (Vue, Angular)

<div align="center">-   Análisis de rendimiento en tiempo de ejecución

-   Integración con herramientas de linting

**Gian Baeza**

## 👨‍💻 Autor

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/GianBaeza)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/gian-baeza)**Gian Baeza**



*Desarrollador especializado en optimización de React y Next.js*-   GitHub: [@tu-usuario](https://github.com/tu-usuario)

-   LinkedIn: [Tu perfil](https://linkedin.com/in/tu-perfil)

</div>-   Email: tu-email@ejemplo.com



---## 🙏 Agradecimientos



<div align="center">-   Anthropic por el protocolo MCP

-   La comunidad de Next.js y React

## ⭐ ¿Te fue útil?-   Todos los contribuidores



Si este MCP Server te ayudó a optimizar tu código, ¡considera darle una estrella!## 📄 Licencia



[![Star](https://img.shields.io/github/stars/GianBaeza/Next.js-Optimizer-MCP-Server?style=social)](https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server)MIT

#   N e x t . j s - O p t i m i z e r - M C P - S e r v e r 

[⭐ **Dar Estrella**](https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server) • [🐛 **Reportar Bug**](https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server/issues) • [💡 **Sugerir Feature**](https://github.com/GianBaeza/Next.js-Optimizer-MCP-Server/issues) 

 

</div>
MIT License

Copyright (c) 2025 Gian Baeza

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub
```````
