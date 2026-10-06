# Transaction Usage Guide

## Giới thiệu

BaseRepository đã được cập nhật để hỗ trợ transaction một cách toàn diện. Bạn có thể sử dụng transaction ở nhiều cấp độ khác nhau.

## Các cách sử dụng Transaction

### 1. Transaction cơ bản trong Repository

```typescript
// Tạo một record với transaction
const user = await userRepository.createWithTransaction({
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
});

// Cập nhật với transaction
const updatedUser = await userRepository.updateWithTransaction(userId, {
  firstName: "Updated Name",
});

// Xóa với transaction
const deleted = await userRepository.deleteWithTransaction(userId);
```

### 2. Batch operations với Transaction

```typescript
// Tạo nhiều records cùng lúc
const users = await userRepository.createManyWithTransaction([
  { email: "user1@example.com", firstName: "User", lastName: "One" },
  { email: "user2@example.com", firstName: "User", lastName: "Two" },
]);

// Cập nhật nhiều records
const updatedUsers = await userRepository.updateManyWithTransaction([userId1, userId2], { isActive: false });

// Xóa nhiều records
const deletedCount = await userRepository.deleteManyWithTransaction([userId1, userId2]);
```

### 3. Transaction tùy chỉnh với withTransaction

```typescript
// Transaction phức tạp
const result = await userRepository.withTransaction(async (manager) => {
  // Tạo user
  const user = await userRepository.create(
    {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    },
    manager,
  );

  // Tạo profile cho user
  const profile = await profileRepository.create(
    {
      userId: user.id,
      bio: "User bio",
    },
    manager,
  );

  // Gửi email welcome (nếu cần)
  // await emailService.sendWelcomeEmail(user.email);

  return { user, profile };
});
```

### 4. Transaction trong Service Layer

```typescript
// UserService
async createUserWithProfile(userData: CreateUserDto): Promise<User> {
  return await this.userRepository.withTransaction(async (manager) => {
    // Kiểm tra email đã tồn tại
    const existingUser = await this.userRepository.findByEmail(userData.email, manager);
    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(userData.password);

    // Tạo user
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    }, manager);

    // Tạo profile mặc định
    await this.profileRepository.create({
      userId: user.id,
      displayName: `${user.firstName} ${user.lastName}`
    }, manager);

    return user;
  });
}
```

### 5. Transaction với nhiều Repository

```typescript
// Trong Service
async transferUserData(fromUserId: string, toUserId: string): Promise<void> {
  return await this.userRepository.withTransaction(async (manager) => {
    // Lấy thông tin users
    const fromUser = await this.userRepository.findById(fromUserId, manager);
    const toUser = await this.userRepository.findById(toUserId, manager);

    if (!fromUser || !toUser) {
      throw new NotFoundError("User not found");
    }

    // Chuyển comments
    await this.commentRepository.transferCommentsToUser(fromUserId, toUserId, manager);

    // Chuyển posts (nếu có)
    // await this.postRepository.transferPostsToUser(fromUserId, toUserId, manager);

    // Deactivate user cũ
    await this.userRepository.update(fromUserId, { isActive: false }, manager);

    // Log activity
    await this.activityLogRepository.create({
      action: "USER_DATA_TRANSFER",
      fromUserId,
      toUserId,
      timestamp: new Date()
    }, manager);
  });
}
```

### 6. Transaction với Error Handling

```typescript
async complexOperation(): Promise<Result> {
  try {
    return await this.repository.withTransaction(async (manager) => {
      // Operation 1
      const step1 = await this.performStep1(manager);

      // Operation 2 - depends on step1
      const step2 = await this.performStep2(step1.id, manager);

      // Operation 3 - can fail
      if (step2.shouldFail) {
        throw new Error("Business logic error");
      }

      // Final operation
      return await this.performStep3(step1, step2, manager);
    });
  } catch (error) {
    // Transaction đã được rollback tự động
    console.error("Operation failed:", error.message);
    throw error;
  }
}
```

## Best Practices

### 1. Luôn sử dụng Transaction cho operations phức tạp

```typescript
// ❌ Không tốt - có thể để lại data inconsistent
async createUserAndProfile(userData: CreateUserDto): Promise<User> {
  const user = await this.userRepository.create(userData);
  const profile = await this.profileRepository.create({ userId: user.id });
  return user;
}

// ✅ Tốt - đảm bảo consistency
async createUserAndProfile(userData: CreateUserDto): Promise<User> {
  return await this.userRepository.withTransaction(async (manager) => {
    const user = await this.userRepository.create(userData, manager);
    await this.profileRepository.create({ userId: user.id }, manager);
    return user;
  });
}
```

### 2. Tránh nested transactions

```typescript
// ❌ Tránh nested transactions
async badExample(): Promise<void> {
  await this.userRepository.withTransaction(async (manager1) => {
    const user = await this.userRepository.create(userData, manager1);

    // Nested transaction - không tốt
    await this.commentRepository.withTransaction(async (manager2) => {
      await this.commentRepository.create(commentData, manager2);
    });
  });
}

// ✅ Sử dụng cùng một transaction
async goodExample(): Promise<void> {
  await this.userRepository.withTransaction(async (manager) => {
    const user = await this.userRepository.create(userData, manager);
    await this.commentRepository.create(commentData, manager);
  });
}
```

### 3. Truyền EntityManager qua các layer

```typescript
// Repository method
async createCommentWithNotification(
  commentData: Partial<Comment>,
  manager?: EntityManager
): Promise<Comment> {
  const repository = this.getRepository(manager);
  const comment = await repository.save(commentData);

  // Nếu có manager, sử dụng nó cho các operations khác
  if (manager) {
    await this.notificationRepository.create({
      type: "NEW_COMMENT",
      commentId: comment.id
    }, manager);
  }

  return comment;
}
```

### 4. Timeout cho Long-running Transactions

```typescript
async longRunningOperation(): Promise<void> {
  const timeout = setTimeout(() => {
    throw new Error("Transaction timeout");
  }, 30000); // 30 seconds

  try {
    await this.repository.withTransaction(async (manager) => {
      // Long running operations
      await this.heavyOperation1(manager);
      await this.heavyOperation2(manager);
      await this.heavyOperation3(manager);
    });
  } finally {
    clearTimeout(timeout);
  }
}
```

## Các phương thức có sẵn trong BaseRepository

### Basic Operations

- `findById(id, manager?)`
- `findAll(manager?)`
- `create(data, manager?)`
- `update(id, data, manager?)`
- `delete(id, manager?)`
- `findOne(options, manager?)`
- `exists(options, manager?)`

### Transaction Wrappers

- `createWithTransaction(data)`
- `updateWithTransaction(id, data)`
- `deleteWithTransaction(id)`

### Batch Operations

- `createMany(data[], manager?)`
- `createManyWithTransaction(data[])`
- `updateMany(ids[], data, manager?)`
- `updateManyWithTransaction(ids[], data)`
- `deleteMany(ids[], manager?)`
- `deleteManyWithTransaction(ids[])`

### Soft Delete (nếu entity hỗ trợ)

- `softDelete(id, manager?)`
- `softDeleteWithTransaction(id)`
- `restore(id, manager?)`
- `restoreWithTransaction(id)`

### Utility Methods

- `findWithPagination(page?, limit?, where?, manager?)`
- `count(where?, manager?)`
- `withTransaction<R>(operation)`
- `query(sql, params?, manager?)`

## Ví dụ thực tế

### E-commerce Order Processing

```typescript
async processOrder(orderData: CreateOrderDto): Promise<Order> {
  return await this.orderRepository.withTransaction(async (manager) => {
    // 1. Tạo order
    const order = await this.orderRepository.create(orderData, manager);

    // 2. Trừ inventory
    for (const item of orderData.items) {
      await this.inventoryRepository.decreaseStock(item.productId, item.quantity, manager);
    }

    // 3. Tạo payment record
    const payment = await this.paymentRepository.create({
      orderId: order.id,
      amount: order.total,
      status: "PENDING"
    }, manager);

    // 4. Gửi email confirmation
    await this.emailService.sendOrderConfirmation(order.customerEmail);

    return order;
  });
}
```

### User Account Deletion

```typescript
async deleteUserAccount(userId: string): Promise<void> {
  await this.userRepository.withTransaction(async (manager) => {
    // 1. Soft delete user
    await this.userRepository.softDelete(userId, manager);

    // 2. Deactivate user's content
    await this.commentRepository.deactivateByUserId(userId, manager);
    await this.postRepository.deactivateByUserId(userId, manager);

    // 3. Transfer ownership if needed
    await this.subscriptionRepository.cancelByUserId(userId, manager);

    // 4. Log deletion
    await this.auditLogRepository.create({
      action: "USER_DELETED",
      userId,
      timestamp: new Date()
    }, manager);
  });
}
```

## Best Practices

### 1. Tránh Nested Transactions

```typescript
// ❌ KHÔNG làm như này
await userRepository.withTransaction(async (manager1) => {
  const user = await userRepository.create(userData, manager1);

  // Đây sẽ tạo nested transaction - có thể gây deadlock
  const comment = await commentRepository.createCommentWithNotification({
    content: "Comment",
    userId: user.id,
  });
});

// ✅ Làm như này thay thế
await userRepository.withTransaction(async (manager) => {
  const user = await userRepository.create(userData, manager);
  const comment = await commentRepository.create(
    {
      content: "Comment",
      userId: user.id,
    },
    manager,
  );
});
```

### 2. Xử lý Error Properly

```typescript
try {
  const result = await userRepository.withTransaction(async (manager) => {
    // Transaction operations
    return await performComplexOperation(manager);
  });

  // Success handling
  console.log("Transaction completed successfully");
} catch (error) {
  // Error handling - transaction đã được rollback tự động
  if (error instanceof ConflictError) {
    // Handle specific error types
  }

  // Log error for debugging
  console.error("Transaction failed:", error);
  throw error; // Re-throw nếu cần
}
```

### 3. Timeout Management

```typescript
// Set timeout cho long-running transactions
const result = await Promise.race([
  userRepository.withTransaction(async (manager) => {
    // Long operation
  }),
  new Promise((_, reject) => setTimeout(() => reject(new Error("Transaction timeout")), 30000)),
]);
```

### 4. Monitoring Transaction Performance

```typescript
async performTransactionWithLogging(operation: string, fn: Function) {
  const startTime = Date.now();

  try {
    const result = await this.withTransaction(fn);
    const duration = Date.now() - startTime;

    console.log(`Transaction "${operation}" completed in ${duration}ms`);
    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Transaction "${operation}" failed after ${duration}ms:`, error);
    throw error;
  }
}
```

## Troubleshooting

### Lỗi thường gặp và cách xử lý

#### 1. Deadlock Detection

```typescript
try {
  await userRepository.withTransaction(async (manager) => {
    // Operations that might cause deadlock
  });
} catch (error) {
  if (error.code === "ER_LOCK_DEADLOCK") {
    // Retry with exponential backoff
    await this.retryWithBackoff(() => this.performOperation());
  }
}
```

#### 2. Connection Pool Exhaustion

```typescript
// Đảm bảo transaction được cleanup properly
async safeTransaction<T>(fn: (manager: EntityManager) => Promise<T>): Promise<T> {
  let manager: EntityManager | null = null;

  try {
    return await this.withTransaction(async (m) => {
      manager = m;
      return await fn(m);
    });
  } finally {
    // Cleanup resources nếu cần
    if (manager) {
      // Additional cleanup logic
    }
  }
}
```

#### 3. Memory Issues với Large Transactions

```typescript
// Batch process large datasets
async processBulkData(data: any[], batchSize: number = 1000) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    await this.withTransaction(async (manager) => {
      await this.processBatch(batch, manager);
    });

    // Allow garbage collection between batches
    if (i % (batchSize * 10) === 0) {
      await new Promise(resolve => setImmediate(resolve));
    }
  }
}
```

## Performance Tips

### 1. Minimize Transaction Scope

```typescript
// ❌ Transaction quá dài
await userRepository.withTransaction(async (manager) => {
  const user = await userRepository.create(userData, manager);

  // External API call - không nên trong transaction
  await externalApiService.notifyUserCreated(user);

  const profile = await profileRepository.create(profileData, manager);
});

// ✅ Transaction ngắn gọn
const user = await userRepository.withTransaction(async (manager) => {
  const user = await userRepository.create(userData, manager);
  const profile = await profileRepository.create(profileData, manager);
  return user;
});

// External API call outside transaction
await externalApiService.notifyUserCreated(user);
```

### 2. Use Read Replicas for Queries

```typescript
// Trong transaction chỉ để write operations
await userRepository.withTransaction(async (manager) => {
  // Write operations only
  await userRepository.create(userData, manager);
  await profileRepository.create(profileData, manager);
});

// Read operations có thể dùng read replica
const users = await userRepository.findWithPagination(1, 10);
```

## Testing Transactions

### Unit Test Example

```typescript
describe("Transaction Tests", () => {
  it("should rollback on error", async () => {
    let errorThrown = false;

    try {
      await userRepository.withTransaction(async (manager) => {
        await userRepository.create(validData, manager);
        throw new Error("Simulated error");
      });
    } catch (error) {
      errorThrown = true;
    }

    expect(errorThrown).toBe(true);

    // Verify rollback
    const user = await userRepository.findByEmail(validData.email);
    expect(user).toBeNull();
  });
});
```

## Kết luận

Transaction support trong BaseRepository cung cấp:

1. **Data Consistency** - Đảm bảo tính nhất quán của dữ liệu
2. **Error Recovery** - Tự động rollback khi có lỗi
3. **Performance** - Batch operations hiệu quả
4. **Flexibility** - Nhiều cách sử dụng khác nhau
5. **Monitoring** - Dễ dàng theo dõi và debug

Sử dụng transaction một cách thông minh để xây dựng ứng dụng robust và reliable!
