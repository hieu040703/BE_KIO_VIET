# Database Naming Conventions Guide

## 🎯 **Câu trả lời ngắn gọn:**

**Nên sử dụng `snake_case` cho tên cột trong database, và `camelCase` cho properties trong TypeScript entities.**

## 📊 **So sánh Snake_case vs CamelCase**

### 🐍 **Snake_case (Recommended for Database)**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🐪 **CamelCase (For TypeScript)**

```typescript
export class User {
  id: number;
  email: string;
  password: string;
  firstName: string; // maps to first_name
  lastName: string; // maps to last_name
  avatar?: string;
  isActive: boolean; // maps to is_active
  refreshToken?: string; // maps to refresh_token
  createdAt: Date; // maps to created_at
  updatedAt: Date; // maps to updated_at
}
```

## 🤔 **Tại sao nên dùng snake_case cho Database?**

### 1. **Database Standards**

```sql
-- ✅ Standard SQL style (widely accepted)
SELECT first_name, last_name, created_at
FROM users
WHERE is_active = true;

-- ❌ Non-standard (requires quotes in some databases)
SELECT "firstName", "lastName", "createdAt"
FROM users
WHERE "isActive" = true;
```

### 2. **Cross-Platform Compatibility**

```sql
-- PostgreSQL: Case-sensitive without quotes
SELECT firstName FROM users;  -- Error: column "firstname" does not exist
SELECT "firstName" FROM users; -- Works but not standard

-- MySQL: Generally case-insensitive but inconsistent
-- SQLite: Case-sensitive in some contexts
-- Oracle: Converts to UPPERCASE without quotes

-- snake_case works consistently across all databases
SELECT first_name FROM users; -- ✅ Works everywhere
```

### 3. **Readability**

```sql
-- ✅ Easy to read
SELECT
  u.first_name,
  u.last_name,
  u.created_at,
  c.comment_text
FROM users u
JOIN comments c ON u.id = c.user_id
WHERE u.is_active = true;

-- ❌ Harder to read
SELECT
  u.firstName,
  u.lastName,
  u.createdAt,
  c.commentText
FROM users u
JOIN comments c ON u.id = c.userId
WHERE u.isActive = true;
```

## 🔧 **TypeORM Implementation**

### **Cách 1: Explicit Column Mapping (Recommended)**

```typescript
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "first_name" })
  firstName!: string;

  @Column({ name: "last_name" })
  lastName!: string;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column({ name: "refresh_token", nullable: true })
  refreshToken?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
```

### **Cách 2: TypeORM Naming Strategy**

```typescript
// config/database.ts
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export const dataSourceOptions: DataSourceOptions = {
  // ...other config
  namingStrategy: new SnakeNamingStrategy(),
};

// Entity vẫn dùng camelCase, TypeORM tự convert
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  firstName!: string; // auto-converts to first_name

  @Column()
  lastName!: string; // auto-converts to last_name

  @Column({ default: true })
  isActive!: boolean; // auto-converts to is_active
}
```

## 🏗️ **Migration Examples**

### **With Explicit Naming**

```typescript
// migration
export class CreateUsersTable1634567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "first_name",
            type: "varchar",
            length: "100",
          },
          {
            name: "last_name",
            type: "varchar",
            length: "100",
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "NOW()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "NOW()",
          },
        ],
      })
    );
  }
}
```

## 🎨 **Best Practices by Context**

### **1. API Layer (JSON)**

```typescript
// ✅ camelCase for API responses
interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
}
```

### **2. Database Layer (SQL)**

```sql
-- ✅ snake_case for table/column names
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  bio TEXT,
  profile_image_url VARCHAR(500),
  social_media_links JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **3. TypeScript/Entity Layer**

```typescript
// ✅ camelCase properties, snake_case column mapping
@Entity("user_profiles")
export class UserProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column()
  bio?: string;

  @Column({ name: "profile_image_url" })
  profileImageUrl?: string;

  @Column({ name: "social_media_links", type: "jsonb" })
  socialMediaLinks?: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
```

## 🔄 **Migration Plan for Current Project**

### **Current State Analysis**

```typescript
// Current User entity (mixed approach)
@Column()
firstName!: string;  // camelCase property, likely camelCase column

@Column()
isActive!: boolean;  // camelCase property, likely camelCase column
```

### **Option 1: Add Explicit Column Names (Minimal Impact)**

```typescript
@Column({ name: "first_name" })
firstName!: string;

@Column({ name: "is_active", default: true })
isActive!: boolean;

@CreateDateColumn({ name: "created_at" })
createdAt!: Date;
```

### **Option 2: Create Migration to Rename Columns**

```typescript
export class RenameColumnsToSnakeCase1634567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename columns to snake_case
    await queryRunner.renameColumn("users", "firstName", "first_name");
    await queryRunner.renameColumn("users", "lastName", "last_name");
    await queryRunner.renameColumn("users", "isActive", "is_active");
    await queryRunner.renameColumn("users", "refreshToken", "refresh_token");
    await queryRunner.renameColumn("users", "createdAt", "created_at");
    await queryRunner.renameColumn("users", "updatedAt", "updated_at");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback
    await queryRunner.renameColumn("users", "first_name", "firstName");
    await queryRunner.renameColumn("users", "last_name", "lastName");
    await queryRunner.renameColumn("users", "is_active", "isActive");
    await queryRunner.renameColumn("users", "refresh_token", "refreshToken");
    await queryRunner.renameColumn("users", "created_at", "createdAt");
    await queryRunner.renameColumn("users", "updated_at", "updatedAt");
  }
}
```

## 🌍 **Industry Standards**

### **Popular Frameworks/ORMs**

- **Rails (Ruby)**: snake_case for database
- **Django (Python)**: snake_case for database
- **Laravel (PHP)**: snake_case for database
- **Spring Boot (Java)**: snake_case for database
- **TypeORM**: Flexible, but recommends snake_case with naming strategy

### **Database Conventions**

- **PostgreSQL**: snake_case is standard
- **MySQL**: snake_case is common
- **Oracle**: UPPER_CASE traditionally, snake_case modern
- **SQLite**: snake_case recommended

## ✅ **Recommendations**

### **For New Projects:**

```typescript
// 1. Use SnakeNamingStrategy
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

// 2. Keep camelCase in entities
@Entity("users")
export class User {
  @Column()
  firstName!: string; // becomes first_name in DB
}

// 3. Database will have snake_case automatically
```

### **For Existing Projects:**

```typescript
// 1. Add explicit column names gradually
@Column({ name: "first_name" })
firstName!: string;

// 2. Create migration when ready
// 3. Update all references in raw queries
```

## 🎯 **Conclusion**

**KHUYẾN NGHỊ:**

1. **Database columns**: `snake_case` (industry standard)
2. **TypeScript properties**: `camelCase` (JavaScript convention)
3. **API responses**: `camelCase` (JSON standard)
4. **Use TypeORM naming strategy** for automatic conversion

**Benefits:**

- ✅ Follows industry standards
- ✅ Better database tool compatibility
- ✅ Consistent with SQL conventions
- ✅ Easier for database administrators
- ✅ No case sensitivity issues
