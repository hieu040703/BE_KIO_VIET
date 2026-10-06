# TypeORM Operators - Hướng dẫn đầy đủ

## 1. Comparison Operators (So sánh)

### Equal

```typescript
import { Equal } from "typeorm";

// Tìm user có age = 25
const users = await userRepository.find({
  where: { age: Equal(25) },
});

// Hoặc đơn giản hơn (mặc định là Equal)
const users = await userRepository.find({
  where: { age: 25 },
});
```

### Not

```typescript
import { Not } from "typeorm";

// Tìm user không có age = 25
const users = await userRepository.find({
  where: { age: Not(25) },
});

// Kết hợp với operators khác
const users = await userRepository.find({
  where: { age: Not(Equal(25)) },
});
```

### LessThan

```typescript
import { LessThan } from "typeorm";

// Tìm user có age < 30
const users = await userRepository.find({
  where: { age: LessThan(30) },
});
```

### LessThanOrEqual

```typescript
import { LessThanOrEqual } from "typeorm";

// Tìm user có age <= 30
const users = await userRepository.find({
  where: { age: LessThanOrEqual(30) },
});
```

### MoreThan

```typescript
import { MoreThan } from "typeorm";

// Tìm user có age > 18
const users = await userRepository.find({
  where: { age: MoreThan(18) },
});
```

### MoreThanOrEqual

```typescript
import { MoreThanOrEqual } from "typeorm";

// Tìm user có age >= 18
const users = await userRepository.find({
  where: { age: MoreThanOrEqual(18) },
});
```

### Between

```typescript
import { Between } from "typeorm";

// Tìm user có age từ 18 đến 65
const users = await userRepository.find({
  where: { age: Between(18, 65) },
});

// Với ngày tháng
const posts = await postRepository.find({
  where: {
    createdAt: Between(new Date("2024-01-01"), new Date("2024-12-31")),
  },
});
```

## 2. Pattern Matching Operators

### Like

```typescript
import { Like } from "typeorm";

// Tìm user có tên chứa "john"
const users = await userRepository.find({
  where: { name: Like("%john%") },
});

// Bắt đầu bằng "John"
const users = await userRepository.find({
  where: { name: Like("John%") },
});

// Kết thúc bằng "Smith"
const users = await userRepository.find({
  where: { name: Like("%Smith") },
});
```

### ILike (Case-insensitive Like)

```typescript
import { ILike } from "typeorm";

// Tìm kiếm không phân biệt hoa thường
const users = await userRepository.find({
  where: { name: ILike("%JOHN%") },
});
// Sẽ tìm thấy "john", "John", "JOHN", etc.
```

## 3. Array Operators

### In

```typescript
import { In } from "typeorm";

// Tìm user có id trong danh sách
const users = await userRepository.find({
  where: { id: In([1, 2, 3, 4, 5]) },
});

// Với string array
const users = await userRepository.find({
  where: { role: In(["admin", "moderator", "user"]) },
});
```

### Any

```typescript
import { Any } from "typeorm";

// Tìm user có tags chứa bất kỳ giá trị nào trong array
const users = await userRepository.find({
  where: { tags: Any(["javascript", "typescript", "react"]) },
});
```

## 4. Null Operators

### IsNull

```typescript
import { IsNull } from "typeorm";

// Tìm user có deletedAt = null
const users = await userRepository.find({
  where: { deletedAt: IsNull() },
});
```

### Not + IsNull

```typescript
import { Not, IsNull } from "typeorm";

// Tìm user có deletedAt không null
const users = await userRepository.find({
  where: { deletedAt: Not(IsNull()) },
});
```

## 5. Raw SQL Operator

### Raw

```typescript
import { Raw } from "typeorm";

// Sử dụng SQL function
const users = await userRepository.find({
  where: {
    name: Raw((alias) => `LOWER(${alias}) = 'john'`),
  },
});

// Với parameters
const users = await userRepository.find({
  where: {
    age: Raw((alias) => `${alias} > :age`, { age: 18 }),
  },
});

// Tìm kiếm trong JSON field
const users = await userRepository.find({
  where: {
    metadata: Raw((alias) => `${alias}->>'country' = :country`, { country: "Vietnam" }),
  },
});
```

## 6. Logical Operators

### And (mặc định)

```typescript
// Tất cả điều kiện trong object sẽ được kết hợp bằng AND
const users = await userRepository.find({
  where: {
    age: MoreThan(18),
    isActive: true,
    role: "user",
  },
});
```

### Or

```typescript
// Sử dụng array để tạo OR conditions
const users = await userRepository.find({
  where: [{ name: Like("%john%") }, { email: Like("%john%") }, { phone: Like("%john%") }],
});
```

## 7. Kết hợp Operators phức tạp

### Not kết hợp với operators khác

```typescript
import { Not, Like, In, Between } from "typeorm";

// Không chứa "test"
const users = await userRepository.find({
  where: { name: Not(Like("%test%")) },
});

// Không trong danh sách
const users = await userRepository.find({
  where: { role: Not(In(["banned", "suspended"])) },
});

// Không trong khoảng
const users = await userRepository.find({
  where: { age: Not(Between(13, 17)) },
});
```

### Kết hợp nhiều operators

```typescript
import { Like, MoreThan, In, Not, IsNull } from "typeorm";

const users = await userRepository.find({
  where: {
    name: Like("%john%"),
    age: MoreThan(18),
    role: In(["user", "admin"]),
    deletedAt: IsNull(),
    email: Not(Like("%temp%")),
  },
});
```

## 8. Sử dụng với Query Builder

```typescript
const users = await userRepository
  .createQueryBuilder("user")
  .where("user.age > :age", { age: 18 })
  .andWhere("user.name LIKE :name", { name: "%john%" })
  .andWhere("user.role IN (:...roles)", { roles: ["user", "admin"] })
  .andWhere("user.deletedAt IS NULL")
  .getMany();
```

## 9. Operators với Relations

```typescript
// Tìm user có posts với title chứa "typescript"
const users = await userRepository.find({
  where: {
    posts: {
      title: Like("%typescript%"),
    },
  },
  relations: ["posts"],
});

// Với nested relations
const users = await userRepository.find({
  where: {
    profile: {
      address: {
        city: "Hanoi",
      },
    },
  },
  relations: ["profile", "profile.address"],
});
```

## 10. Date/Time Operators

```typescript
import { MoreThan, LessThan, Between } from "typeorm";

// Posts created today
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const todayPosts = await postRepository.find({
  where: {
    createdAt: Between(today, tomorrow),
  },
});

// Posts created in last 7 days
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);

const recentPosts = await postRepository.find({
  where: {
    createdAt: MoreThan(weekAgo),
  },
});
```

## 11. JSON Operators (PostgreSQL/MySQL)

```typescript
import { Raw } from "typeorm";

// Tìm trong JSON field
const users = await userRepository.find({
  where: {
    // PostgreSQL
    metadata: Raw((alias) => `${alias}->>'age' = '25'`),

    // MySQL
    settings: Raw((alias) => `JSON_EXTRACT(${alias}, '$.theme') = 'dark'`),
  },
});
```

## 12. Array Operations (PostgreSQL)

```typescript
import { Raw } from "typeorm";

// Array contains
const users = await userRepository.find({
  where: {
    tags: Raw((alias) => `${alias} @> ARRAY['javascript']`),
  },
});

// Array overlap
const users = await userRepository.find({
  where: {
    skills: Raw((alias) => `${alias} && ARRAY['react', 'vue']`),
  },
});
```

## Lưu ý quan trọng:

1. **Performance**: Sử dụng index cho các trường thường xuyên query
2. **Type Safety**: TypeScript sẽ kiểm tra type khi sử dụng operators
3. **SQL Injection**: Operators tự động escape values, an toàn hơn raw SQL
4. **Database Specific**: Một số operators chỉ hoạt động với database cụ thể
5. **Caching**: TypeORM có thể cache query results với operators

## Ví dụ thực tế kết hợp

```typescript
import { Like, MoreThan, In, Not, IsNull, Between } from "typeorm";

// Tìm kiếm user phức tạp
const searchUsers = async (searchTerm: string, filters: any) => {
  return await userRepository.find({
    where: [
      {
        // OR condition 1
        name: Like(`%${searchTerm}%`),
        age: Between(18, 65),
        role: In(["user", "premium"]),
        isActive: true,
        deletedAt: IsNull(),
      },
      {
        // OR condition 2
        email: Like(`%${searchTerm}%`),
        age: Between(18, 65),
        role: In(["user", "premium"]),
        isActive: true,
        deletedAt: IsNull(),
      },
    ],
    order: { createdAt: "DESC" },
    take: 20,
    skip: filters.page * 20,
  });
};
```
