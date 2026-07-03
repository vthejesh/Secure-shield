# Docker
FROM node:18-alpine

WORKDIR /app

# Install backend deps
COPY package*.json ./
RUN npm ci --production

# Install frontend deps & build
COPY client/package*.json ./client/
RUN cd client && npm ci && cd ..

# Copy source
COPY . .

# Build frontend
RUN cd client && npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server/index.js"]
