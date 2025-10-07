# Dockerfile multi-stage para GitHub Next.js Optimizer MCP Server
# Creado por Gian Baeza

# Etapa 1: Build
FROM node:20-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src

# Compilar TypeScript a JavaScript
RUN npm run build

# Etapa 2: Production
FROM node:20-alpine

# Metadatos
LABEL maintainer="Gian Baeza"
LABEL description="MCP Server para analizar y optimizar repositorios Next.js/React en GitHub"
LABEL version="1.0.0"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar el código compilado desde la etapa de build
COPY --from=builder /app/build ./build

# Usuario no root para seguridad
RUN addgroup -g 1001 -S mcp && \
    adduser -S mcp -u 1001 && \
    chown -R mcp:mcp /app

USER mcp

# Puerto (MCP usa stdio, pero se deja para futura expansión)
EXPOSE 3000

# Comando de inicio
CMD ["node", "build/index.js"]
