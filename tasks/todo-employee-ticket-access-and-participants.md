# Checklist: EmployeeTicket access và participants

## Phase 1: Permission contract

- [ ] Tách global management access thành ADMIN hoặc MANAGER có `employeeTicket.read`.
- [ ] Quy định `employeeTicket.update` cho management write/status.
- [ ] Giữ owner access cho employee mobile.
- [ ] Viết focused tests cho ADMIN/MANAGER/EMPLOYEE/inactive.

## Phase 2: Participant schema

- [ ] Tạo `EmployeeTicketParticipant` entity và relation.
- [ ] Tạo migration `employee_ticket_participants`.
- [ ] Thêm FK, partial unique index và lookup indexes.
- [ ] Đăng ký entity/container/repository.

## Checkpoint 1

- [ ] Migration/schema review.
- [ ] BE build và permission tests pass.

## Phase 3: Participant API

- [ ] Candidate API cho user nội bộ active.
- [ ] GET participant list.
- [ ] POST batch add idempotent.
- [ ] DELETE participant soft-delete có actor audit.
- [ ] Notification cho participant mới.

## Phase 4: ACL integration

- [ ] Owner/participant/global manager policy cho list/detail/replies.
- [ ] Participant được reply nhưng không được status/close.
- [ ] Reply notification gửi union owner + participant + manager, dedupe và exclude actor.
- [ ] Direct-by-ID authorization tests.

## Checkpoint 2

- [ ] Admin add → participant nhận notification → mobile mở detail → reply.
- [ ] Admin remove → participant bị chặn.
- [ ] MANAGER có/không có permission cho kết quả đúng.

## Phase 5: Consumer integration

- [ ] Admin Web participant picker/list/add/remove.
- [ ] Cập nhật `employeeTicket.mobile-api.md`.
- [ ] Mobile contract test và deep-link test.
- [ ] Chạy BE/FE verification và ghi nhận baseline blocker nếu có.
