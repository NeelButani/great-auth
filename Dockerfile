# Step 1 — Base image
# Instead of installing Node on your machine, you start from
# an official Node image. node:20-alpine means Node 20 on Alpine Linux.
# Alpine is a tiny Linux distro (~5MB). Regular Ubuntu is ~200MB.
# Always use alpine in production — smaller = faster = less attack surface.
FROM node:20-alpine

# Step 2 — Set working directory inside the container
# All commands after this run inside /app
# Think of it as cd /app inside the container
WORKDIR /app

# Step 3 — Copy package files FIRST (before copying your code)
# Why first? Docker caches each step.
# If you copy code first, every code change reinstalls node_modules.
# If you copy package.json first, node_modules only reinstalls
# when dependencies actually change. Huge time saver.
COPY package*.json ./

# Step 4 — Install dependencies inside the container
RUN npm install

# Step 5 — Now copy the rest of your code
COPY . .

# Step 6 — Tell Docker your app runs on port 3000
# This is documentation only — doesn't actually publish the port.
# docker-compose handles actual port publishing.
EXPOSE 3000

# Step 7 — Command to start the app
# This runs when the container starts.
# Use "start" not "dev" — no nodemon in containers.
CMD ["npm", "run", "dev"]