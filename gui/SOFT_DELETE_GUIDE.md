# Soft Delete Implementation Guide

## 🎯 **Tổng quan**

Soft Delete là một kỹ thuật không xóa dữ liệu thực sự khỏi database, thay vào đó đánh dấu chúng là "đã xóa" bằng cách sử dụng cột `deleted_at`. Điều này có nhiều lợi ích:

- ✅ **Data Recovery**: Có thể khôi phục dữ liệu đã xóa
- ✅ **Audit Trail**: Giữ lại lịch sử cho mục đích audit
- ✅ **Compliance**: Đáp ứng yêu cầu pháp lý (GDPR, etc.)
- ✅ **Business Intelligence**: Phân tích dữ liệu lịch sử
- ✅ **Referential Integrity**: Không phá vỡ foreign key relationships

## 🏗️ **Architecture Overview**

### **1. BaseEntity với Soft Delete Support**

```typescript
import { DeleteDateColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt?: Date;

  // Helper methods
  get isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  get isActive(): boolean {
    return !this.isDeleted;
  }
}
```

### **2. Enhanced BaseRepository**

```typescript
export abstract class BaseRepository<T extends BaseEntity> {
  // Soft delete aware methods
  async findById(id: number, manager?: EntityManager, includeDeleted: boolean = false): Promise<T | null>;
  async findAll(manager?: EntityManager, includeDeleted: boolean = false): Promise<T[]>;

  // Delete operations
  async delete(id: number, manager?: EntityManager): Promise<boolean>; // Hard delete
  async softDelete(id: number, manager?: EntityManager): Promise<boolean>; // Soft delete
  async restore(id: number, manager?: EntityManager): Promise<boolean>; // Restore

  // Batch operations
  async softDeleteMany(ids: number[], manager?: EntityManager): Promise<number>;
  async restoreMany(ids: number[], manager?: EntityManager): Promise<number>;

  // Soft delete specific
  async findDeleted(manager?: EntityManager): Promise<T[]>;
  async isDeleted(id: number, manager?: EntityManager): Promise<boolean>;
}
```

### **3. Entity Examples**

```typescript
// User Entity
@Entity("users")
export class User extends BaseEntity {
  @Column({ name: "email", unique: true })
  email!: string;

  @Column({ name: "first_name" })
  firstName!: string;

  // ... other fields
}

// Comment Entity
@Entity("comments")
export class Comment extends BaseEntity {
  @Column("text")
  content!: string;

  @Column({ name: "user_id" })
  userId!: string;

  // ... other fields
}
```

## 🔧 **Implementation Details**

### **1. Database Schema**

```sql
-- Users table with soft delete
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL  -- Soft delete column
);

-- Indexes for performance
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
```

### **2. TypeORM Configuration**

```typescript
// TypeORM automatically handles soft delete when using @DeleteDateColumn
// Queries automatically exclude soft deleted records unless specified otherwise

// Normal query - excludes deleted
const users = await userRepository.find(); // Only active users

// Include deleted
const allUsers = await userRepository.find({ withDeleted: true });

// Only deleted
const deletedUsers = await userRepository.find({
  where: { deletedAt: Not(IsNull()) },
  withDeleted: true,
});
```

### **3. Migration Strategy**

```typescript
export class AddSoftDeleteColumns implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add deleted_at column
    await queryRunner.addColumn(
      "users",
      new TableColumn({
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
        default: null,
      }),
    );

    // Add indexes
    await queryRunner.query(`CREATE INDEX "IDX_users_deleted_at" ON "users" ("deleted_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_active" ON "users" ("id") WHERE "deleted_at" IS NULL`);
  }
}
```

## 📝 **Usage Examples**

### **1. Basic Operations**

```typescript
// Create user
const user = await userRepository.create({
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
});

// Soft delete user
await userRepository.softDelete(user.id);

// User won't appear in normal searches
const foundUser = await userRepository.findById(user.id); // null

// But can be found when including deleted
const deletedUser = await userRepository.findById(user.id, undefined, true); // found

// Restore user
await userRepository.restore(user.id);

// User is back in normal searches
const restoredUser = await userRepository.findById(user.id); // found
```

### **2. Transaction-based Operations**

```typescript
// Soft delete user and all their content in transaction
await userRepository.withTransaction(async (manager) => {
  // Soft delete user
  await userRepository.softDelete(user.id, manager);

  // Soft delete all user's comments
  const userComments = await commentRepository.findOne({ userId: user.id }, manager);
  for (const comment of userComments) {
    await commentRepository.softDelete(comment.id, manager);
  }
});
```

### **3. Batch Operations**

```typescript
// Batch soft delete
const userIds = ["id1", "id2", "id3"];
const deletedCount = await userRepository.softDeleteManyWithTransaction(userIds);

// Batch restore
const restoredCount = await userRepository.restoreManyWithTransaction(userIds);
```

### **4. Pagination with Soft Delete Awareness**

```typescript
// Only active records
const activePage = await userRepository.findWithPagination(1, 10, {}, undefined, false);

// Include deleted records
const allPage = await userRepository.findWithPagination(1, 10, {}, undefined, true);

// Count operations
const activeCount = await userRepository.count({}, undefined, false);
const totalCount = await userRepository.count({}, undefined, true);
```

## 🎯 **Real-world Scenarios**

### **1. User Account Deactivation (GDPR Compliance)**

```typescript
async deactivateUserAccount(userId: string): Promise<void> {
  await this.userRepository.withTransaction(async (manager) => {
    // 1. Soft delete user for audit trail
    await this.userRepository.softDelete(userId, manager);

    // 2. Anonymize or soft delete user's content
    const userComments = await this.commentRepository.findOne({ userId }, manager);
    for (const comment of userComments) {
      // Option 1: Soft delete
      await this.commentRepository.softDelete(comment.id, manager);

      // Option 2: Anonymize
      // await this.commentRepository.update(comment.id, {
      //   content: "[deleted]",
      //   userId: "anonymous"
      // }, manager);
    }

    // 3. Log action for compliance
    await this.auditRepository.create({
      action: 'USER_DEACTIVATED',
      userId,
      reason: 'GDPR_REQUEST',
      timestamp: new Date()
    }, manager);
  });
}
```

### **2. E-commerce Order Management**

```typescript
async cancelOrder(orderId: string, reason: string): Promise<void> {
  await this.orderRepository.withTransaction(async (manager) => {
    // Soft delete order (keep for business analytics)
    await this.orderRepository.softDelete(orderId, manager);

    // Update inventory
    const orderItems = await this.orderItemRepository.find({ orderId }, manager);
    for (const item of orderItems) {
      await this.inventoryService.restoreStock(item.productId, item.quantity, manager);
    }

    // Create refund record
    await this.refundRepository.create({
      orderId,
      reason,
      amount: order.totalAmount,
      status: 'PENDING'
    }, manager);
  });
}
```

### **3. Content Moderation**

```typescript
async moderateContent(contentId: string, moderatorId: string, reason: string): Promise<void> {
  await this.contentRepository.withTransaction(async (manager) => {
    // Soft delete content (keep for appeal process)
    await this.contentRepository.softDelete(contentId, manager);

    // Create moderation record
    await this.moderationRepository.create({
      contentId,
      moderatorId,
      action: 'CONTENT_REMOVED',
      reason,
      appealable: true,
      appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }, manager);

    // Notify content owner
    await this.notificationService.sendModerationNotice(contentId, reason);
  });
}
```

## ⚡ **Performance Considerations**

### **1. Indexing Strategy**

```sql
-- Primary index on deleted_at
CREATE INDEX idx_table_deleted_at ON table_name(deleted_at);

-- Partial index for active records (more efficient)
CREATE INDEX idx_table_active ON table_name(id) WHERE deleted_at IS NULL;

-- Composite indexes for common queries
CREATE INDEX idx_table_user_active ON table_name(user_id, created_at) WHERE deleted_at IS NULL;
```

### **2. Query Optimization**

```typescript
// ✅ Good - Use partial indexes
const activeUsers = await userRepository.find({
  where: { deletedAt: IsNull() },
});

// ❌ Avoid - Full table scan
const activeUsers = await userRepository.find({
  where: { deletedAt: undefined },
});

// ✅ Good - Use repository methods with built-in optimization
const activeUsers = await userRepository.findAll(undefined, false);
```

### **3. Data Archival Strategy**

```typescript
// Periodic cleanup of old soft-deleted records
async archiveOldDeletedRecords(): Promise<void> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Find records deleted more than 6 months ago
  const oldDeletedUsers = await this.userRepository.createQueryBuilder()
    .where('deleted_at IS NOT NULL')
    .andWhere('deleted_at < :date', { date: sixMonthsAgo })
    .withDeleted()
    .getMany();

  // Archive to separate table
  for (const user of oldDeletedUsers) {
    await this.archiveRepository.create({
      originalId: user.id,
      entityType: 'USER',
      data: JSON.stringify(user),
      deletedAt: user.deletedAt,
      archivedAt: new Date()
    });

    // Hard delete from main table
    await this.userRepository.delete(user.id);
  }
}
```

## 🔒 **Security & Compliance**

### **1. Access Control**

```typescript
// Only admins can access soft deleted records
async findByIdForAdmin(id: number, isAdmin: boolean): Promise<User | null> {
  return await this.userRepository.findById(id, undefined, isAdmin);
}

// API endpoint with role check
@Get(':id/deleted')
@Roles('admin')
async getDeletedUser(@Param('id') id: number): Promise<User> {
  const user = await this.userService.findByIdWithDeleted(id);
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}
```

### **2. Audit Logging**

```typescript
async softDeleteWithAudit(id: number, deletedBy: string, reason?: string): Promise<boolean> {
  return await this.withTransaction(async (manager) => {
    // Perform soft delete
    const result = await this.softDelete(id, manager);

    // Log the action
    await this.auditRepository.create({
      entityType: this.entityClass.name,
      entityId: id,
      action: 'SOFT_DELETE',
      performedBy: deletedBy,
      reason,
      timestamp: new Date()
    }, manager);

    return result;
  });
}
```

### **3. Data Retention Policies**

```typescript
interface RetentionPolicy {
  entityType: string;
  retentionPeriod: number; // days
  archiveAfter: number; // days
  hardDeleteAfter: number; // days
}

const retentionPolicies: RetentionPolicy[] = [
  { entityType: "User", retentionPeriod: 2555, archiveAfter: 365, hardDeleteAfter: 2555 }, // 7 years
  { entityType: "Comment", retentionPeriod: 1095, archiveAfter: 90, hardDeleteAfter: 1095 }, // 3 years
  { entityType: "Order", retentionPeriod: 3650, archiveAfter: 365, hardDeleteAfter: 3650 }, // 10 years
];
```

## 🧪 **Testing Strategies**

### **1. Unit Tests**

```typescript
describe("Soft Delete Functionality", () => {
  it("should soft delete and exclude from normal queries", async () => {
    const user = await userRepository.create(testUserData);

    await userRepository.softDelete(user.id);

    const foundUser = await userRepository.findById(user.id);
    expect(foundUser).toBeNull();

    const deletedUser = await userRepository.findById(user.id, undefined, true);
    expect(deletedUser).toBeDefined();
    expect(deletedUser!.isDeleted).toBe(true);
  });

  it("should restore soft deleted records", async () => {
    const user = await userRepository.create(testUserData);
    await userRepository.softDelete(user.id);

    await userRepository.restore(user.id);

    const restoredUser = await userRepository.findById(user.id);
    expect(restoredUser).toBeDefined();
    expect(restoredUser!.isActive).toBe(true);
  });
});
```

### **2. Integration Tests**

```typescript
describe("Soft Delete Integration", () => {
  it("should handle complex soft delete scenarios", async () => {
    const user = await userRepository.create(testUserData);
    const comments = await commentRepository.createMany([
      { content: "Comment 1", userId: user.id },
      { content: "Comment 2", userId: user.id },
    ]);

    // Soft delete user and all comments
    await userRepository.withTransaction(async (manager) => {
      await userRepository.softDelete(user.id, manager);
      for (const comment of comments) {
        await commentRepository.softDelete(comment.id, manager);
      }
    });

    // Verify cascade soft delete
    const activeUser = await userRepository.findById(user.id);
    const activeComments = await commentRepository.find({ userId: user.id });

    expect(activeUser).toBeNull();
    expect(activeComments).toHaveLength(0);
  });
});
```

## 🚀 **Migration from Hard Delete**

### **1. Add Soft Delete Columns**

```sql
-- Step 1: Add deleted_at column
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMP NULL;

-- Step 2: Add indexes
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_comments_deleted_at ON comments(deleted_at);
```

### **2. Update Application Code**

```typescript
// Before (hard delete)
await userRepository.delete(userId);

// After (soft delete)
await userRepository.softDelete(userId);

// When you need hard delete
await userRepository.delete(userId); // Still available
```

### **3. Gradual Migration Strategy**

```typescript
// Phase 1: Add soft delete support alongside existing hard delete
// Phase 2: Update business logic to use soft delete
// Phase 3: Add data retention policies
// Phase 4: Remove hard delete from business logic (keep for admin)
```

## 📊 **Monitoring & Analytics**

### **1. Soft Delete Metrics**

```typescript
async getSoftDeleteMetrics(): Promise<SoftDeleteMetrics> {
  const totalUsers = await this.userRepository.count({}, undefined, true);
  const activeUsers = await this.userRepository.count({}, undefined, false);
  const deletedUsers = totalUsers - activeUsers;

  return {
    totalRecords: totalUsers,
    activeRecords: activeUsers,
    deletedRecords: deletedUsers,
    deletionRate: (deletedUsers / totalUsers) * 100
  };
}
```

### **2. Dashboard Queries**

```sql
-- Active vs Deleted records
SELECT
  'active' as status,
  COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
UNION ALL
SELECT
  'deleted' as status,
  COUNT(*) as count
FROM users
WHERE deleted_at IS NOT NULL;

-- Deletion trends
SELECT
  DATE_TRUNC('day', deleted_at) as deletion_date,
  COUNT(*) as deletions_count
FROM users
WHERE deleted_at IS NOT NULL
AND deleted_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', deleted_at)
ORDER BY deletion_date;
```

## 🎯 **Best Practices Summary**

### ✅ **DO:**

- Use `@DeleteDateColumn` for automatic TypeORM integration
- Add indexes on `deleted_at` column for performance
- Implement audit logging for compliance
- Use transactions for related entity operations
- Provide restore functionality
- Implement data retention policies
- Test soft delete scenarios thoroughly

### ❌ **DON'T:**

- Expose soft deleted data to regular users
- Forget to handle soft deleted records in business logic
- Skip indexing strategy
- Hard delete without proper authorization
- Ignore compliance requirements
- Forget about data archival

## 🔄 **Next Steps**

1. **Implement soft delete in your entities**
2. **Run the migration to add deleted_at columns**
3. **Update your repositories to extend BaseRepository**
4. **Test the functionality with the provided demos**
5. **Implement business-specific soft delete logic**
6. **Set up monitoring and analytics**
7. **Plan data retention and archival strategies**

---

_Soft delete implementation hoàn chỉnh giúp ứng dụng của bạn có tính bảo mật, tuân thủ pháp luật và khả năng khôi phục dữ liệu tốt hơn!_
