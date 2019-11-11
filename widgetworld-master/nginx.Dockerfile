# Use Node to build application
FROM node:11-alpine as angular

# Set maintainer.
LABEL maintainer="Intermx"

# Set Working Directory
WORKDIR /usr/src/app

# Run npm with full permission
RUN npm config set unsafe-perm true

# Run npm with full permission
RUN npm install -g @angular/cli

# No cache
RUN apk add --no-cache git

# Copy package.json
COPY package*.json ./

# Copy build-scripts Directory for node post build
COPY build-scripts/* /usr/src/app/build-scripts/

# Run npm continuous integration with full permission
RUN npm ci

# Copy in the rest of the files
COPY . .

# Build as prod
RUN ng build --prod

# Use Nginx for proxy
FROM nginx:stable-alpine

# Copy nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Copy in compiled build from angular stage
COPY --from=angular /usr/src/app/dist /usr/share/nginx/html

# Use PORT 80
EXPOSE 80

# Run NGINX
CMD ["nginx", "-g", "daemon off;"]
