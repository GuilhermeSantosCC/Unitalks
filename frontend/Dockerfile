# --- Estágio 1: Build ---
# Usa uma imagem Node para construir o projeto
FROM node:18-alpine AS build

# ... (início do arquivo)
WORKDIR /app

# Copia APENAS os arquivos de dependência primeiro
COPY package.json package-lock.json* bun.lockb* ./

# Instala as dependências (o flag --legacy-peer-deps ajuda se houver conflito entre bun/npm)
RUN npm install --legacy-peer-deps

# Copia o resto do código (agora organizado na pasta src)
COPY . .

# Faz o build
RUN npm run build

# --- Estágio 2: Produção ---
# Usa o Nginx para servir os arquivos estáticos
FROM nginx:alpine

# Copia os arquivos gerados no estágio anterior para a pasta pública do Nginx
# O Vite gera os arquivos na pasta 'dist' por padrão
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80 (padrão web)
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]