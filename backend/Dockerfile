FROM node:20-alpine

# Install git, python3, and docker CLI
RUN apk add --no-cache git python3 py3-pip docker-cli bash curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source
COPY . .

# Create temp directory for cloned repos
RUN mkdir -p /tmp/cicd-agent

EXPOSE 4000

CMD ["node", "server.js"]
