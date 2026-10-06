# 🎯 BaseController Implementation Guide

## 📋 Overview

BaseController cung cấp các phương thức cơ bản và tiên tiến để xử lý HTTP requests/responses một cách nhất quán trong toàn bộ ứng dụng. Tất cả controllers nên extend từ BaseController để sử dụng các tiện ích này.

## 🚀 Features

### ✅ **Core Response Methods**

- Standardized JSON response format
- Error handling with consistent structure
- HTTP status code management

### ✅ **Enhanced Response Methods**

- Pagination support with metadata
- Specialized response methods for different HTTP status codes
- Type-safe response handling

### ✅ **Validation Methods**

- Zod schema validation integration
- Request body/params/query validation
- Formatted error responses

### ✅ **Utility Methods**

- Pagination parameter extraction
- User authentication helpers
- File upload validation
- Data sanitization
- Cookie management

### ✅ **Error Handling**

- Enhanced async handler with error categorization
- Development mode error logging
- Custom error types support

## 📚 **AVAILABLE METHODS**

### **Core Response Methods**

#### `sendResponse(res, data?, message?, statusCode?)`

Gửi response thành công với format chuẩn

```typescript
protected sendResponse(res: Response, data: any = null, message: string = "Success", statusCode: number = 200): void
```

#### `sendError(res, message?, statusCode?, errors?)`

Gửi error response với format chuẩn

```typescript
protected sendError(res: Response, message: string = "Error", statusCode: number = 500, errors: any = null): void
```

### **Enhanced Response Methods**

#### `sendPaginatedResponse(res, data, total, page?, limit?, message?)`

Gửi response với pagination metadata

```typescript
protected sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10,
  message: string = "Data retrieved successfully"
): void
```

#### `sendCreatedResponse(res, data?, message?)`

Gửi 201 Created response

```typescript
protected sendCreatedResponse(res: Response, data: any = null, message: string = "Resource created successfully"): void
```

#### `sendNoContentResponse(res)`

Gửi 204 No Content response

```typescript
protected sendNoContentResponse(res: Response): void
```

#### `sendNotFoundResponse(res, message?)`

Gửi 404 Not Found response

```typescript
protected sendNotFoundResponse(res: Response, message: string = "Resource not found"): void
```

#### `sendValidationErrorResponse(res, errors, message?)`

Gửi 400 Validation Error response

```typescript
protected sendValidationErrorResponse(res: Response, errors: any, message: string = "Validation failed"): void
```

#### `sendUnauthorizedResponse(res, message?)`

Gửi 401 Unauthorized response

```typescript
protected sendUnauthorizedResponse(res: Response, message: string = "Unauthorized access"): void
```

#### `sendForbiddenResponse(res, message?)`

Gửi 403 Forbidden response

```typescript
protected sendForbiddenResponse(res: Response, message: string = "Access forbidden"): void
```

#### `sendConflictResponse(res, message?)`

Gửi 409 Conflict response

```typescript
protected sendConflictResponse(res: Response, message: string = "Resource conflict"): void
```

### **Validation Methods**

#### `validateRequest(schema, data)`

Validate dữ liệu với Zod schema

```typescript
protected validateRequest<T>(schema: ZodSchema<T>, data: any): T
```

#### `validateBody(req, schema)`

Validate request body

```typescript
protected validateBody<T>(req: Request, schema: ZodSchema<T>): T
```

#### `validateParams(req, schema)`

Validate request parameters

```typescript
protected validateParams<T>(req: Request, schema: ZodSchema<T>): T
```

#### `validateQuery(req, schema)`

Validate query parameters

```typescript
protected validateQuery<T>(req: Request, schema: ZodSchema<T>): T
```

### **Utility Methods**

#### `getPaginationParams(req)`

Extract pagination từ request

```typescript
protected getPaginationParams(req: Request): { page: number; limit: number; skip: number }
```

#### `getUserId(req)`

Lấy user ID từ authenticated request

```typescript
protected getUserId(req: Request): string
```

#### `getIdParam(req, paramName?)`

Lấy và validate ID parameter

```typescript
protected getIdParam(req: Request, paramName: string = 'id'): string
```

#### `sanitizeUser(user)`

Loại bỏ sensitive fields từ user object

```typescript
protected sanitizeUser(user: any): any
```

#### `sanitizeUsers(users)`

Loại bỏ sensitive fields từ array of users

```typescript
protected sanitizeUsers(users: any[]): any[]
```

#### `setSecureCookies(res, tokens)`

Set secure HTTP-only cookies cho authentication

```typescript
protected setSecureCookies(res: Response, tokens: { accessToken: string; refreshToken: string }): void
```

#### `clearAuthCookies(res)`

Clear authentication cookies

```typescript
protected clearAuthCookies(res: Response): void
```

#### `validateFileUpload(file, allowedTypes?, maxSize?)`

Validate file upload

```typescript
protected validateFileUpload(file: any, allowedTypes: string[] = [], maxSize: number = 5 * 1024 * 1024): void
```

#### `logRequest(req, message?)`

Log request cho debugging (development mode)

```typescript
protected logRequest(req: Request, message: string = "Request received"): void
```

### **Error Handling**

#### `asyncHandler(fn)`

Enhanced async handler với error categorization

```typescript
protected asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => { ... }
}
```

## 💡 **USAGE EXAMPLES**

### **Basic Controller Implementation**

```typescript
import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { BaseController } from "@/shared/base/BaseController";
import { UserService } from "./user.service";
import { CreateUserSchema, UserParamsSchema } from "./user.validator";

@injectable()
export class UserController extends BaseController {
  constructor(@inject("UserService") private userService: UserService) {
    super();
  }

  // Create user với validation
  createUser = this.asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const userData = this.validateBody(req, CreateUserSchema);

    // Log request in development
    this.logRequest(req, "Creating new user");

    // Create user
    const user = await this.userService.createUser(userData);

    // Sanitize and send response
    const sanitizedUser = this.sanitizeUser(user);
    this.sendCreatedResponse(res, sanitizedUser, "User created successfully");
  });

  // Get users with pagination
  getUsers = this.asyncHandler(async (req: Request, res: Response) => {
    // Extract pagination params
    const { page, limit } = this.getPaginationParams(req);

    // Get users
    const { users, total } = await this.userService.getUsers(page, limit);

    // Sanitize users
    const sanitizedUsers = this.sanitizeUsers(users);

    // Send paginated response
    this.sendPaginatedResponse(res, sanitizedUsers, total, page, limit);
  });

  // Get user by ID
  getUserById = this.asyncHandler(async (req: Request, res: Response) => {
    // Validate and extract ID
    const userId = this.getIdParam(req);

    // Get user
    const user = await this.userService.getUserById(userId);

    if (!user) {
      return this.sendNotFoundResponse(res, "User not found");
    }

    // Sanitize and send response
    const sanitizedUser = this.sanitizeUser(user);
    this.sendResponse(res, sanitizedUser, "User retrieved successfully");
  });

  // Update user (authenticated)
  updateUser = this.asyncHandler(async (req: Request, res: Response) => {
    // Get authenticated user ID
    const currentUserId = this.getUserId(req);
    const targetUserId = this.getIdParam(req);

    // Check if user can update this resource
    if (currentUserId !== targetUserId) {
      return this.sendForbiddenResponse(res, "Cannot update other user's data");
    }

    // Validate update data
    const updateData = this.validateBody(req, UpdateUserSchema);

    // Update user
    const updatedUser = await this.userService.updateUser(targetUserId, updateData);

    // Send response
    const sanitizedUser = this.sanitizeUser(updatedUser);
    this.sendResponse(res, sanitizedUser, "User updated successfully");
  });
}
```

### **File Upload Example**

```typescript
uploadAvatar = this.asyncHandler(async (req: Request, res: Response) => {
  // Validate file upload
  this.validateFileUpload(
    req.file,
    ["image/jpeg", "image/png", "image/gif"], // Allowed types
    2 * 1024 * 1024 // 2MB max size
  );

  const userId = this.getUserId(req);

  // Process file upload
  const avatarUrl = await this.userService.uploadAvatar(userId, req.file);

  this.sendResponse(res, { avatarUrl }, "Avatar uploaded successfully");
});
```

### **Authentication Example**

```typescript
login = this.asyncHandler(async (req: Request, res: Response) => {
  // Validate login data
  const loginData = this.validateBody(req, LoginSchema);

  // Authenticate user
  const { user, tokens } = await this.authService.login(loginData);

  // Set secure cookies
  this.setSecureCookies(res, tokens);

  // Send response
  const sanitizedUser = this.sanitizeUser(user);
  this.sendResponse(res, sanitizedUser, "Login successful");
});

logout = this.asyncHandler(async (req: Request, res: Response) => {
  // Clear cookies
  this.clearAuthCookies(res);

  // Send response
  this.sendResponse(res, null, "Logout successful");
});
```

### **Error Handling Example**

```typescript
deleteUser = this.asyncHandler(async (req: Request, res: Response) => {
  const userId = this.getIdParam(req);

  try {
    await this.userService.deleteUser(userId);
    this.sendNoContentResponse(res);
  } catch (error) {
    if (error.name === "UserHasActiveOrdersError") {
      return this.sendConflictResponse(res, "Cannot delete user with active orders");
    }
    throw error; // Re-throw for default error handling
  }
});
```

## 🎯 **Response Format**

### **Success Response**

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2024-06-12T00:00:00.000Z"
}
```

### **Error Response**

```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... },
  "timestamp": "2024-06-12T00:00:00.000Z"
}
```

### **Paginated Response**

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "data": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "totalPages": 10,
      "limit": 10,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-06-12T00:00:00.000Z"
}
```

## 🔧 **Best Practices**

### **1. Always Use asyncHandler**

```typescript
// ✅ Good
myMethod = this.asyncHandler(async (req, res) => {
  // Your logic here
});

// ❌ Bad
myMethod = async (req, res, next) => {
  try {
    // Your logic here
  } catch (error) {
    next(error);
  }
};
```

### **2. Validate All Inputs**

```typescript
// ✅ Good
const userData = this.validateBody(req, CreateUserSchema);
const userId = this.getIdParam(req);

// ❌ Bad
const userData = req.body;
const userId = req.params.id;
```

### **3. Always Sanitize Sensitive Data**

```typescript
// ✅ Good
const sanitizedUser = this.sanitizeUser(user);
this.sendResponse(res, sanitizedUser);

// ❌ Bad
this.sendResponse(res, user); // May include password, refreshToken
```

### **4. Use Appropriate Response Methods**

```typescript
// ✅ Good
this.sendCreatedResponse(res, user);
this.sendNotFoundResponse(res, "User not found");
this.sendPaginatedResponse(res, users, total, page, limit);

// ❌ Bad
res.status(201).json({ user });
res.status(404).json({ error: "Not found" });
```

### **5. Log Requests in Development**

```typescript
// ✅ Good
this.logRequest(req, "Processing user creation");
```

## 🚀 **Integration with Existing Code**

BaseController được thiết kế để tương thích với existing codebase:

1. **Backward Compatible**: Không breaking changes với existing controllers
2. **Optional Usage**: Có thể adopt từng phần một cách dần dần
3. **Standard Response Format**: Consistent với existing response utilities
4. **Error Handling**: Tích hợp với existing error middleware

## 🎉 **Ready to Use!**

BaseController đã sẵn sàng sử dụng với đầy đủ features cho production. Bạn có thể:

1. **Extend BaseController** trong existing controllers
2. **Migrate từng method** một cách từ từ
3. **Sử dụng ngay các utility methods** cho validation, pagination, etc.
4. **Tận dụng standardized response format** cho consistency
