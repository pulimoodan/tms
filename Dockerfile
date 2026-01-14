FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci && cd client && npm ci

COPY . .

RUN npx prisma generate && \
    npm run build && \
    cd client && npm run build

FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production && \
    npm install --save-dev ts-node typescript tsconfig-paths

COPY prisma ./prisma
COPY scripts ./scripts
COPY tsconfig.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

RUN npx prisma generate

EXPOSE 3000

CMD npx prisma migrate deploy && node dist/src/main.js

