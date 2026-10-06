#!/bin/sh
# entrypoint-worker.sh - Script để khởi động worker trong Docker

# Nếu chạy production (đã compile), không cần tsconfig-paths
if [ "$NODE_ENV" = "production" ]; then
  exec node --max-old-space-size=8192 dist/worker.js
else
  # Development mode (nếu cần)
  exec node --max-old-space-size=8192 -r tsconfig-paths/register dist/worker.js
fi
