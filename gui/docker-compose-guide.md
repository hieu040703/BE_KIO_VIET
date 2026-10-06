# Hướng dẫn các lệnh Docker Compose thông dụng

Tài liệu này cung cấp hướng dẫn về các lệnh Docker Compose cơ bản và thường dùng để quản lý các ứng dụng đa container.

## 1. Khởi động và Dừng dịch vụ

### `docker-compose up`

Lệnh này được sử dụng để xây dựng (build) và chạy tất cả các dịch vụ được định nghĩa trong file `docker-compose.yml`.

- **`docker-compose up`**: Khởi động tất cả các dịch vụ ở chế độ foreground (hiển thị log trực tiếp).
- **`docker-compose up -d`**: Khởi động tất cả các dịch vụ ở chế độ detached (chạy nền). Đây là chế độ phổ biến nhất khi chạy ứng dụng production.

### `docker-compose down`

Lệnh này dừng và xóa tất cả các container, mạng (network) và volume được tạo bởi `docker-compose up`.

- **`docker-compose down`**: Dừng và xóa các container và mạng.
- **`docker-compose down -v`**: Dừng và xóa các container, mạng, **và** các volume được định nghĩa trong file. Sử dụng khi muốn dọn dẹp hoàn toàn.

## 2. Quản lý dịch vụ

### `docker-compose ps`

Hiển thị trạng thái của tất cả các container đang chạy trong dự án.

### `docker-compose logs`

Xem log của tất cả các dịch vụ.

- **`docker-compose logs -f`**: Theo dõi log theo thời gian thực (follow).
- **`docker-compose logs --tail=N`**: Chỉ hiển thị N dòng log cuối cùng.

### `docker-compose stop`

Dừng các container mà không xóa chúng. Bạn có thể khởi động lại chúng sau bằng `docker-compose start`.

## 3. Xây dựng và Tái tạo

### `docker-compose build`

Xây dựng lại các image của các dịch vụ. Lệnh này cần được chạy trước khi `docker-compose up` nếu bạn thay đổi Dockerfile.

### `docker-compose pull`

Tải xuống các image mới nhất từ các registry (ví dụ: Docker Hub) mà không cần chạy container.

## 4. Các lệnh nâng cao

### `docker-compose exec`

Thực thi một lệnh bên trong một container đang chạy. Rất hữu ích để debug hoặc kiểm tra trạng thái bên trong container.

- **Ví dụ**: `docker-compose exec web bash` (Để vào shell của service `web`).

### `docker-compose restart`

Khởi động lại tất cả các dịch vụ.

## 5. Quy tắc viết file `docker-compose.yml`

Để đảm bảo tính nhất quán và dễ bảo trì, hãy tuân thủ các quy tắc sau khi cấu hình file `docker-compose.yml`:

1.  **Sử dụng cấu trúc dịch vụ (services):** Định nghĩa mọi thành phần của ứng dụng (ví dụ: `web`, `db`, `redis`) dưới khóa `services`.
2.  **Định nghĩa mạng (networks):** Luôn định nghĩa một hoặc nhiều mạng (`networks`) để các dịch vụ có thể giao tiếp với nhau một cách an toàn và có tổ chức.
3.  **Sử dụng volumes:** Sử dụng `volumes` để quản lý dữ liệu bền vững (persistent data) như cơ sở dữ liệu, thay vì lưu trữ dữ liệu trong container.
4.  **Cấu hình biến môi trường (environment):** Sử dụng khóa `environment` để truyền các biến cấu hình (ví dụ: `DATABASE_URL`, `PORT`) vào container, thay vì hardcode chúng trong file.
5.  **Sử dụng `depends_on`:** Chỉ định sự phụ thuộc giữa các dịch vụ (ví dụ: service `web` phải chờ service `db` khởi động xong) bằng khóa `depends_on`.
6.  **Sử dụng `restart` policy:** Thiết lập chính sách khởi động lại (`restart: always` hoặc `restart: unless-stopped`) để đảm bảo ứng dụng tự động phục hồi sau sự cố.

## 6. Hướng dẫn tạo Dockerfile

`Dockerfile` là một file văn bản chứa một tập hợp các chỉ thị để tự động hóa quá trình xây dựng (build) một Docker image.

### Các chỉ thị (Instructions) phổ biến

| Chỉ thị      | Mô tả                                                                                             |
| :----------- | :------------------------------------------------------------------------------------------------ |
| `FROM`       | Chỉ định base image (ví dụ: `node:18`, `python:3.9`, `ubuntu:latest`). Đây luôn là dòng đầu tiên. |
| `WORKDIR`    | Thiết lập thư mục làm việc bên trong container. Các lệnh sau đó sẽ chạy trong thư mục này.        |
| `COPY`       | Copy file hoặc thư mục từ máy host vào trong container.                                           |
| `ADD`        | Tương tự `COPY` nhưng có thêm khả năng giải nén file tự động và tải từ URL.                       |
| `RUN`        | Thực thi các lệnh trong quá trình build image (ví dụ: cài đặt thư viện, tạo thư mục).             |
| `ENV`        | Thiết lập các biến môi trường bên trong container.                                                |
| `EXPOSE`     | Thông báo cho Docker rằng container sẽ lắng nghe trên các cổng mạng cụ thể khi chạy.              |
| `CMD`        | Thiết lập lệnh mặc định sẽ chạy khi container được khởi động.                                     |
| `ENTRYPOINT` | Tương tự `CMD` nhưng khó bị ghi đè hơn, thường dùng để biến container thành một executable.       |

### Ví dụ về một Dockerfile cho ứng dụng Node.js

Dưới đây là một ví dụ cơ bản cho một ứng dụng Node.js:

```dockerfile
# 1. Sử dụng base image chính thức từ Docker Hub
FROM node:18-alpine

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package.json và package-lock.json trước để tận dụng Docker cache
COPY package*.json ./

# 4. Chạy lệnh cài đặt dependencies
RUN npm install

# 5. Copy toàn bộ mã nguồn còn lại vào container
COPY . .

# 6. Thông báo cổng mà ứng dụng sẽ chạy
EXPOSE 3000

# 7. Lệnh để khởi chạy ứng dụng
CMD ["npm", "start"]
```

---

## 7. Docker Networking (Mạng)

Hiểu về mạng trong Docker là rất quan trọng để các container có thể giao tiếp với nhau.

### Các loại Network

1.  **Bridge Network** (Mặc định): Mỗi project có một bridge network riêng, các container trong cùng network có thể giao tiếp bằng hostname.
2.  **Host Network**: Container sử dụng network của host machine (`network_mode: "host"`).
3.  **Overlay Network**: Dùng cho Docker Swarm để kết nối containers trên nhiều hosts.

### Cấu hình Network trong docker-compose.yml

```yaml
version: "3.8"

services:
  web:
    image: nginx
    networks:
      - frontend
      - backend

  api:
    image: node:18
    ports:
      - "3000:3000"
    networks:
      - backend
    depends_on:
      - db

  db:
    image: postgres:15
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

### Giao tiếp giữa các container

- Containers trong cùng network có thể giao tiếp bằng **hostname** (tên service trong docker-compose.yml).
- Ví dụ: Container `web` gọi đến container `db` bằng hostname `db`.

---

## 8. Volumes & Data Persistence (Lưu trữ dữ liệu bền vững)

Dữ liệu trong container sẽ bị mất khi container bị xóa. Để lưu trữ dữ liệu bền vững, bạn cần sử dụng **Volumes**.

### Các loại Volume

1.  **Named Volumes**: Docker quản lý vị trí lưu trữ.
2.  **Bind Mounts**: Map thư mục cụ thể từ host vào container (ví dụ: `/Users/you/project/data:/app/data`).
3.  **Anonymous Volumes**: Docker tự động tạo tên cho volume.

### Cấu hình Volume trong docker-compose.yml

```yaml
version: "3.8"

services:
  web:
    image: nginx
    volumes:
      - ./html:/usr/share/nginx/html # Bind mount
      - static_files:/var/www/static # Named volume

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data # Named volume cho database

volumes:
  postgres_data:
  static_files:
```

### So sánh Bind Mount vs Named Volume

| Đặc điểm             | Bind Mount                          | Named Volume               |
| :------------------- | :---------------------------------- | :------------------------- |
| **Kiểm soát vị trí** | Có (thư mục cụ thể trên host)       | Không (Docker tự quản lý)  |
| **Cross-platform**   | Khó (path khác nhau giữa OS)        | Dễ dàng                    |
| **Backup**           | Cần backup thư mục host             | Docker quản lý dễ dàng hơn |
| **Performance**      | Tốt cho file nhỏ, chậm với file lớn | Tối ưu cho file lớn        |

---

## 9. Health Checks (Kiểm tra sức khỏe)

Health checks giúp Docker tự động restart container nếu service gặp lỗi.

### Cấu hình Health Check trong docker-compose.yml

```yaml
version: "3.8"

services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s # Kiểm tra mỗi 30 giây
      timeout: 10s # Thời gian chờ phản hồi tối đa
      retries: 3 # Số lần thử trước khi coi là failed
      start_period: 40s # Thời gian miễn phí khi container vừa khởi động

  api:
    image: node:18
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 10s
```

### Kiểm tra health status

```bash
# Xem health status của tất cả services
docker-compose ps

# Xem log health check
docker-compose logs --tail=20
```

---

## 10. Docker Compose Profiles (Quản lý môi trường)

Profiles giúp bạn quản lý các cấu hình khác nhau cho các môi trường: development, staging, production.

### Cấu hình Profile trong docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    image: nginx
    profiles:
      - dev
      - prod

  debug-tool:
    image: node:18
    profiles:
      - dev

  production-db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    profiles:
      - prod

# Chạy chỉ với services có trong profile 'dev'
docker-compose --profile dev up -d

# Chạy cả services của dev và prod
docker-compose --profile dev --profile prod up -d
```

---

## 11. Multi-stage Builds (Xây dựng nhiều giai đoạn)

Multi-stage builds giúp giảm kích thước image production bằng cách chỉ copy những gì cần thiết từ build stage sang production stage.

### Ví dụ Dockerfile multi-stage cho Node.js

```dockerfile
# Stage 1: Build environment
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application (ví dụ: TypeScript)
RUN npm run build

# Stage 2: Production environment
FROM node:18-alpine AS production

WORKDIR /app

# Chỉ copy những gì cần thiết từ builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Set environment variable
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "dist/index.js"]
```

### Lợi ích của Multi-stage builds:

- **Giảm kích thước image**: Image production chỉ chứa runtime, không có build tools.
- **Bảo mật**: Không cần expose các công cụ build trong production.
- **Tối ưu performance**: Image nhỏ hơn khởi động nhanh hơn.

---

## 12. Troubleshooting (Xử lý lỗi thường gặp)

### 1. Container không thể kết nối với nhau

**Vấn đề**: Service A không thể connect đến Service B.

**Giải pháp**:

```bash
# Kiểm tra network configuration
docker-compose config

# Xem logs để debug
docker-compose logs -f service-name

# Test connectivity từ bên trong container
docker-compose exec service-name ping service-b
```

### 2. Port conflict (Xung đột cổng)

**Vấn đề**: Docker báo lỗi "Port already in use".

**Giải pháp**:

```bash
# Tìm port đang được sử dụng
lsof -i :3000

# Hoặc trên macOS/Linux
sudo lsof -i :PORT_NUMBER

# Thay đổi port trong docker-compose.yml
ports:
  - "3001:3000"  # Host port: Container port
```

### 3. Volume permissions issue

**Vấn đề**: Không thể write vào volume do permission denied.

**Giải pháp**:

```yaml
# Thêm user mapping trong docker-compose.yml
services:
  web:
    user: "1000:1000" # Match UID/GID của thư mục trên host
```

### 4. Environment variables not working

**Vấn đề**: Biến môi trường không được load đúng.

**Giải pháp**:

```bash
# Kiểm tra biến môi trường trong container
docker-compose exec service-name env | grep VAR_NAME

# Sử dụng .env file (Docker Compose tự động load)
# Tạo file .env với:
# DB_PASSWORD=your_password
```

### 5. Container restart loop

**Vấn đề**: Container liên tục restart do lỗi.

**Giải pháp**:

```bash
# Xem logs để tìm nguyên nhân
docker-compose logs --tail=100 service-name

# Tắt auto-restart để debug
services:
  service-name:
    restart: "no"
```

---

## 13. Best Practices for Production (Thực tế sản xuất)

### 1. Sử dụng .env file cho secrets

**❌ KHÔNG NÊN:**

```yaml
# docker-compose.yml - NGUY HIỂM!
services:
  db:
    environment:
      - POSTGRES_PASSWORD=secret123
```

**✅ NÊN:**

```bash
# Tạo file .env (không commit vào git)
POSTGRES_PASSWORD=secret123
DB_HOST=localhost
```

```yaml
# docker-compose.yml - AN TOÀN
services:
  db:
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

### 2. Sử dụng Health Checks bắt buộc

Tất cả services quan trọng phải có health check để Docker tự động restart khi cần.

### 3. Resource Limits (Giới hạn tài nguyên)

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
        reservations:
          cpus: "0.5"
          memory: 512M
```

### 4. Logging Configuration (Cấu hình logging)

```yaml
services:
  web:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 5. Sử dụng Docker Secrets (cho Docker Swarm)

```yaml
services:
  db:
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 6. Backup Strategy (Chiến lược backup)

```bash
# Backup volumes định kỳ
docker run --rm \
  -v $(pwd):/backup \
  -v myapp_postgres_data:/data \
  alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz -C /data .
```

### 7. Monitoring & Alerting

Sử dụng các công cụ như:

- **Prometheus + Grafana**: Monitoring metrics
- **ELK Stack**: Centralized logging
- **PagerDuty/OpsGenie**: Alerting system

---

## 14. Quick Reference (Tham khảo nhanh)

### Lệnh Docker cơ bản

```bash
# Xem tất cả containers
docker ps -a

# Xem logs của container
docker logs -f container-name

# Stop container
docker stop container-name

# Start container
docker start container-name

# Xóa container
docker rm container-name

# Xóa image
docker rmi image-name
```

### Lệnh Docker Compose cơ bản

```bash
# Build và chạy services
docker-compose up -d

# Dừng tất cả services
docker-compose down

# Xem logs
docker-compose logs -f

# Chạy lệnh trong container đang chạy
docker-compose exec service-name command

# Stop rồi start lại
docker-compose restart service-name

# Clean volumes (Xóa dữ liệu!)
docker-compose down -v
```

### Debug commands

```bash
# Xem cấu hình docker-compose đã parse
docker-compose config

# Xem network topology
docker network ls
docker network inspect <network-name>

# Xem volume usage
docker volume ls
docker volume inspect <volume-name>
```
