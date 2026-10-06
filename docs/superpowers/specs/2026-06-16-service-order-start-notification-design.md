# Service Order Start Notification Design

Date: 2026-06-16

## Goal

Add a backend cron job that runs every minute, finds `ServiceOrder` records with `status = CONFIRMED` whose `timeAt` is within the configured lead time from `AppSetting.order.orderStartNotificationMinutes`, sends notifications to admins, the assigned employee, and the branch manager, then marks the notification as sent.

If an admin later changes `timeAt`, the sent marker must be reset so the cron job can notify again for the new start time.

## Scope

In scope:
- Backend-only implementation in `BE`
- New cron job under `src/queue/jobs`
- `ServiceOrder` persistence update for start-notification sent state
- Reset sent state when admin updates `timeAt`
- Reuse existing notification infrastructure (`NotificationService`, `FirebaseUtils`)
- Targeted backend tests

Out of scope:
- Frontend UI changes
- New notification template management UI
- Per-recipient delivery tracking beyond the existing notification tables
- Rescheduling logic for statuses other than `CONFIRMED`

## Chosen Approach

Use the existing cron-job pattern already present in the repo, similar to `serviceOrderAssignmentTimeout.job.ts`.

Why this approach:
- It matches the current repository pattern for service-order background checks.
- It avoids introducing Bull recurring jobs for a use case already handled by direct cron jobs.
- It keeps the reset behavior simple: changing `timeAt` only needs to clear one persisted marker.

## Data Model

Add one nullable timestamp field to `ServiceOrder`:

- `orderStartNotificationSentAt: Date | null`

Meaning:
- `null`: the start reminder has not been sent yet
- non-null timestamp: the reminder has already been sent

This field is enough to express both state and audit time. A separate boolean is unnecessary.

## Selection Rules

The cron job only considers service orders where:

- `status = CONFIRMED`
- `deletedAt IS NULL`
- `orderStartNotificationSentAt IS NULL`
- `timeAt <= now + orderStartNotificationMinutes`

Notes:
- The job does not scan `PROCESSING`, `COMPLETED_*`, `CANCELED`, or waiting statuses.
- `orderStartNotificationMinutes = 0` means notify once the start time is due or already passed.

## Recipients

Recipients are built from:

- all admin user ids
- the user linked to `serviceOrder.employeeId`
- the user linked to `branch.employeeId` for `serviceOrder.branchId`

Recipient rules:
- Ignore null or missing links
- Deduplicate user ids before sending
- Reuse `NotificationService.createNotificationForMultipleUsers(...)`
- Send Firebase push using the same recipient set

Interpretation of "quản lý chi nhánh của đơn":
- Use `Branch.employeeId` as the branch manager source, consistent with existing repo behavior

## Notification Behavior

Notification payload should follow current service-order conventions:

- `type = NotificationTypeEnum.SYSTEM`
- `objectId = serviceOrder.id`
- metadata includes at least:
  - `serviceOrderId`
  - `event = "SERVICE_ORDER_START_REMINDER"`
  - `timeAt`

Suggested content:
- Title: `Đơn dịch vụ sắp đến giờ bắt đầu`
- Content: mention the service order code and start time

Exact wording can stay concise and consistent with current repo style.

## Reset Rules

When admin updates a service order:

- if `timeAt` changes, set `orderStartNotificationSentAt = null`

This applies even if the previous reminder had already been sent.

Non-goals for reset:
- No extra reset is required when unrelated fields change
- No special replay mechanism is needed; the cron job will pick the record up again naturally if it re-enters the window while still `CONFIRMED`

## Execution Flow

1. Cron runs every minute in `src/index.ts`
2. Job resolves `AppSettingRepository` and reads `orderStartNotificationMinutes`
3. Job exits early if already processing a previous run
4. Job queries matching `ServiceOrder` rows with required ids/fields
5. For each row:
   - resolve recipient user ids
   - create notifications
   - send Firebase push
   - update `orderStartNotificationSentAt` to the current time
6. Log errors but keep the job alive for future runs

## Concurrency / Safety

Use the same in-memory `isProcessing` guard pattern as the existing assignment-timeout job.

Additionally, guard the per-row update so duplicate sends are avoided during overlapping edge cases:
- update `orderStartNotificationSentAt` only when it is still `NULL`
- if needed, structure the query/update so a row already marked by another path is skipped

This keeps the implementation aligned with the current repo’s pragmatic cron style without introducing a distributed locking system.

## Files Expected To Change

- `src/database/models/ServiceOrder.ts`
- new migration under `src/database/migrations/`
- `src/modules/serviceOrder/serviceOrder.select.ts` if API payloads should expose the new field
- `src/modules/serviceOrder/admin.serviceOrder.service.ts` to reset sent state when `timeAt` changes
- new job file under `src/queue/jobs/`
- `src/index.ts` to start the new job
- new targeted specs for the service-order update reset and job/helper behavior

## Testing Plan

Follow TDD:

1. Add a failing spec that proves changing `timeAt` resets `orderStartNotificationSentAt` to `null`
2. Add a failing spec for the new reminder job/helper:
   - only `CONFIRMED` rows are considered
   - recipients are admin + assigned employee + branch manager
   - duplicates are removed
   - the row is marked sent after success
3. Implement the smallest code to pass
4. Run targeted Jest specs
5. Run `npm run build` for `BE`

## Risks / Edge Cases

- Existing unrelated build/test noise may still exist in this repo; verification should report that separately.
- A confirmed service order without `employeeId` or without `branch.employeeId` should still notify admins.
- If `orderStartNotificationMinutes` is missing or zero, the repository fallback should effectively make the job notify at or after `timeAt`.

## Acceptance Criteria

- Every minute, backend checks only `CONFIRMED` service orders
- Orders within the configured reminder window receive one reminder
- Reminder is sent to admins, assigned employee, and branch manager
- After successful send, the order is marked as already notified
- If admin changes `timeAt`, the notified marker resets to not sent
- The cron job can then notify again for the updated time
