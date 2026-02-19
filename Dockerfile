# Usa um servidor web leve (Nginx)
FROM nginx:alpine

# Copia todos os arquivos da sua pasta para a pasta pública do servidor
COPY . /usr/share/nginx/html

# Expõe a porta 80 (padrão de sites)
EXPOSE 80

# Inicia o servidor
CMD ["nginx", "-g", "daemon off;"]