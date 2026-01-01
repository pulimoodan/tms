# TMS Backend Setup

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or pnpm

## Installation Steps

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your DATABASE_URL
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run start:dev
```

## API Documentation

Once the server is running, access Swagger documentation at:
- http://localhost:3000/api

## Available Endpoints

### Users
- `POST /users` - Create a new user
- `GET /users` - Get all users (with pagination)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Roles
- `POST /roles` - Create a new role
- `GET /roles` - Get all roles (with pagination)
- `GET /roles/:id` - Get role by ID
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `POST /roles/:id/permissions` - Add permissions to role
- `PATCH /roles/:id/permissions/:module` - Update role permissions
- `DELETE /roles/:id/permissions/:module` - Remove role permissions

