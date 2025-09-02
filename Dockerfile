# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY app/package*.json ./app/

# Install dependencies
RUN npm install --prefix ./app ./app

# Copy the rest of the application code
COPY app/ ./app/
COPY scripts/ ./scripts/
COPY archive/ ./archive/

# Generate archive index and build the React app
RUN node scripts/generate-archive-index.js && npm run build --prefix ./app

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the build output from the build stage
COPY --from=build /app/app/build /usr/share/nginx/html

# Copy the archive data
COPY --from=build /app/archive /usr/share/nginx/html/archive

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
