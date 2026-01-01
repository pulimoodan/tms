FROM node:20-alpine AS base

WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci && \
    cd client && npm ci

FROM base AS build-backend
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN test -f package.json || (echo "ERROR: package.json not found" && exit 1) && \
    npx prisma generate && \
    npm run build && \
    test -f dist/main.js || (echo "ERROR: Backend build failed - dist/main.js not found" && exit 1)

FROM base AS build-frontend
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY client ./client
WORKDIR /app/client
RUN npm run build && \
    test -d dist/public || (echo "ERROR: Frontend build failed - dist/public not found" && exit 1)

FROM base AS production
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-backend /app/dist ./dist
COPY --from=build-frontend /app/client/dist ./client/dist

RUN npx prisma generate && \
    test -f dist/main.js || (echo "ERROR: dist/main.js missing in production image" && exit 1) && \
    echo "Build verification passed"

EXPOSE 3000

CMD ["node", "dist/main.js"]

