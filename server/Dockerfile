# Dockerfile for Backend Express Server
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY . .

# Expose server port
EXPOSE 5000

# Start production server
CMD ["npm", "start"]
