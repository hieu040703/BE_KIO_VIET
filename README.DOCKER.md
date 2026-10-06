# Docker Deployment Guide

## Tổng quan

Dự án này có thể được triển khai sử dụng Docker và Docker Compose với các services sau:

- **Backend**: Ứng dụng Node.js 22.15.0 TypeScript chính
- **PostgreSQL 16**: Cơ sở dữ liệu
- **Redis**: Cache và session store
- **PgAdmin**: Web interface để quản lý PostgreSQL (chỉ cho development)
- **Redis Commander**: Web interface để quản lý Redis (chỉ cho development)

## Yêu cầu hệ thống

- Docker 20.10+
- Docker Compose 2.0+
- Ít nhất 2GB RAM
- Ít nhất 5GB dung lượng đĩa trống

## Phiên bản được sử dụng

- **Node.js**: 22.15.0 Alpine
- **PostgreSQL**: 16 Alpine
- **Redis**: 7 Alpine

## Cài đặt và Chạy

### 1. Chuẩn bị Environment

```bash
# Copy file environment template
cp .env.docker .env

# Chỉnh sửa file .env với các giá trị phù hợp
# LƯU Ý: Thay đổi JWT secrets trong production!
vim .env
```

### 2. Chạy các Services

```bash
# Chạy tất cả services
docker-compose up -d

# Hoặc chạy với development tools (pgAdmin, Redis Commander)
docker-compose --profile dev up -d

# Xem logs
docker-compose logs -f backend

# Chỉ xem logs của một service cụ thể
docker-compose logs -f postgres
```

### 3. Kiểm tra Health Status

```bash
# Kiểm tra status của tất cả containers
docker-compose ps

# Kiểm tra health của backend
curl http://localhost:4000/health
```

### 4. Database Migration

```bash
# Chạy migration (nếu cần)
docker-compose exec backend yarn db:migrate

# Chạy seeder (nếu có)
docker-compose exec backend yarn db:seed
```

## Ports và Endpoints

| Service               | Port | Endpoint              |
| --------------------- | ---- | --------------------- |
| Backend               | 4000 | http://localhost:4000 |
| PostgreSQL            | 5435 | localhost:5435        |
| Redis                 | 6379 | localhost:6379        |
| PgAdmin (dev)         | 5050 | http://localhost:5050 |
| Redis Commander (dev) | 8081 | http://localhost:8081 |

## Quản lý Services

### Dừng Services

```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes (MẤT DỮ LIỆU!)
docker-compose down -v
```

### Restart Services

```bash
# Restart tất cả services
docker-compose restart

# Restart một service cụ thể
docker-compose restart backend
```

### Rebuild và Update

```bash
# Rebuild backend image khi có thay đổi code
docker-compose build backend

# Rebuild và restart
docker-compose up -d --build backend
```

## Development Tools

### PgAdmin (Database Admin)

- URL: http://localhost:5050
- Email: admin@example.com
- Password: admin123

Để kết nối đến PostgreSQL:

- Host: postgres
- Port: 5432
- Database: backend_hg_construction
- Username: postgres
- Password: postgres123

### Redis Commander

- URL: http://localhost:8081
- Redis connection được cấu hình tự động

## Troubleshooting

### Kiểm tra logs khi có lỗi

```bash
# Xem logs của tất cả services
docker-compose logs

# Xem logs realtime của backend
docker-compose logs -f backend

# Xem logs của database
docker-compose logs postgres
```

### Database connection issues

```bash
# Kiểm tra PostgreSQL có running không
docker-compose ps postgres

# Kiểm tra health check
docker-compose exec postgres pg_isready -U postgres -d backend_hg_construction

# Connect trực tiếp vào database
docker-compose exec postgres psql -U postgres -d backend_hg_construction
```

### Redis connection issues

```bash
# Kiểm tra Redis có running không
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### Reset toàn bộ dữ liệu

```bash
# Dừng services và xóa tất cả volumes
docker-compose down -v

# Khởi tạo lại
docker-compose up -d
```

## Production Deployment

Khi deploy production:

1. **Thay đổi mật khẩu mặc định**:

   - Database passwords
   - Redis password
   - JWT secrets

2. **Cấu hình bảo mật**:

   - Tắt pgAdmin và Redis Commander (bỏ `--profile dev`)
   - Sử dụng external networks nếu cần
   - Cấu hình SSL/TLS

3. **Backup và Monitoring**:
   - Thiết lập backup định kỳ cho PostgreSQL
   - Monitoring health checks
   - Log aggregation

## Volumes và Data Persistence

Dữ liệu được lưu trữ trong Docker volumes:

- `postgres_data`: Dữ liệu PostgreSQL
- `redis_data`: Dữ liệu Redis
- `pgadmin_data`: Cấu hình PgAdmin
- `./uploads`: File uploads (mounted từ host)
- `./logs`: Application logs (mounted từ host)

## Environment Variables

Tham khảo file `.env.docker` để biết tất cả các biến môi trường có thể cấu hình.
