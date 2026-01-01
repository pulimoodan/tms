#!/bin/bash

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-tms_db}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/production_backup_${TIMESTAMP}.sql"

echo "🗄️  Creating production data backup..."
echo "Database: ${DB_NAME}"
echo "Output: ${BACKUP_FILE}"
echo ""

mkdir -p "${BACKUP_DIR}"

pg_dump -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
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
  --column-inserts \
  > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  echo "✅ Backup created successfully: ${BACKUP_FILE}"
  echo ""
  echo "To restore this backup, run:"
  echo "  psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} < ${BACKUP_FILE}"
else
  echo "❌ Backup failed!"
  exit 1
fi

