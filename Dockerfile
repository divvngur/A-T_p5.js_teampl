# Multi-stage build for Node.js Socket.IO server
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy server and public files
COPY server.js .
COPY public/ ./public/
COPY src/ ./src/
COPY index.html .
COPY 404.html .

# Expose port (Cloud Run will override with PORT env var)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
