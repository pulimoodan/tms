FROM node:20-alpine AS base

WORKDIR /app

FROM base AS dependencies
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci
RUN cd client && npm ci

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/client/node_modules ./client/node_modules
COPY . .
RUN npm run build:prod

FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

