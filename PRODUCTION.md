# Production Deployment Guide

This guide covers how to build and deploy the TMS (Transportation Management System) application for production.

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 16+
- (Optional) Docker

## Environment Variables

### Backend (.env)

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/tms_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
```

### Frontend (client/.env)

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:3000
```

For production, set this to your backend API URL:

```env
VITE_API_URL=https://api.yourdomain.com
```

## Manual Deployment

### Step 1: Install Dependencies

```bash
npm ci
cd client && npm ci && cd ..
```

### Step 2: Database Setup

1. Create your PostgreSQL database:

```bash
createdb tms_db
```

2. Run Prisma migrations:

```bash
npm run prisma:migrate:deploy
```

3. Generate Prisma Client:

```bash
npm run prisma:generate
```

### Step 3: Build Application

Build both backend and frontend:

```bash
npm run build:prod
```

This will:

- Generate Prisma Client
- Build the NestJS backend
- Install and build the React frontend

### Step 4: Start Production Server

```bash
NODE_ENV=production npm run start:prod
```

The application will be available at `http://localhost:3000`

## Docker Deployment

1. Build the image:

```bash
docker build -t tms-app .
```

2. Run the container:

```bash
docker run -d \
  --name tms-app \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@host:5432/tms_db \
  -e JWT_SECRET=your-secret-key \
  -e NODE_ENV=production \
  -v $(pwd)/uploads:/app/uploads \
  tms-app
```

## Data Migration

Before deploying to production, you need to migrate your data from development/staging.

### Essential Tables to Backup

**Core Data:**

- `companies` - Company information
- `users` - User accounts
- `roles` - User roles
- `customers` - Customer data
- `drivers` - Driver information
- `vehicles` - Vehicle fleet data

**Additional Required Tables:**

- `locations` - Location data (required for routes and orders)
- `customer_routes` - Customer route configurations (required for waybill creation)
- `credit_terms` - Credit terms (required for contracts)
- `role_permissions` - Role permissions (required for user access control)

**Optional Tables (if applicable):**

- `contracts` - Contract data
- `contract_routes` - Contract route pricing
- `orders` - Historical waybill/order data

### Backup Data

**Option 1: Using the backup script (Recommended)**

```bash
# Set database connection variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=tms_db
export DB_USER=postgres

# Run backup script
./scripts/backup-production-data.sh
```

**Option 2: Using pg_dump directly**

```bash
pg_dump -h localhost -U postgres -d tms_db \
  -t companies \
  -t users \
  -t roles \
  -t customers \
  -t drivers \
  -t vehicles \
  -t locations \
  -t customer_routes \
  -t credit_terms \
  -t role_permissions \
  -t contracts \
  -t contract_routes \
  -t orders \
  --data-only \
  --column-inserts > production_backup.sql
```

### Restore Data to Production

After setting up the production database and running migrations:

```bash
# Using the restore script
./scripts/restore-production-data.sh production_backup.sql

# Or using psql directly
psql -h production_host -U production_user -d production_db < production_backup.sql
```

**Important Notes:**

- Always run migrations first: `npm run prisma:migrate:deploy`
- Ensure the production database schema matches the development schema
- Verify data integrity after restoration
- Test user logins and permissions after migration

## Production Checklist

- [ ] Set strong `JWT_SECRET` in environment variables
- [ ] Configure `DATABASE_URL` with production database credentials
- [ ] Set `VITE_API_URL` to production API URL in client `.env`
- [ ] Run database migrations: `npm run prisma:migrate:deploy`
- [ ] Backup and migrate data from development/staging
- [ ] Restore data to production database
- [ ] Build application: `npm run build:prod`
- [ ] Configure reverse proxy (nginx/Apache) if needed
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up backup strategy for database
- [ ] Configure log rotation
- [ ] Set up monitoring and error tracking

## Reverse Proxy Setup (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Process Manager (PM2)

For production, use PM2 to manage the Node.js process:

1. Install PM2:

```bash
npm install -g pm2
```

2. Start application:

```bash
pm2 start dist/main.js --name tms-app
```

3. Save PM2 configuration:

```bash
pm2 save
pm2 startup
```

## Database Migrations

In production, always use `migrate deploy` instead of `migrate dev`:

```bash
npm run prisma:migrate:deploy
```

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running and accessible
- Verify network/firewall settings

### Frontend Not Loading

- Ensure `npm run build:prod` completed successfully
- Check `client/dist/public` directory exists
- Verify `VITE_API_URL` is set correctly

### File Upload Issues

- Ensure `uploads` directory exists and is writable
- Check `UPLOAD_PATH` environment variable

## Support

For issues or questions, please refer to the project documentation or contact the development team.
