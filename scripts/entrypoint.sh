#!/bin/sh
# entrypoint.sh - Script để khởi động app trong Docker

# Nếu chạy production (đã compile), không cần tsconfig-paths
if [ "$NODE_ENV" = "production" ]; then
  exec node --max-old-space-size=8192 dist/index.js
else
  # Development mode (nếu cần)
  exec node --max-old-space-size=8192 -r tsconfig-paths/register dist/index.js
fi
