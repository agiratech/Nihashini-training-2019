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

COPY . .

# Build as prod
RUN ng build --prod

# Use node image to build nodejs express application
FROM node:11-alpine

# Switch to app folder
WORKDIR /usr/src/app

# Copy everything into the new container
COPY . .

# Set the work directory to travis to use the nodejs server
WORKDIR /usr/src/app/travis

# Install dependencies from package.json
RUN npm install

# Copy in compiled angular application
COPY --from=angular /usr/src/app/dist dist/

# Open port 3000
EXPOSE 3000

# Run node application
CMD ["node", "./bin/www"]
