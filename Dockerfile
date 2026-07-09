# Step 1 — Base image (Node 20 on Alpine Linux)
FROM node:20-alpine

# Step 2 — Set working directory inside the container
WORKDIR /app

# Step 3 — Copy package files FIRST to cache dependencies
COPY package*.json ./

# Step 4 — Install all dependencies (including devDependencies like tsx)
RUN npm install

# Step 5 — Copy the rest of your code
COPY . .

# Step 6 — Tell Docker your app runs on port 3000
EXPOSE 3000

# Step 7 — Start the app in development mode
# This matches your package.json "dev": "nodemon --exec tsx src/server.ts"
CMD ["npm", "run", "dev"]