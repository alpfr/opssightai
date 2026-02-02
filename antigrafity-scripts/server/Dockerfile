FROM node:18-bullseye

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

# Copy package files first for caching
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
WORKDIR /app/server
RUN npm install

WORKDIR /app/client
RUN npm install

# Copy source code
WORKDIR /app
COPY server ./server
COPY client ./client

# Build Frontend
WORKDIR /app/client
RUN npm run build

# Setup Production Environment
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=5100

# Expose the port
EXPOSE 5100

# Start command
CMD ["node", "index.js"]
