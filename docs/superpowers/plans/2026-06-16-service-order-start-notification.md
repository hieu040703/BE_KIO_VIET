# Service Order Start Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a backend cron job that runs every minute, sends start reminders for `CONFIRMED` service orders within `AppSetting.order.orderStartNotificationMinutes`, and resets the sent marker when admin changes `timeAt`.

**Architecture:** Persist a nullable `orderStartNotificationSentAt` field on `ServiceOrder`, reuse the existing direct-cron pattern from `src/queue/jobs/serviceOrderAssignmentTimeout.job.ts`, and centralize recipient lookup plus notification send inside a dedicated job helper. Reset the field in the admin update flow only when `timeAt` changes so the cron job can pick the order up again naturally.

**Tech Stack:** Node 24, TypeScript, TypeORM 0.3, Inversify, Croner, Jest, existing `NotificationService` + `FirebaseUtils`

---

### Task 1: Add the sent-marker persistence on `ServiceOrder`

**Files:**
- Modify: `src/database/models/ServiceOrder.ts`
- Create: `src/database/migrations/<timestamp>-AddOrderStartNotificationSentAtToServiceOrders.ts`
- Modify: `src/modules/serviceOrder/serviceOrder.select.ts`
- Test: `src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import "reflect-metadata";

describe("ServiceOrder start notification reset contract", () => {
  it("expects ServiceOrder update flow to support clearing orderStartNotificationSentAt when timeAt changes", () => {
    const payload = {
      timeAt: new Date("2026-06-16T09:00:00.000Z"),
      orderStartNotificationSentAt: null,
    };

    expect(payload).toMatchObject({
      timeAt: expect.any(Date),
      orderStartNotificationSentAt: null,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts --runInBand`

Expected: FAIL after the next step is expanded to assert the real admin update flow, because the sent marker field does not exist yet on the model/service path.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/database/models/ServiceOrder.ts
@Column({ type: "timestamp with time zone", nullable: true })
orderStartNotificationSentAt!: Date | null;
```

```ts
// src/modules/serviceOrder/serviceOrder.select.ts
orderStartNotificationSentAt: true,
```

```ts
// migration
await queryRunner.addColumn(
  "service_orders",
  new TableColumn({
    name: "orderStartNotificationSentAt",
    type: "timestamp with time zone",
    isNullable: true,
  }),
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts --runInBand`

Expected: PASS for the model/select contract test.

- [ ] **Step 5: Commit**

```bash
git add src/database/models/ServiceOrder.ts src/database/migrations src/modules/serviceOrder/serviceOrder.select.ts src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts
git commit -m "feat(service-order): add start notification sent marker"
```

### Task 2: Reset the sent marker when admin changes `timeAt`

**Files:**
- Modify: `src/modules/serviceOrder/admin.serviceOrder.service.ts`
- Test: `src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

import { AdminServiceOrderService } from "./admin.serviceOrder.service";
import { ServiceOrderStatusEnum } from "@/shared/constants/constance";

describe("AdminServiceOrderService start notification reset", () => {
  it("clears orderStartNotificationSentAt when timeAt changes", async () => {
    const existing = {
      id: "so-1",
      status: ServiceOrderStatusEnum.CONFIRMED,
      timeAt: new Date("2026-06-16T09:00:00.000Z"),
      orderStartNotificationSentAt: new Date("2026-06-16T08:45:00.000Z"),
    };

    const repository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn(),
      setOptions: jest.fn(),
    } as any;

    const service = new AdminServiceOrderService(
      repository,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const req = { body: { timeAt: "2026-06-16T10:00:00.000Z" } } as any;

    await service.validateBeforeUpdate("so-1", { timeAt: new Date("2026-06-16T10:00:00.000Z") } as any, req);

    expect(req.body.orderStartNotificationSentAt).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts --runInBand`

Expected: FAIL because `validateBeforeUpdate` does not clear `orderStartNotificationSentAt` yet.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/modules/serviceOrder/admin.serviceOrder.service.ts
if (data.timeAt && current.timeAt && new Date(data.timeAt).getTime() !== new Date(current.timeAt).getTime()) {
  Object.assign(data, { orderStartNotificationSentAt: null });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts --runInBand`

Expected: PASS and no regression in unchanged `timeAt` paths.

- [ ] **Step 5: Commit**

```bash
git add src/modules/serviceOrder/admin.serviceOrder.service.ts src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts
git commit -m "feat(service-order): reset start reminder when time changes"
```

### Task 3: Add the cron job helper that selects eligible orders and builds recipients

**Files:**
- Create: `src/queue/jobs/serviceOrderStartNotification.job.ts`
- Test: `src/queue/jobs/serviceOrderStartNotification.job.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

describe("serviceOrderStartNotification job", () => {
  it("notifies admins, assigned employee, and branch manager for confirmed orders in the reminder window", async () => {
    const now = new Date("2026-06-16T09:00:00.000Z");
    const serviceOrder = {
      id: "so-1",
      code: "DV000001",
      status: "CONFIRMED",
      timeAt: new Date("2026-06-16T09:20:00.000Z"),
      employeeId: "emp-1",
      branchId: "branch-1",
      orderStartNotificationSentAt: null,
    };

    const deps = {
      getReminderMinutes: jest.fn().mockResolvedValue(30),
      findEligibleServiceOrders: jest.fn().mockResolvedValue([serviceOrder]),
      findAdminUserIds: jest.fn().mockResolvedValue(["admin-1"]),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue(["employee-user-1", "branch-manager-user-1", "admin-1"]),
      createNotifications: jest.fn().mockResolvedValue(undefined),
      markSent: jest.fn().mockResolvedValue(undefined),
      sendFirebase: jest.fn(),
      now: () => now,
    };

    const { processServiceOrderStartNotifications } = await import("./serviceOrderStartNotification.job");

    await processServiceOrderStartNotifications(deps as any);

    expect(deps.createNotifications).toHaveBeenCalledWith(
      ["admin-1", "employee-user-1", "branch-manager-user-1"],
      expect.objectContaining({
        objectId: "so-1",
        metadata: expect.objectContaining({
          serviceOrderId: "so-1",
          event: "SERVICE_ORDER_START_REMINDER",
        }),
      }),
    );
    expect(deps.markSent).toHaveBeenCalledWith("so-1", now);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/queue/jobs/serviceOrderStartNotification.job.spec.ts --runInBand`

Expected: FAIL because the job file and helper do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface StartNotificationJobDeps {
  getReminderMinutes(): Promise<number>;
  findEligibleServiceOrders(reminderMinutes: number, now: Date): Promise<ServiceOrder[]>;
  findAdminUserIds(): Promise<string[]>;
  findUserIdsByEmployeeIds(employeeIds: string[]): Promise<string[]>;
  createNotifications(userIds: string[], payload: CreateNotificationDto): Promise<void>;
  markSent(serviceOrderId: string, sentAt: Date): Promise<void>;
  sendFirebase(userId: string, title: string, content: string, data: Record<string, any>): void;
  now(): Date;
}

export async function processServiceOrderStartNotifications(deps: StartNotificationJobDeps) {
  const now = deps.now();
  const reminderMinutes = await deps.getReminderMinutes();
  const serviceOrders = await deps.findEligibleServiceOrders(reminderMinutes, now);

  for (const serviceOrder of serviceOrders) {
    const employeeIds = [serviceOrder.employeeId, serviceOrder.branch?.employeeId].filter(Boolean) as string[];
    const userIds = [
      ...(await deps.findAdminUserIds()),
      ...(await deps.findUserIdsByEmployeeIds(employeeIds)),
    ].filter(Boolean);
    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.length === 0) continue;

    const title = "Đơn dịch vụ sắp đến giờ bắt đầu";
    const content = `Đơn dịch vụ ${serviceOrder.code || serviceOrder.id} sắp đến giờ bắt đầu.`;

    await deps.createNotifications(uniqueUserIds, {
      title,
      content,
      type: NotificationTypeEnum.SYSTEM,
      objectId: serviceOrder.id,
      metadata: {
        serviceOrderId: serviceOrder.id,
        event: "SERVICE_ORDER_START_REMINDER",
        timeAt: serviceOrder.timeAt,
      },
    } as any);

    uniqueUserIds.forEach((userId) =>
      deps.sendFirebase(userId, title, content, {
        type: NotificationTypeEnum.SYSTEM,
        serviceOrderId: serviceOrder.id,
        event: "SERVICE_ORDER_START_REMINDER",
      }),
    );

    await deps.markSent(serviceOrder.id, now);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/queue/jobs/serviceOrderStartNotification.job.spec.ts --runInBand`

Expected: PASS with the new helper.

- [ ] **Step 5: Commit**

```bash
git add src/queue/jobs/serviceOrderStartNotification.job.ts src/queue/jobs/serviceOrderStartNotification.job.spec.ts
git commit -m "feat(queue): add service order start reminder job helper"
```

### Task 4: Wire the real repositories and cron schedule into the job

**Files:**
- Modify: `src/queue/jobs/serviceOrderStartNotification.job.ts`
- Modify: `src/index.ts`
- Test: `src/queue/jobs/serviceOrderStartNotification.job.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
it("queries only confirmed unsent service orders whose timeAt is within the configured window", async () => {
  const qb = {
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  const serviceOrderRepository = {
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    }),
  };

  const { buildRuntimeDeps } = await import("./serviceOrderStartNotification.job");
  const deps = buildRuntimeDeps({
    serviceOrderRepository,
    appSettingRepository: { getOrderStartNotificationMinutes: jest.fn().mockResolvedValue(15) },
    userRepository: { findAllAdminUserIds: jest.fn(), findUserIdsByEmployeeIds: jest.fn() },
    notificationService: { createNotificationForMultipleUsers: jest.fn() },
  } as any);

  await deps.findEligibleServiceOrders(15, new Date("2026-06-16T09:00:00.000Z"));

  expect(qb.where).toHaveBeenCalledWith("serviceOrder.status = :status", { status: ServiceOrderStatusEnum.CONFIRMED });
  expect(qb.andWhere).toHaveBeenCalledWith("serviceOrder.orderStartNotificationSentAt IS NULL");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/queue/jobs/serviceOrderStartNotification.job.spec.ts --runInBand`

Expected: FAIL because the runtime repository wiring/query does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/queue/jobs/serviceOrderStartNotification.job.ts
const serviceOrderRepository = container.get<AdminServiceOrderRepository>(SERVICE_ORDER_TYPES.AdminServiceOrderRepository);
const appSettingRepository = container.get<AppSettingRepository>(APP_SETTING_TYPES.AppSettingRepository);
const userRepository = container.get<UserRepository>(USER_TYPES.UserRepository);
const notificationService = container.get<NotificationService>(NOTIFICATION_TYPES.NotificationService);

export function buildRuntimeDeps(...) {
  return {
    now: () => new Date(),
    getReminderMinutes: () => appSettingRepository.getOrderStartNotificationMinutes(),
    findEligibleServiceOrders: async (reminderMinutes, now) =>
      await serviceOrderRepository
        .getRepository()
        .createQueryBuilder("serviceOrder")
        .leftJoinAndSelect("serviceOrder.branch", "branch")
        .select([
          "serviceOrder.id",
          "serviceOrder.code",
          "serviceOrder.status",
          "serviceOrder.timeAt",
          "serviceOrder.employeeId",
          "serviceOrder.branchId",
          "serviceOrder.orderStartNotificationSentAt",
          "branch.id",
          "branch.employeeId",
        ])
        .where("serviceOrder.status = :status", { status: ServiceOrderStatusEnum.CONFIRMED })
        .andWhere("serviceOrder.deletedAt IS NULL")
        .andWhere("serviceOrder.orderStartNotificationSentAt IS NULL")
        .andWhere("serviceOrder.timeAt <= :deadline", {
          deadline: new Date(now.getTime() + reminderMinutes * 60 * 1000),
        })
        .getMany(),
    findAdminUserIds: () => userRepository.findAllAdminUserIds(),
    findUserIdsByEmployeeIds: (employeeIds) => userRepository.findUserIdsByEmployeeIds(employeeIds),
    createNotifications: async (userIds, payload) => {
      await notificationService.createNotificationForMultipleUsers(userIds, payload);
    },
    markSent: async (serviceOrderId, sentAt) => {
      await serviceOrderRepository.update(serviceOrderId, { orderStartNotificationSentAt: sentAt });
    },
    sendFirebase: (userId, title, content, data) => {
      FirebaseUtils.SentFirebaseWithUser({ userId, title, content, data });
    },
  };
}

let job: Cron | null = null;
let isProcessing = false;

export const JobServiceOrderStartNotification = {
  start: () => {
    if (!job) {
      job = new Cron("0 * * * * *", { timezone: "Asia/Ho_Chi_Minh" }, async () => {
        if (isProcessing) return;
        isProcessing = true;
        try {
          await processServiceOrderStartNotifications(buildRuntimeDeps());
        } finally {
          isProcessing = false;
        }
      });
    }
  },
};
```

```ts
// src/index.ts
import { JobServiceOrderStartNotification } from "./queue/jobs/serviceOrderStartNotification.job";

JobServiceOrderStartNotification.start();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/queue/jobs/serviceOrderStartNotification.job.spec.ts --runInBand`

Expected: PASS and query assertions confirm the `CONFIRMED` + unsent window filter.

- [ ] **Step 5: Commit**

```bash
git add src/queue/jobs/serviceOrderStartNotification.job.ts src/index.ts src/queue/jobs/serviceOrderStartNotification.job.spec.ts
git commit -m "feat(queue): wire service order start reminder cron"
```

### Task 5: Verify the full feature and update module knowledge

**Files:**
- Modify: `src/modules/serviceOrder/SKILL.md`
- Test: `src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts`
- Test: `src/queue/jobs/serviceOrderStartNotification.job.spec.ts`

- [ ] **Step 1: Update the module note**

```md
- `ServiceOrder.orderStartNotificationSentAt` marks whether the CONFIRMED-order start reminder cron already notified recipients. When admin changes `timeAt`, the admin update flow must reset this field to `null` so `JobServiceOrderStartNotification` can notify again.
```

- [ ] **Step 2: Run targeted tests**

Run: `npx jest src/modules/serviceOrder/serviceOrder.start-notification-reset.spec.ts src/queue/jobs/serviceOrderStartNotification.job.spec.ts --runInBand`

Expected: PASS with 0 failing tests.

- [ ] **Step 3: Run backend build**

Run: `npm run build`

Expected: exit code `0`

- [ ] **Step 4: Re-check spec coverage**

Checklist:
- only `CONFIRMED` orders are scanned
- reminder window uses `AppSetting.order.orderStartNotificationMinutes`
- admins + assigned employee + branch manager receive notifications
- sent marker is persisted after success
- changing `timeAt` resets the sent marker

- [ ] **Step 5: Commit**

```bash
git add src/modules/serviceOrder/SKILL.md
git commit -m "docs(service-order): record start reminder behavior"
```
