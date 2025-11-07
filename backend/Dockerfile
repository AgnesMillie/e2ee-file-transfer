# backend/Dockerfile

# Use a stable Node.js Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
# This optimizes Docker's layer caching.
# Se package*.json não mudar, o Docker reutiliza o 'RUN npm install'
COPY package*.json ./

# Instale todas as dependências (incluindo devDependencies)
# 'npm ci' é geralmente preferido em CI para instalações exatas,
# mas 'npm install' é robusto para o desenvolvimento inicial.
RUN npm install

# Copia o restante do código-fonte da aplicação
# Nota: Este passo é importante para construir a imagem standalone.
# No docker-compose (dev), este diretório será "coberto"
# pelo volume mount que fizemos, permitindo o hot-reloading.
COPY . .

# Expõe a porta em que o NestJS (e o node) rodará
EXPOSE 3000

# O comando para iniciar a aplicação em modo de desenvolvimento (hot-reload)
# Este é o comando padrão do boilerplate do NestJS
CMD ["npm", "run", "start:dev"]