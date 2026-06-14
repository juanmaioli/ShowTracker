FROM node:20-alpine AS builder

# Instalar herramientas de compilación para dependencias nativas (better-sqlite3)
RUN apk add --no-cache build-base python3

WORKDIR /app

COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Etapa final de ejecución
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar dependencias ya compiladas y código fuente
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Crear directorio para la base de datos SQLite y asignar permisos adecuados
RUN mkdir -p db

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
