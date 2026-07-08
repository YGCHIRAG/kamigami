FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (using your retry settings)
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm install

# Copy the rest of the application
COPY . .

EXPOSE 3000

# Generate prisma client and start the app at runtime
CMD npx prisma generate && npm start