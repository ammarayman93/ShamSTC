# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# äÓÎ ãáİÇÊ ÇáÊÚÑíİ
COPY package*.json ./

# ÊËÈíÊ ÌãíÚ ÇáÍÒã (ÈãÇ İí Ğáß devDependencies)
RUN npm install

# äÓÎ ÈÇŞí ãáİÇÊ ÇáãÔÑæÚ
COPY . .

# ÊäİíĞ ÇáÈäÇÁ
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
# äÓÎ ãáİÇÊ ÇáãæŞÚ
COPY --from=builder /app/dist /usr/share/nginx/html
# ÊÃßÏ ãä ÅÖÇİÉ åĞÇ ÇáÓØÑ (Şã ÈÊÚÏíá ÇÓã Çáãáİ ÅĞÇ ßäÊ ÊÓãíå ÈÇÓã ÂÎÑ)
COPY nginx.conf /etc/nginx/nginx.conf

# ÊÍÏíË ãáİ ÇáÅÚÏÇÏÇÊ ÇáÇİÊÑÇÖí áíÕÈÍ 8080 ÈÏáÇğ ãä 80
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]