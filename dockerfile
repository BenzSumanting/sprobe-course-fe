# Use Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Expose port for development
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev"]
