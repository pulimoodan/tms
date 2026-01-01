FROM node:20-slim AS builder

WORKDIR /app

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

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

RUN npx prisma generate

EXPOSE 3000

CMD npx prisma migrate deploy && node dist/src/main.js

