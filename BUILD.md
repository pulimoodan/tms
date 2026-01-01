# Quick Build Guide

## Quick Start (Production)

### Option 1: Using npm scripts

```bash
# Install dependencies
npm ci
cd client && npm ci && cd ..

# Build everything
npm run build:prod

# Start production server
NODE_ENV=production npm run start:prod
```

### Option 2: Using Docker

```bash
# Build the Docker image
docker build -t tms-app .

# Run the container (ensure PostgreSQL is running separately)
docker run -d \
  --name tms-app \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@host:5432/tms_db \
  -e JWT_SECRET=your-secret-key \
  -e NODE_ENV=production \
  -v $(pwd)/uploads:/app/uploads \
  tms-app
```

## Environment Setup

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/tms_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
CORS_ORIGIN=https://yourdomain.com  # Optional, for CORS
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:3000
```

## Database Setup

```bash
# Create database
createdb tms_db

# Run migrations
npm run prisma:migrate:deploy

# (Optional) Seed data
npm run prisma:seed:companies
```

## What Gets Built

- **Backend**: Compiled to `dist/` directory
- **Frontend**: Built to `client/dist/public/` directory
- **Static Files**: Served from backend in production mode

## Access Points

- **Application**: http://localhost:3000
- **API Docs** (dev only): http://localhost:3000/api
- **API Endpoint**: http://localhost:3000/api/*

For detailed deployment instructions, see [PRODUCTION.md](./PRODUCTION.md)

