# API Testing Guide

## Quick Test

Chạy script test tự động:

```bash
./test-api.sh
```

## Manual Testing with cURL

### 1. Health Check

```bash
curl http://localhost:4500/health
```

### 2. Authentication

#### Register

```bash
curl -X POST http://localhost:4500/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Login (saves cookies)

```bash
curl -c cookies.txt -X POST http://localhost:4500/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

#### Get Current User (requires auth)

```bash
curl -b cookies.txt -X GET http://localhost:4500/api/v1/auth/me
```

#### Logout

```bash
curl -b cookies.txt -X POST http://localhost:4500/api/v1/auth/logout
```

### 3. Users

#### Get All Users (with pagination)

```bash
curl -b cookies.txt -X GET "http://localhost:4500/api/v1/users?page=1&limit=5"
```

#### Get Specific User

```bash
curl -b cookies.txt -X GET http://localhost:4500/api/v1/users/{user-id}
```

#### Update User

```bash
curl -b cookies.txt -X PUT http://localhost:4500/api/v1/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Name"
  }'
```

### 4. Comments

#### Get All Comments (with pagination)

```bash
curl -b cookies.txt -X GET "http://localhost:4500/api/v1/comments?page=1&limit=5"
```

#### Create Comment

```bash
curl -b cookies.txt -X POST http://localhost:4500/api/v1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a test comment!"
  }'
```

#### Create Reply Comment

```bash
curl -b cookies.txt -X POST http://localhost:4500/api/v1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a reply!",
    "parentId": "parent-comment-id"
  }'
```

#### Update Comment

```bash
curl -b cookies.txt -X PUT http://localhost:4500/api/v1/comments/{comment-id} \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated comment content"
  }'
```

#### Delete Comment

```bash
curl -b cookies.txt -X DELETE http://localhost:4500/api/v1/comments/{comment-id}
```

## Default Test Credentials

Sau khi chạy seed, bạn có thể sử dụng:

- **Email**: admin@example.com
- **Password**: password123

## Error Responses

### 400 - Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 - Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Troubleshooting

### 1. Server không khởi động

```bash
# Kiểm tra port đã được sử dụng chưa
lsof -ti:4500

# Kill process đang sử dụng port
kill -9 $(lsof -ti:4500)

# Khởi động lại server
yarn dev
```

### 2. Database connection lỗi

```bash
# Kiểm tra database có chạy không
docker-compose ps

# Khởi động database
docker-compose up -d

# Chạy migrations
yarn db:migrate

# Seed dữ liệu
yarn db:seed
```

### 3. Path alias không work

```bash
# Cài đặt tsconfig-paths
yarn add -D tsconfig-paths

# Cập nhật script trong package.json
"dev": "nodemon src/index.ts"
# với nodemon.json có: "exec": "ts-node -r tsconfig-paths/register src/index.ts"
```

### 4. TypeScript compile errors

```bash
# Check errors
npx tsc --noEmit

# Build để test
yarn build
```

## VS Code Extensions

Để test dễ dàng hơn, cài đặt:

- REST Client
- Thunder Client
- Postman

## Postman Collection

Import vào Postman:

```json
{
  "info": {
    "name": "Express TypeORM API"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:4500/api/v1"
    }
  ]
}
```
