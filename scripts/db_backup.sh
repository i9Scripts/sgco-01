#!/usr/bin/env bash
set -euo pipefail

# Load .env (simple parser)
if [ -f .env ]; then
  while IFS='=' read -r key val; do
    case "$key" in
      ''|#*) continue;;
      *) export "$key"="${val%\"}";;
    esac
  done < <(grep -v '^#' .env)
fi

# Parse DATABASE_URL if present (format: mysql://user:pass@host:port/dbname)
if [ -n "${DATABASE_URL:-}" ]; then
  dburl=$(echo "$DATABASE_URL" | sed -E 's/^"?(.*)"?$/\1/')
  if echo "$dburl" | grep -q '^mysql://'; then
    parts=$(echo "$dburl" | sed -E 's#mysql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+)#\1 \2 \3 \4 \5#')
    read DB_USER DB_PASS DB_HOST DB_PORT DB_NAME <<< "$parts"
  fi
fi

: "${DB_HOST:=localhost}"
: "${DB_PORT:=3306}"
: "${DB_USER:=root}"
: "${DB_PASS:=}"
: "${DB_NAME:=}"

if [ -z "$DB_NAME" ]; then
  echo "ERRO: nome do banco não definido. Configure DATABASE_URL no arquivo .env ou defina DB_NAME."
  exit 1
fi

BACKUP_DIR="${1:-./backups}"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTFILE="$BACKUP_DIR/${DB_NAME}_$TIMESTAMP.sql.gz"

echo "Criando backup do banco '$DB_NAME' em: $OUTFILE"
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$OUTFILE"

echo "Backup criado com sucesso: $OUTFILE"
