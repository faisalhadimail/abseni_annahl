#!/bin/bash

# Script untuk switch antara SQLite dan Postgres schema
# Usage: ./scripts/switch-db.sh [sqlite|postgres]

SCHEMA_TYPE=${1:-sqlite}
PRISMA_DIR="prisma"

if [ "$SCHEMA_TYPE" = "postgres" ]; then
    echo "🔄 Switching to PostgreSQL schema..."
    cp "$PRISMA_DIR/schemas/schema.postgres.prisma" "$PRISMA_DIR/schema.prisma"
    echo "✅ PostgreSQL schema activated"
    echo "⚠️  Pastikan DATABASE_URL dan DIRECT_DATABASE_URL sudah di-set di .env"
elif [ "$SCHEMA_TYPE" = "sqlite" ]; then
    echo "🔄 Switching to SQLite schema..."
    cp "$PRISMA_DIR/schemas/schema.sqlite.prisma" "$PRISMA_DIR/schema.prisma"
    echo "✅ SQLite schema activated"
else
    echo "❌ Unknown schema type: $SCHEMA_TYPE"
    echo "Usage: $0 [sqlite|postgres]"
    exit 1
fi

echo ""
echo "Run 'bun run db:generate' to regenerate Prisma client"
