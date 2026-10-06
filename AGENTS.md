# BE/AGENTS.md

> Module-specific conventions for `BE/` (Express + TypeORM + Inversify + Bull), shared by every agent. Read this together with the workspace-wide [`../AGENTS.md`](../AGENTS.md) before editing any file in `BE/`. `BE/CLAUDE.md` imports this file via `@AGENTS.md` for Claude Code — edit BE-specific conventions here, not there.

## Common commands

Run all commands below from `BE/`. Package manager: `yarn`.

```bash
yarn dev                  # API + watch (ts-node-dev, port 4000)
yarn worker               # Bull worker process (run alongside dev if you need the job processor)
yarn build                # tsc -p tsconfig.build.json && tsc-alias && node scripts/copy-location-data.js
yarn start                # run dist/index.js (max-old-space-size=8192)
yarn start:worker         # run dist/worker.js

yarn test                 # Jest
yarn test:watch
yarn test:coverage        # run for large service/repository/queue changes

yarn db:migrate           # typeorm migration:run
yarn db:migrate:revert
yarn db:migrate:generate
yarn db:seed              # src/database/seeders/index.ts
yarn db:sync              # ⚠️ DEV ONLY — sync schema from entities (production uses migrations)
yarn db:reset             # ⚠️ drop + sync — destroys data
yarn db:check             # check-sync

# Auto-generate module skeleton from an entity (do NOT hand-write these):
yarn entity:gen           # scripts/generate-modules.sh
yarn entity:genv2         # scripts/generate-modules-v2.sh
yarn validator:gen        # auto-generate Zod validators
```

## Vị trí file test

- Mọi file test (`*.spec.ts`, `*.test.ts` và các biến thể tương ứng) phải nằm trong thư mục `tests/` ở ngay trong thư mục hiện tại của phần code được test; nếu chưa có thì tạo thư mục này.
- Không đặt file test cạnh file implementation và không dùng `__tests__/` cho test mới. Ví dụ: `src/modules/order/order.complete.spec.ts` phải đặt tại `src/modules/order/tests/order.complete.spec.ts`.
- `src/tests/` là thư mục dùng chung cho test support như `setup.ts`, `globalSetup.ts`, `globalTeardown.ts` và các migration spec; không tạo thêm `src/tests/tests/`.
- Khi di chuyển test, phải cập nhật import tương đối, `jest.mock(...)`, đường dẫn `path.resolve(__dirname, ...)` và tài liệu tham chiếu tới test đó.

## Required module pattern

Every feature follows this exact layout in `BE/src/modules/<feature>/`:

```
<feature>.types.ts        # DI symbols
<feature>.container.ts    # ContainerModule + bind
<feature>.repository.ts   # extends BaseRepository<Entity>
<feature>.service.ts      # extends BaseService<Entity>
<feature>.controller.ts   # extends BaseController<Service>
<feature>.route.ts        # Express Router @injectable
<feature>.select.ts       # FindOptionsSelect + Relations
<feature>.validator.ts    # Zod schemas + DTO types
```

Admin/client variants: `admin.<feature>.route.ts` / `client.<feature>.route.ts` when they need to diverge. Both sides share the same `Entity` and `validator`.

**When adding a new module, you must:**

1. Create `<feature>.container.ts` and `bind` every symbol from `types.ts`.
2. Import + register the module in `BE/src/shared/config/container.ts`.
3. For an admin route: add it to `BE/src/routers/admin.routes.ts` (after `authenticate` + `adminMiddleware`).
4. For a client route: add it to `client.routes.ts` (after `authenticate` + `clientMiddleware`).

**Don't bypass `BaseService` / `BaseRepository`**: lifecycle hooks (`validateBeforeCreate`, `actionAfterCreate`, `validateBeforeUpdate`, `actionAfterUpdate`, `checkExistInDb`, `checkReferencesInDb`, file attachment) all run through the base classes. Writing CRUD directly against `Repository` skips soft delete, FK reference validation, and file attachment.

**Soft delete by default**: `BaseRepository.find*` always filters `deletedAt IS NULL`. Use `softDelete(id)` (sets `deletedAt`), not `delete(id)`.

**Symbol names must use `Symbol.for(...)`** so the container can be shared between the main process and the worker.

## DI circular dependency

When A needs B, and B needs A's repository → **inject A's Repository into B**, not A's Service. This rule is applied consistently throughout (e.g. `TripNotificationService` injects `AdminTripRepository`, not `AdminTripService`).

## Transaction

Multi-table writes **must** be wrapped in `TransactionManager.runInTransaction` (inject `COMMON_TYPES.TransactionManager`). Pass `manager` down to `repository.create/update/delete(data, manager)`.

## `mapRawEntities` and leading zeros

`BaseRepository.findById` / `findWithPagination` call `getRawAndEntities` then `mapRawEntities` → converts varchar/text/char columns from number back to string to preserve leading zeros. When overriding `extendQueryBuilder` or writing a manual query in a child repository, don't use `find`/`findOne` directly — go through `getRawAndEntities` to preserve formatting.

## Queues & jobs

- `BE/src/queue/index.ts` initializes queues when `IS_WORKER_MODE=false` (main process only submits jobs).
- The worker runs via `yarn worker` (`src/worker.ts`).
- Cron jobs (`BE/src/queue/jobs/*.job.ts`) run in the main process (`index.ts` calls `JobXxx.start()`); each job uses `croner` and must guard with `isProcessing` to prevent overlapping ticks.
- `QueueManager.getInstance()` is a singleton.

## Socket.IO & SSE

- `Socket` (main process) manages a `userSockets` map from userId → socketIds; emit via `Socket.getIO().to(socketId).emit(...)`.
- SSE: `BE/src/shared/config/sse.ts` + `sse.middleware.ts`. FE subscribes via `EventSource` (e.g. `trip-quote-updated`).
- Disable socket in FE: set `VITE_DISABLE_SOCKET=true` in `.env` (see `FE/src/services/socket.ts`).

## Validation & errors

- Validation: Zod — middleware `zodValidate(Schema, "body" | "query" | "params")` in `BE/src/shared/middleware/validation.middleware.ts`. DTO type from `z.infer<typeof Schema>`.
- Error throwing: `BadRequestError`, `NotFoundError`, `ConflictError`, `ValidationError`, `UnauthorizedError` from `BE/src/shared/types/errors`.
- Standard response: `ApiResponseHandler` in `BE/src/shared/utils/response.utils.ts` (`{ statusCode, success, message, data, pagination, summary }`).

## First time working on a module

> **Rule #1: verify before reporting.** After every BE change, back it with tool output: `yarn build` pass, `yarn lint` pass (if lint-affecting), `yarn test` pass (if the code has tests), `yarn db:check` pass (if touching entities/migrations), `curl`/HTTP status for a new endpoint, or logs/procmon for a job/cron. Never say "done" without confirming output.

1. Read `BE/src/modules/<feature>/SKILL.md` if it exists — operational notes (e.g. `trip/SKILL.md` lists Zalo BOOK/RECEIVE business rules, auto-approve quote, driver call-customer conditions).
2. Open `<feature>.container.ts` to understand the DI graph.
3. Open `<feature>.service.ts` to see the hooks (`validateBeforeCreate`, `actionAfterCreate`, ...) — where the real business logic lives.
4. Open `<feature>.repository.ts` for `extendQueryBuilder` (extra filters, soft-delete aware) and `selectedFields`/`relations` (`<feature>.select.ts`).
5. After editing, update or create `SKILL.md` for that module, summarizing the change so the next session doesn't lose context.
6. **Verify** with `yarn build` + `yarn test` (or `curl` for an endpoint) before reporting.

## Docker & deploy

- `BE/Dockerfile` + `BE/Dockerfile.worker` (multi-stage); `BE/docker-compose.yml` orchestrates API, worker, Postgres, Redis, MinIO, Nginx.
- `BE/ecosystem.config.js` for PM2 (prod). `BE/docker-start.sh` is handy for the local stack.
- CI: `BE/.github/workflows/node.js.yml` builds/deploys to a self-hosted runner via PM2.
- **Verify when touching worker/job code**: after editing worker code, run `yarn build && yarn build:worker` (if a separate script exists) or `tsc -p tsconfig.build.json`, then smoke-test `yarn start:worker` and watch the logs for queue connect + one sample job.
