#!/bin/bash

# Tạo migration mới từ entities
echo "🔄 Generating migration from current entities..."

# Tạo migration từ entities hiện tại
NODE_OPTIONS='-r tsconfig-paths/register' npx typeorm-ts-node-commonjs migration:generate src/database/migrations/UpdateEntities -d src/database/database.ts

echo "✅ Migration generated successfully!"
echo "📝 Review the generated migration file before running it"
echo "🚀 Run 'npm run db:migrate' to apply the migration"
