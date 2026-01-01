# Production Scripts

## Backup Production Data

Backs up essential tables for production migration.

**Usage:**
```bash
# Set database connection (optional, defaults shown)
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=tms_db
export DB_USER=postgres
export BACKUP_DIR=./backups

# Run backup
./scripts/backup-production-data.sh
```

**Backs up these tables:**
- Core: companies, users, roles, customers, drivers, vehicles
- Required: locations, customer_routes, credit_terms, role_permissions
- Optional: contracts, contract_routes, orders

## Restore Production Data

Restores data from a backup file to production database.

**Usage:**
```bash
./scripts/restore-production-data.sh <backup_file.sql>
```

**Example:**
```bash
./scripts/restore-production-data.sh ./backups/production_backup_20250101_120000.sql
```

**Important:** Always run migrations first before restoring data:
```bash
npm run prisma:migrate:deploy
```

