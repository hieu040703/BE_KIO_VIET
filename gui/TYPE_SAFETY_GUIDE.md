# TypeScript Types trong Repository Pattern

## Tại sao sử dụng các type khác nhau?

### 1. `DeepPartial<T>` vs `Partial<T>`

#### `Partial<T>` - Shallow Optional

```typescript
interface User {
  id: number;
  name: string;
  profile: {
    bio: string;
    avatar: string;
  };
}

type PartialUser = Partial<User>;
// Kết quả:
// {
//   id?: string;
//   name?: string;
//   profile?: {       // Chỉ optional ở level đầu
//     bio: string;    // Vẫn required
//     avatar: string; // Vẫn required
//   };
// }
```

#### `DeepPartial<T>` - Deep Optional

```typescript
type DeepPartialUser = DeepPartial<User>;
// Kết quả:
// {
//   id?: string;
//   name?: string;
//   profile?: {       // Optional
//     bio?: string;   // Optional
//     avatar?: string; // Optional
//   };
// }
```

### 2. Lựa chọn Type trong Repository

#### ❌ **Vấn đề với `Partial<Comment>`**

```typescript
// Không an toàn - có thể tạo comment không có content
async createCommentWithNotification(commentData: Partial<Comment>) {
  // commentData có thể = {} - không có content, userId
  return await this.create(commentData); // ❌ Runtime error
}
```

#### ✅ **Giải pháp với Custom Interface**

```typescript
interface CreateCommentData {
  content: string;    // Required
  userId: string;     // Required
  parentId?: string;  // Optional
  isActive?: boolean; // Optional
}

async createCommentWithNotification(commentData: CreateCommentData) {
  // Đảm bảo có đủ data bắt buộc
  return await this.create(commentData); // ✅ Type safe
}
```

#### ✅ **Backup với `DeepPartial<T>`**

```typescript
// Nếu cần flexibility nhưng vẫn consistent với BaseRepository
async createCommentWithNotification(commentData: DeepPartial<Comment>) {
  // Validate required fields manually hoặc rely on database constraints
  return await this.create(commentData);
}
```

### 3. Best Practices

#### **Level 1: Basic Repository (Generic)**

```typescript
class BaseRepository<T> {
  async create(entityData: DeepPartial<T>): Promise<T> {
    // Generic, flexible cho mọi entity
  }

  async update(id: number, entityData: Partial<T>): Promise<T> {
    // Update chỉ cần shallow partial
  }
}
```

#### **Level 2: Specific Repository (Type Safe)**

```typescript
class CommentRepository extends BaseRepository<Comment> {
  // Specialized methods với type safety cao
  async createCommentWithNotification(data: CreateCommentData): Promise<Comment> {
    return await this.create(data);
  }

  async updateComment(id: number, data: UpdateCommentData): Promise<Comment> {
    return await this.update(id, data);
  }
}
```

#### **Level 3: Service Layer (Business Logic)**

```typescript
class CommentService {
  async createComment(data: CreateCommentDto): Promise<Comment> {
    // DTO -> Domain data transformation
    const commentData: CreateCommentData = {
      content: data.content,
      userId: data.userId,
      parentId: data.parentId,
      isActive: true, // Business default
    };

    return await this.commentRepository.createCommentWithNotification(commentData);
  }
}
```

### 4. TypeScript Utility Types Reference

```typescript
// Built-in Utility Types
Partial<T>; // Tất cả properties optional (shallow)
Required<T>; // Tất cả properties required
Readonly<T>; // Tất cả properties readonly
Pick<T, K>; // Chọn specific properties
Omit<T, K>; // Loại bỏ specific properties
Record<K, T>; // Object với keys K và values T

// TypeORM Types
DeepPartial<T>; // Nested partial (TypeORM specific)
FindOptionsWhere<T>; // Where conditions
EntityTarget<T>; // Entity class hoặc string name
```

### 5. Real-world Examples

#### **E-commerce Order**

```typescript
interface CreateOrderData {
  userId: string; // Required
  items: OrderItem[]; // Required
  shippingAddress: Address; // Required
  paymentMethod?: string; // Optional - có default
  notes?: string; // Optional
}

// Thay vì:
// orderData: Partial<Order> ❌ - Có thể thiếu userId, items
```

#### **User Registration**

```typescript
interface CreateUserData {
  email: string; // Required
  password: string; // Required
  firstName: string; // Required
  lastName: string; // Required
  avatar?: string; // Optional
  isActive?: boolean; // Optional - default true
}

// Thay vì:
// userData: Partial<User> ❌ - Có thể thiếu email, password
```

### 6. Migration Strategy

#### **Hiện tại:**

```typescript
async createCommentWithNotification(commentData: Partial<Comment>)
```

#### **Cải thiện:**

```typescript
// Option 1: Custom Interface (Recommended)
async createCommentWithNotification(commentData: CreateCommentData)

// Option 2: DeepPartial (Flexible)
async createCommentWithNotification(commentData: DeepPartial<Comment>)

// Option 3: Validation
async createCommentWithNotification(commentData: Partial<Comment>) {
  if (!commentData.content || !commentData.userId) {
    throw new Error('Missing required fields');
  }
  // ...
}
```

## Kết luận

1. **`Partial<T>`**: Dùng cho update operations (không cần tất cả fields)
2. **`DeepPartial<T>`**: Dùng cho create operations với nested objects
3. **Custom Interfaces**: Dùng cho business-specific operations với type safety cao
4. **Validation**: Luôn validate input ở service layer

Type safety không chỉ là compile-time protection mà còn giúp:

- Better IntelliSense
- Self-documenting code
- Easier refactoring
- Runtime error prevention

## Trả lời câu hỏi: "Tại sao không nên dùng Partial<Comment> cho createCommentWithNotification?"

### 🎯 **Câu trả lời chi tiết:**

#### 1. **Type Safety Issues**

```typescript
// ❌ Với Partial<Comment>
async createCommentWithNotification(commentData: Partial<Comment>) {
  // commentData có thể = {} - hoàn toàn rỗng!
  // Không có compile-time check cho required fields
  return await this.create(commentData); // Runtime error possible
}

// User có thể gọi:
await repo.createCommentWithNotification({}); // Compiles OK, Runtime FAIL!
```

#### 2. **Inconsistency với BaseRepository**

```typescript
// BaseRepository sử dụng DeepPartial<T>
class BaseRepository<T> {
  async create(entityData: DeepPartial<T>): Promise<T> {
    // Consistent type choice
  }
}

// CommentRepository sử dụng Partial<Comment> - INCONSISTENT!
class CommentRepository {
  async createCommentWithNotification(commentData: Partial<Comment>) {
    // Why different type here?
  }
}
```

#### 3. **Business Logic Requirements**

```typescript
// Comment creation ALWAYS needs:
interface Comment {
  id: number; // Auto-generated
  content: string; // REQUIRED - không thể empty
  userId: string; // REQUIRED - must reference valid user
  parentId?: string; // Optional - for replies
  isActive: boolean; // Has business default
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}

// Partial<Comment> makes EVERYTHING optional - không phù hợp!
```

#### 4. **Better Alternatives**

**Option 1: Custom Interface (RECOMMENDED)**

```typescript
interface CreateCommentData {
  content: string; // Enforce required
  userId: string; // Enforce required
  parentId?: string; // Clearly optional
  isActive?: boolean; // Business default available
}
```

**Option 2: DeepPartial (Consistent)**

```typescript
async createCommentWithNotification(commentData: DeepPartial<Comment>) {
  // Consistent với BaseRepository
  // Flexible nhưng cần validation
}
```

**Option 3: Validation Layer**

```typescript
async createCommentWithNotification(commentData: Partial<Comment>) {
  // Validate required fields
  if (!commentData.content || !commentData.userId) {
    throw new Error('Missing required fields: content, userId');
  }
  // Continue...
}
```

### 🏆 **Kết luận:**

**`Partial<Comment>` KHÔNG phù hợp vì:**

1. ❌ Makes required fields optional
2. ❌ No compile-time safety
3. ❌ Inconsistent với BaseRepository pattern
4. ❌ Doesn't reflect business requirements
5. ❌ Runtime errors hard to debug

**`CreateCommentData` interface TỐT HƠN vì:**

1. ✅ Type-safe with required fields
2. ✅ Self-documenting code
3. ✅ Better IntelliSense
4. ✅ Easier refactoring
5. ✅ Catches errors at compile-time

### 📊 **Impact Analysis:**

```typescript
// Before (Partial<Comment>):
const result = await repo.createCommentWithNotification({
  isActive: true,
  // Missing content & userId - compiles but fails!
});

// After (CreateCommentData):
const result = await repo.createCommentWithNotification({
  content: "Required content", // ✅ Enforced
  userId: "user-123", // ✅ Enforced
  isActive: true, // ✅ Optional
});
```

**Tóm lại: Sử dụng domain-specific interfaces thay vì generic Partial<T> để có type safety tốt hơn và code dễ maintain hơn.**

---
