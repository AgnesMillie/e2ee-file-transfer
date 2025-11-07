# frontend/Dockerfile

# Use a stable Node.js Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Otimização de cache do Docker:
# Copia apenas package.json e package-lock.json primeiro.
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código-fonte da aplicação
# (Em dev, este diretório será "coberto" pelo volume do docker-compose)
COPY . .

# Expõe a porta padrão do Vite
EXPOSE 5173

# O comando para iniciar o Vite em modo de desenvolvimento
# A flag '--host 0.0.0.0' é OBRIGATÓRIA para que o
# servidor seja acessível de fora do contêiner Docker.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]