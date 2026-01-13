#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Uso: $0 /caminho/para/backup.sql[.gz]"
  exit 1
fi
BACKUP_FILE="$1"

# Load .env
if [ -f .env ]; then
  while IFS='=' read -r key val; do
    case "$key" in
      ''|#*) continue;;
      *) export "$key"="${val%\"}";;
    esac
  done < <(grep -v '^#' .env)
fi

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

echo "Restaurando '$BACKUP_FILE' para o banco '$DB_NAME' (host=$DB_HOST port=$DB_PORT)"
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | mysql -h "$DB_HOST" -P "$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME"
else
  mysql -h "$DB_HOST" -P "$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$BACKUP_FILE"
fi

echo "Restauração concluída."
