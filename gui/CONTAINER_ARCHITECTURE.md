# Container Architecture Guide

## Cấu trúc tổ chức Container với Inversify

Dự án đã được tổ chức lại để mỗi module có container riêng biệt, sau đó được tập hợp vào container chính.

### Cấu trúc thư mục

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.types.ts        # Định nghĩa Symbol types cho auth module
│   │   ├── auth.container.ts    # Container riêng cho auth module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.repository.ts
│   ├── user/
│   │   ├── user.type.ts         # Định nghĩa Symbol types cho user module
│   │   ├── user.container.ts    # Container riêng cho user module
│   │   └── ...
│   ├── notification/
│   │   ├── notification.types.ts
│   │   ├── notification.container.ts
│   │   └── ...
│   ├── token/
│   │   ├── token.types.ts
│   │   ├── token.container.ts
│   │   └── ...
│   └── index.ts                 # Export tất cả module containers
├── shared/
│   └── types/
│       └── container.types.ts   # Tổng hợp tất cả types
└── config/
    └── container.ts             # Container chính - merge tất cả containers
```

### Cách hoạt động

#### 1. Module Types (\*.types.ts)

Mỗi module có file định nghĩa types riêng:

```typescript
// auth/auth.types.ts
export const AUTH_TYPES = {
  AuthController: Symbol.for("AuthController"),
  AuthService: Symbol.for("AuthService"),
  AuthRepository: Symbol.for("AuthRepository"),
  AuthRouter: Symbol.for("AuthRouter"),
};
```

#### 2. Module Container (\*.container.ts)

Mỗi module có container riêng để bind dependencies:

```typescript
// auth/auth.container.ts
import { Container } from "inversify";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import { AuthRouter } from "./auth.route";
import { AUTH_TYPES } from "./auth.types";

export const authContainer = new Container();

authContainer.bind<AuthController>(AUTH_TYPES.AuthController).to(AuthController);
authContainer.bind<AuthService>(AUTH_TYPES.AuthService).to(AuthService);
authContainer.bind<AuthRepository>(AUTH_TYPES.AuthRepository).to(AuthRepository);
authContainer.bind<AuthRouter>(AUTH_TYPES.AuthRouter).to(AuthRouter);

export { AUTH_TYPES };
```

#### 3. Container Types Tổng hợp

File `shared/types/container.types.ts` tổng hợp tất cả types:

```typescript
import { AUTH_TYPES } from "@/modules/auth/auth.types";
import { USER_TYPES } from "@/modules/user/user.type";
// ... other imports

export const TYPES = {
  ...AUTH_TYPES,
  ...USER_TYPES,
  // ... other types
};

export const COMMON_TYPES = {
  FirebaseUtils: Symbol.for("FirebaseUtils"),
  TransactionManager: Symbol.for("TransactionManager"),
  // ... other common types
};
```

#### 4. Container Chính

File `config/container.ts` merge tất cả containers:

```typescript
import { Container } from "inversify";
import { authContainer } from "@/modules/auth/auth.container";
import { userContainer } from "@/modules/user/user.container";
// ... other imports

const container = new Container();

// Bind common dependencies
container.bind<TransactionManager>(COMMON_TYPES.TransactionManager).to(TransactionManager);

// Merge all module containers
Container.merge(container, authContainer);
Container.merge(container, userContainer);
// ... merge other containers

export { container };
```

### Cách sử dụng

#### 1. Trong Controller/Service

```typescript
import { injectable, inject } from "inversify";
import { TYPES } from "@/shared/types/container.types";

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}
}
```

#### 2. Trong Routes

```typescript
import { container } from "@/config/container";
import { TYPES } from "@/shared/types/container.types";

const authController = container.get<AuthController>(TYPES.AuthController);
```

### Ưu điểm

1. **Tách biệt rõ ràng**: Mỗi module quản lý dependencies riêng
2. **Dễ bảo trì**: Thay đổi trong module không ảnh hưởng đến modules khác
3. **Tái sử dụng**: Module container có thể được import độc lập
4. **Type Safety**: Tất cả types được định nghĩa rõ ràng
5. **Scalability**: Dễ thêm module mới mà không làm rối container chính

### Lưu ý

- Các dependencies được chia sẻ giữa modules nên đặt trong `COMMON_TYPES`
- Mỗi module chỉ export những gì cần thiết
- Container chính chỉ merge các module containers, không bind trực tiếp dependencies của module
