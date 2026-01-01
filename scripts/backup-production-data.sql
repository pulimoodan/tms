-- Production Data Backup Script
-- This script exports data from essential tables for production migration
-- Run this on your development/staging database before deploying to production

-- Essential Tables (Core Data)
\copy companies TO 'companies_backup.csv' WITH CSV HEADER;
\copy users TO 'users_backup.csv' WITH CSV HEADER;
\copy roles TO 'roles_backup.csv' WITH CSV HEADER;
\copy customers TO 'customers_backup.csv' WITH CSV HEADER;
\copy drivers TO 'drivers_backup.csv' WITH CSV HEADER;
\copy vehicles TO 'vehicles_backup.csv' WITH CSV HEADER;

-- Additional Required Tables
\copy locations TO 'locations_backup.csv' WITH CSV HEADER;
\copy customer_routes TO 'customer_routes_backup.csv' WITH CSV HEADER;
\copy credit_terms TO 'credit_terms_backup.csv' WITH CSV HEADER;
\copy role_permissions TO 'role_permissions_backup.csv' WITH CSV HEADER;

-- Optional Tables (if you have data)
\copy contracts TO 'contracts_backup.csv' WITH CSV HEADER;
\copy contract_routes TO 'contract_routes_backup.csv' WITH CSV HEADER;
\copy orders TO 'orders_backup.csv' WITH CSV HEADER;

-- To restore, use:
-- \copy companies FROM 'companies_backup.csv' WITH CSV HEADER;
-- (repeat for each table)

