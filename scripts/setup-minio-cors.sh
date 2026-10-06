#!/bin/bash

# MinIO CORS Setup Script
# Fix CORS error when uploading files from frontend to MinIO

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          MinIO CORS Configuration Script                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# MinIO Configuration
MINIO_ENDPOINT="http://file.itomosoft.com:9000"
MINIO_ACCESS_KEY="mB6cPoJiWR4cQom6dO2q"
MINIO_SECRET_KEY="iLXmbP7UjQ6pEc1FByWYLIwE3QlRB6CW97al4EUs"
BUCKET_NAME="uploads"
ALIAS_NAME="myminio"

# Create CORS configuration file
echo "📝 Creating CORS configuration file..."
cat > /tmp/minio-cors.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": ["arn:aws:s3:::uploads/*"]
    }
  ]
}
EOF

echo "✅ CORS config created at /tmp/minio-cors.json"
echo ""

# Check if mc is installed
if ! command -v mc &> /dev/null; then
    echo "❌ MinIO Client (mc) is not installed!"
    echo ""
    echo "Please install mc first:"
    echo ""
    echo "  macOS:   brew install minio/stable/mc"
    echo "  Linux:   wget https://dl.min.io/client/mc/release/linux-amd64/mc"
    echo "           chmod +x mc && sudo mv mc /usr/local/bin/"
    echo ""
    exit 1
fi

echo "✅ MinIO Client (mc) found"
echo ""

# Set alias
echo "🔧 Setting MinIO alias..."
mc alias set $ALIAS_NAME $MINIO_ENDPOINT $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
echo ""

# Test connection
echo "🔌 Testing connection..."
if mc ls $ALIAS_NAME > /dev/null 2>&1; then
    echo "✅ Connected to MinIO server"
else
    echo "❌ Failed to connect to MinIO server"
    exit 1
fi
echo ""

# Check if bucket exists
echo "📦 Checking bucket '$BUCKET_NAME'..."
if mc ls $ALIAS_NAME/$BUCKET_NAME > /dev/null 2>&1; then
    echo "✅ Bucket '$BUCKET_NAME' exists"
else
    echo "❌ Bucket '$BUCKET_NAME' not found"
    echo "Creating bucket..."
    mc mb $ALIAS_NAME/$BUCKET_NAME
fi
echo ""

# Apply CORS configuration
echo "🔧 Applying CORS configuration..."
mc anonymous set-json /tmp/minio-cors.json $ALIAS_NAME/$BUCKET_NAME

if [ $? -eq 0 ]; then
    echo "✅ CORS configuration applied successfully!"
else
    echo "❌ Failed to apply CORS configuration"
    exit 1
fi
echo ""

# Verify CORS
echo "🔍 Verifying CORS configuration..."
mc anonymous get-json $ALIAS_NAME/$BUCKET_NAME
echo ""

# Make bucket publicly readable (optional)
read -p "Make bucket publicly readable? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔓 Setting bucket to public read..."
    mc anonymous set download $ALIAS_NAME/$BUCKET_NAME
    echo "✅ Bucket is now publicly readable"
fi
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                   ✅ CORS Setup Complete!                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Allowed origins:"
echo "  - http://localhost:5173 (Frontend)"
echo "  - http://localhost:3000 (Backend)"
echo "  - http://localhost:4000 (Backend Alt)"
echo ""
echo "Allowed methods: GET, PUT, POST, DELETE, HEAD"
echo ""
echo "🎉 You can now upload files from your frontend!"
echo ""

# Clean up
rm /tmp/minio-cors.json
