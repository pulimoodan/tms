#!/bin/bash

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-tms_db}"
DB_USER="${DB_USER:-postgres}"
BACKUP_FILE="${1:-./backups/production_backup_latest.sql}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Backup file not found: ${BACKUP_FILE}"
  echo "Usage: $0 <backup_file.sql>"
  exit 1
fi

echo "🔄 Restoring production data..."
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"
echo ""
read -p "⚠️  This will overwrite existing data. Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore cancelled."
  exit 1
fi

psql -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -f "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  echo "✅ Data restored successfully!"
else
  echo "❌ Restore failed!"
  exit 1
fi

