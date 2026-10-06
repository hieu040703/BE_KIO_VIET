/**
 * Setup CORS policy cho MinIO bucket
 *
 * MinIO JS Client không support set CORS trực tiếp.
 * Cần sử dụng MinIO Client CLI (mc) hoặc AWS CLI
 */

console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                    SETUP MINIO CORS CONFIGURATION                         ║
╔═══════════════════════════════════════════════════════════════════════════╗

⚠️  Lỗi CORS xảy ra khi frontend upload file lên MinIO

🔧 Giải pháp: Cấu hình CORS cho MinIO bucket

📋 Cách 1: Sử dụng MinIO Client (mc) - RECOMMENDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Cài đặt MinIO Client (nếu chưa có):
   
   # macOS
   brew install minio/stable/mc
   
   # Linux
   wget https://dl.min.io/client/mc/release/linux-amd64/mc
   chmod +x mc
   sudo mv mc /usr/local/bin/

2️⃣  Tạo file CORS configuration:
   
   cat > /tmp/minio-cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "http://localhost:5173",
        "http://localhost:3000", 
        "http://localhost:4000",
        "http://127.0.0.1:5173"
      ],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "Content-Type", "Content-Length"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

3️⃣  Set alias cho MinIO server:
   
   mc alias set myminio http://file.itomosoft.com:9000 \\
     mB6cPoJiWR4cQom6dO2q \\
     iLXmbP7UjQ6pEc1FByWYLIwE3QlRB6CW97al4EUs

4️⃣  Apply CORS configuration:
   
   mc anonymous set-json /tmp/minio-cors.json myminio/uploads

5️⃣  Verify CORS:
   
   mc anonymous get-json myminio/uploads


📋 Cách 2: Sử dụng AWS CLI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Tạo file CORS configuration XML:
   
   cat > /tmp/cors.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
    <AllowedOrigin>http://localhost:5173</AllowedOrigin>
    <AllowedOrigin>http://localhost:3000</AllowedOrigin>
    <AllowedOrigin>http://localhost:4000</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <ExposeHeader>ETag</ExposeHeader>
    <ExposeHeader>Content-Type</ExposeHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
EOF

2️⃣  Apply CORS với AWS CLI:
   
   aws s3api put-bucket-cors \\
     --bucket uploads \\
     --cors-configuration file:///tmp/cors.xml \\
     --endpoint-url http://file.itomosoft.com:9000


📋 Cách 3: Thông qua MinIO Console UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Truy cập MinIO Console: http://file.itomosoft.com:9000
2️⃣  Login với credentials
3️⃣  Chọn bucket "uploads"
4️⃣  Vào tab "Configuration" → "CORS"
5️⃣  Thêm CORS rule với:
    - Allowed Origins: http://localhost:5173, http://localhost:3000
    - Allowed Methods: GET, PUT, POST, DELETE, HEAD
    - Allowed Headers: *
    - Expose Headers: ETag, Content-Type


✅ Sau khi setup CORS, refresh lại frontend và thử upload file!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Lưu ý:
   - CORS chỉ cần setup 1 lần cho mỗi bucket
   - Nếu deploy production, thêm production domain vào AllowedOrigins
   - Có thể dùng wildcard (*) nhưng không recommended vì security

╚═══════════════════════════════════════════════════════════════════════════╝
`);

async function setupMinioCORS() {
  console.log("Vui lòng chạy các lệnh trên để setup CORS cho MinIO bucket!");
  console.log("\nRecommended: Sử dụng MinIO Client (mc) - Cách 1");
}

// Run the script
setupMinioCORS()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });
