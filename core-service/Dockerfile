FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# PM2 is recommended for Node.js clustering in production
RUN npm install -g pm2

# Run using pm2-runtime to utilize max CPU cores (e.g., 4 cores = 4 instances)
CMD ["pm2-runtime", "start", "dist/main.js", "-i", "max"]
