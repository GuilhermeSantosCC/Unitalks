# ----- Estágio 1: Build -----
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json ./
RUN npm install

# Copiar o resto do código-fonte
COPY . .

# Rodar o script de build (ex: 'npm run build')
RUN npm run build

# ----- Estágio 2: Serve -----
FROM nginx:1.25-alpine

# Copiar a build do estágio anterior para a pasta do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
