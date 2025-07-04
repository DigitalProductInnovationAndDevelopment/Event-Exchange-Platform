# STAGE 1: Build
FROM node:21-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN npm run prod

# STAGE 2: Serve with NGINX
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
