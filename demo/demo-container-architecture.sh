#!/bin/bash

echo "=== CONTAINER ARCHITECTURE DEMO ==="
echo ""
echo "📁 Cấu trúc thư mục modules với container:"
echo ""

echo "🔍 Các file types được tạo:"
find src/modules -name "*.types.ts" | sort
echo ""

echo "🔍 Các file container được tạo:"
find src/modules -name "*.container.ts" | sort
echo ""

echo "📝 Nội dung các file types:"
echo ""

echo "--- AUTH_TYPES ---"
cat src/modules/auth/auth.types.ts
echo ""

echo "--- USER_TYPES ---"
cat src/modules/user/user.types.ts
echo ""

echo "--- NOTIFICATION_TYPES ---"
cat src/modules/notification/notification.types.ts
echo ""

echo "--- TOKEN_TYPES ---"
cat src/modules/token/token.types.ts
echo ""

echo "📝 Container tổng hợp:"
echo "--- CONTAINER.TYPES.TS ---"
head -20 src/shared/types/container.types.ts
echo ""

echo "--- MAIN CONTAINER.TS ---"
head -30 src/config/container.ts
echo ""

echo "✅ Container architecture setup hoàn tất!"
echo ""
echo "📖 Đọc file CONTAINER_ARCHITECTURE.md để hiểu cách sử dụng"
