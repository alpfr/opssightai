# AI Compliance Platform Frontend Dockerfile

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps and explicitly install react-scripts
RUN npm install --legacy-peer-deps && \
    npm install react-scripts@5.0.1 --legacy-peer-deps

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]