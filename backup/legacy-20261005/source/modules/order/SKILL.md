## Order module notes

## Xóa nhân viên khỏi hợp đồng

- `DELETE /orders/:orderId/employees/:id` lấy metadata `orderId`/`employeeId` trong transaction, thực hiện xóa và các hook liên quan, rồi sau commit gửi `ALERT` tới tài khoản của nhân viên bị xóa. Lỗi gửi notification chỉ được log và không làm thay đổi kết quả xóa.

## Xóa Order

- `OrderRepository.delete()` dọn các bản ghi `call_navigations` theo `orderId` trước khi gọi hard-delete Order. Query dùng cùng `EntityManager` của transaction để tránh lỗi FK khi database chưa cấu hình cascade.

## Hủy Order

- `OrderService.cancelOrder()` cập nhật `expiresAt` cho toàn bộ `CallNavigation` của Order qua `CallNavigationService.stopCallNavigationByOrder(orderId, manager)` trong cùng transaction; không chỉ cập nhật các navigation đang active.
- `CallNavigationService.stopCallNavigationByOrder()` phải truyền `EntityManager` cho cả truy vấn và cập nhật để không ghi ra ngoài transaction hủy Order.

## Thay đổi thời gian bắt đầu Order

- Khi `Order.timeAt` thực sự thay đổi, `OrderService.actionAfterUpdate()` đưa `branchManagerConfirmedStatus` về `PENDING`, xóa `branchManagerConfirmedAt` và đưa trạng thái của toàn bộ `OrderEmployee` chưa bị soft-delete về `PENDING` trước khi trả response.
- So sánh `timeAt` theo `getTime()` để không reset trạng thái khi request gửi lại cùng một thời điểm dưới dạng chuỗi khác nhau.
- Cảnh báo `ALERT` sau cập nhật gửi tới tài khoản của toàn bộ `OrderEmployee` và tài khoản liên kết với `Order.branchManagerId`, yêu cầu các bên vào xác nhận lại đơn; lỗi gửi cảnh báo không làm ảnh hưởng kết quả cập nhật.

## Check-in nhân viên trong OrderEmployee

- Check-in được lưu trực tiếp trên bản ghi `OrderEmployee` bằng `checkInAt`, `checkInLatitude` và `checkInLongitude`; không tạo bảng/module riêng.
- `POST /orders/:id/check-in` lấy `employeeId` từ JWT, chỉ ghi sau khi hợp đồng đang `PROCESSING`, vị trí hợp lệ và nhân viên đã được gắn vào hợp đồng.
- `GET /orders/:id` lấy `employeeId` từ JWT, bổ sung `data.needCheckin = true` khi nhân viên có trong `OrderEmployee` nhưng `checkInAt` còn `null`; không có bản ghi hoặc đã check-in thì trả `false`.
- `OrderEmployeeService.checkIn()` chặn lần check-in thứ hai của cùng cặp `orderId + employeeId`; nhiều nhân viên trên cùng hợp đồng vẫn được check-in độc lập.

- `orderEmployee.validateBeforeCreate()` là hook chuẩn để gắn default dữ liệu khi tạo nhân viên cho hợp đồng qua nested route `/orders/:orderId/...`.
- Khi tạo `OrderEmployee`, nếu request không truyền `note` thì mặc định lấy `order.address.detail`; nếu đã có `note` thì giữ nguyên.

## employeeId vs branchManagerId (Order)

## Quyền xem danh sách Order của người tạo

- Người dùng không phải `ADMIN` và không có `viewAll` được xem các Order thỏa một trong các điều kiện: `Order.createdByEmployeeId` trùng `req.user.employeeId`, hoặc nhân viên đang đăng nhập được gắn trong `OrderEmployee`/`OrderLeader` theo scope hiện hành.
- Các điều kiện quyền phải được nhóm trong cùng một `Brackets` với phép `OR`; không dùng `qb.orWhere()` độc lập trước các `andWhere()` khác vì sẽ sai precedence SQL và có thể làm creator vẫn bị loại khỏi danh sách.
- ADMIN không bị giới hạn về `createdByEmployeeId`; các bộ lọc customer/employee/branch/status vẫn áp dụng độc lập sau nhóm quyền.

## Thông báo khi đổi thời gian bắt đầu Order

- Khi `PUT /orders/:id` thực sự thay đổi `Order.timeAt`, sau khi cập nhật thành công phải gửi notification `ALERT` tới các user có tài khoản liên kết với toàn bộ `OrderEmployee` active của Order.
- So sánh thời gian theo timestamp thực tế (`getTime()`), không so sánh trực tiếp chuỗi request với `Date` entity để tránh gửi thông báo khi giá trị không đổi.
- Lỗi notification chỉ được log, không làm thay đổi kết quả cập nhật Order; payload phải truyền `orderCode` để tiêu đề notification giữ prefix thống nhất.

Phân biệt rõ hai field trên `Order`:

| Field             | Nguồn                                                  | Cách set                                                                                                               |
| ----------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `employeeId`      | User tự chọn từ danh sách nhân viên                    | Truyền qua `req.body` lúc create / update                                                                              |
| `branchManagerId` | Mặc định từ `Branch.employeeId`, nhưng user có thể đổi | Flow confirm của service order truyền explicit qua `req.body`; một số flow update cũ vẫn có thể re-sync theo chi nhánh |

**Quy tắc:**

- `employeeId` KHÔNG bị override khi đổi `branchId`. Khi user đổi chi nhánh của Order, `employeeId` giữ nguyên (do user đã chọn).
- Ở flow xác nhận service order -> order, `branchManagerId` là field riêng, bắt buộc chọn, được default từ `Branch.employeeId` nhưng lưu theo giá trị user chọn.
- `orderLeader` khởi tạo ban đầu phải đi theo `branchManagerId` đã chọn trong flow confirm, không đi theo `Branch.employeeId`.
- Khi đổi `branchId`, `actionAfterUpdate` đồng thời:
  1. `syncBranchManagerOrderLeader` — cập nhật bảng `order_leaders` cho manager mới (giữ logic cũ).
  2. Re-sync `Order.branchManagerId` theo manager chi nhánh mới qua `orderRepository.update`.
- Block cũ trong `actionAfterUpdate` override `employeeId = branch.employeeId` đã được bỏ — vì conflict với nghiệp vụ hiện tại (user tự chọn nhân viên phụ trách).
- `BaseService.create()` phải luôn gọi `actionAfterCreate()` bằng entity vừa lưu (`fullData || dataRes`). Không được bỏ qua hook chỉ vì `repository.findById(..., req)` bị filter quyền; riêng Order, query của quản lý chi nhánh chưa thấy đơn mới trước khi `OrderLeader` được tạo.

## Hoàn thành hợp đồng

- Test hồi quy của `POST /orders/:id/complete` nằm tại `tests/order.complete.spec.ts`; test cô lập Firebase và DI container, đồng thời khóa query count ở một query cho bộ 100 nhân viên.
- Luồng hoàn thành phải dùng bulk operation cho danh sách nhân viên, không quay lại `find + save(array)` hoặc vòng lặp query theo từng nhân viên.
- `OrderEmployeeRepository.completeEmployeesForOrder()` dùng một data-modifying CTE để cập nhật `order_employees`, đồng bộ `time_keepings`, tính `totalHours` và trả về danh sách `employeeId`.
- Kiểm tra lương dùng `hasEmployeesWithoutSalary()` với điều kiện `salary IS NULL OR salary <= 0`.
- Các bước cập nhật `Order` trong `completeOrder()` và `CalculateOrderData.process()` phải dùng `orderRepository.getRepository(manager).update()` trực tiếp. Không dùng `BaseRepository.update()` vì method này reload Order cùng các eager one-to-many relations, tạo tích Descartes và có thể làm Node OOM với hợp đồng nhiều nhân viên/comment/leader.
- Công nợ chỉ tạo khi chưa tồn tại; reward point `EARNED` được tìm theo `orderId + type` rồi mới create/update để retry/concurrency không sinh thêm bản ghi trong transaction đã khóa Order.
- `OrderService.notifyOrderCompleted()` chỉ chạy sau commit. Controller dùng `Promise.allSettled` cho notification và dừng tracking; lỗi side effect được log nhưng không đổi response thành lỗi sau khi hợp đồng đã commit.
- Không gọi trực tiếp `FirebaseUtils` sau `NotificationService.createNotificationForMultipleUsers()`, vì NotificationService đã phụ trách gửi push notification.

## Nhân viên đầu cánh xác nhận hoàn thành

- `POST /orders/:id/confirm-completion` không nhận dữ liệu từ body; lấy `employeeId` từ JWT và chỉ cho phép khi bản ghi `OrderEmployee` của đơn có `isLeader = true`, đồng thời Order đang `PROCESSING`.
- Xác nhận ghi `completedByEmployeeId` và `completedAt`, nhưng không tự đổi Order sang `COMPLETED`; quản lý vẫn dùng luồng duyệt hoàn thành riêng.
- Nếu cùng đầu cánh gửi lại, API trả thành công idempotent và không phát thông báo lặp; đầu cánh khác bị từ chối.
- Trước khi xác nhận, `OrderService.confirmOrderCompletion()` yêu cầu mọi `OrderEmployee` active có `status = CONFIRMED` phải có `checkOutAt`; kiểm tra bằng `EXISTS` trong `OrderEmployeeRepository`.
- Sau khi transaction commit, `OrderController` gọi `notifyOrderCompletionConfirmed()`; thông báo `Đơn hoàn thành chờ duyệt` gửi tới toàn bộ ADMIN, User liên kết với mọi `OrderLeader` và User liên kết với `Order.createdByEmployeeId`, được khử trùng và kèm `orderCode`.
- `OrderService.completeOrder()` chỉ bỏ qua yêu cầu xác nhận đầu cánh cho ADMIN; các role khác phải có đủ `completedByEmployeeId` và `completedAt` trước khi chuyển Order sang `COMPLETED`.
- Migration `1780100000000-AddOrderCompletionConfirmationFields.ts` tạo cột, FK `completedByEmployeeId -> employees.id` (`SET NULL`) và timestamp. Trường/quan hệ này phải có trong `OrderSelectBasic`, `OrderSelectFull`, `OrderRelations`.

## OrderLeaderChat

- `OrderLeaderChat` là phòng chat riêng của đơn hàng dành cho `ADMIN`, thành viên có bản ghi `OrderLeader` đang active hoặc nhân viên trùng `Order.createdByEmployeeId` của đơn hàng. `MANAGER` không được truy cập chỉ dựa trên role.
- Phòng chat dùng route `/orders/:orderId/leader-chat`, socket event riêng `order-leader-chat:*`, không dùng `ViewComment` và không tham gia generic `join-room` của chat chung.
- Trạng thái đã đọc lưu tại `order_leader_chat_read_states` theo `orderId + userId`; checkpoint là `lastReadMessageId`. Khi so sánh phải dùng cặp `(timeAt, id)` vì id UUID không thể hiện thứ tự thời gian.
- Khi đổi schema/model hoặc API của module này, cập nhật đồng thời migration, service authorization và contract FE `LeaderChat`.

## OrderComment — read state thay cho ViewComment

- Chat chung của Order nhận thành viên từ cả `OrderEmployee` và `OrderLeader` (kèm ADMIN); user mention dùng `User.id` tương ứng với employee thuộc một trong hai nhóm.
- `GET /orders/:orderId/comments/participants` là nguồn duy nhất cho FE lấy danh sách tag; response gồm nhân viên thuộc assignment chưa soft-delete và có User, cùng nhân viên tạo đơn từ `Order.createdByEmployeeId` nếu có User (`userId`, `employeeId`, `name`, `zaloName`), loại trùng nếu cùng người nằm ở nhiều nguồn.
- Khi comment có tag, notification gửi tới user được tag dùng tiêu đề `[Order.code] bạn có tin nhắn mới` và nội dung `${Người gửi} đã nhắc đến bạn trong hợp đồng ${Order.name}`; user không được tag vẫn theo luồng CHAT hiện hữu.
- Với user có role `EMPLOYEE`, danh sách `OrderComment` của các Order có `timeAt` trước `04/09/2026 00:00` (múi giờ `+07:00`) được lọc bằng điều kiện rỗng và trả `data = []`; role khác và Order từ đúng ngày này trở đi không bị ảnh hưởng.

- **Đã thay thế bảng `view_comments`** (1 dòng/comment/user + cờ `isViewed`) bằng `order_comment_read_states` (checkpoint 1 dòng/order/user, cột `lastReadCommentId`) — migration `1779500000000-CreateOrderCommentReadStates.ts` (backfill dữ liệu cũ rồi drop `view_comments`).
- Backfill của migration `1779500000000-CreateOrderCommentReadStates.ts` phải idempotent: dùng `ON CONFLICT (orderId, userId) DO NOTHING` để chạy tiếp an toàn khi bảng/checkpoint đã tồn tại sau lần chạy dở dang.
- Lý do: thiết kế cũ gây write amplification (tạo 1 comment → insert N dòng view_comments cho N user), `countUnreadComments` join bảng lớn và có bug logic (`innerJoin` + `OR id IS NULL` khiến comment không có viewComment row — user online — không bao giờ được đếm).
- `actionAfterCreate` của `OrderCommentService` không còn tạo viewComments; unread count giờ = đếm comment có `(timeAt, id)` lớn hơn checkpoint của user (index `IDX_order_comments_active_order_time_id` trên `(orderId, timeAt, id)` WHERE `deletedAt IS NULL`).
- `markCommentsAsViewed(orderId, userId, commentId?)` upsert checkpoint; nếu không truyền `commentId` thì lấy comment mới nhất của order (mark all). `POST /orders/:orderId/comments/mark-as-viewed` nhận body `{ commentId? }` (Zod `MarkCommentsAsViewedSchema`), trả `{ lastReadCommentId, unreadCount }`.
- FE: `order/markViewed` payload là `{ orderId, commentId? }`; DetailPage gọi mark-as-viewed khi `activeTab === "chat"` và `unreadCount > 0` (effect phụ thuộc `[id, activeTab, unreadCount]`); `markViewedSuccess` cập nhật `state.unreadCount` từ response.
- Module `viewComment/` (repository/service/controller/route/container) và entity `ViewComment` đã bị xóa; khi xóa Order, `cleanupReferencesBeforeDelete` dọn `order_comment_read_states` theo `orderId`.

## Bug: badge unread "Hoạt động" kẹt ở 1

- **Nguyên nhân chính (BE — đã fix):** `OrderCommentRepository.countUnreadComments` trước đây đọc `anchor.timeAt` qua entity (JS `Date`) rồi bind lại làm tham số so sánh. Cột `timeAt` là `timestamptz(6)` (microsecond) nhưng JS Date chỉ giữ millisecond → phần microsecond bị cắt (vd `.131364` → `.131Z`) → **chính comment anchor bị đếm là "mới hơn" checkpoint** → unread luôn ≥ 1 dù đã đọc hết. Sửa: so sánh tuple ngay trong SQL bằng row constructor `(oc."timeAt", oc.id) > (SELECT a."timeAt", a.id FROM order_comments a WHERE a.id = $2 AND a."orderId" = $1)` — không đưa `timeAt` qua JS. Nếu anchor không tồn tại → đếm toàn bộ comment của order. **Quy tắc: mọi so sánh `(timeAt, id)` phải diễn ra trong SQL (cột DB với cột DB), KHÔNG đọc timeAt qua entity rồi bind lại.**
- **Nguyên nhân phụ 1 (FE):** `mark-as-viewed` trước đây chỉ chạy khi `activeTab` đổi và đọc qua `unreadCountRef` (ref không kích hoạt re-render) → comment mới đến sau lần mark không được mark lại. Sửa: tách effect mark riêng phụ thuộc `[id, activeTab, unreadCount]`, gọi `markOrderViewed` mỗi khi `activeTab === "chat"` và `unreadCount > 0` (BE mark idempotent — tự chọn comment mới nhất khi không truyền commentId).
- **Nguyên nhân phụ 2 (BE):** đầu `actionAfterCreate` có `if (targetUsers.length === 0) return;` → bỏ qua broadcast `chat-message` khi không có thành viên cần notify → user online trong room không nhận socket → badge không cập nhật. Sửa: bỏ `return` sớm; broadcast luôn chạy, các khối notification bên dưới đều có guard riêng (`length > 0`).
- DetailPage lắng nghe cả socket `new-comment` (offline push) lẫn `chat-message` (broadcast room) để `getCount(id)`; gọi `getCount` mỗi khi vào tab chat.
- Lưu ý: comment hệ thống (userId null, vd "Nhân viên X đã được thêm vào hợp đồng") vẫn được tạo qua `orderCommentService.create()` nên đi qua `actionAfterCreate` → vẫn broadcast + đếm unread đúng.
- ⚠️ Cùng pattern lỗi (JS Date round-trip) còn tồn tại ở `OrderLeaderChatRepository.countUnread` (`orderLeaderChat.repository.ts`) — chưa sửa, cần xử lý riêng.

## unreadCommentCount trên danh sách Order

- `OrderRepository.extendQueryBuilder` thêm alias `unreadCommentCount` (addSelect subquery tương quan) cho **danh sách** Order: đếm `order_comments` có `(timeAt, id)` sau checkpoint `order_comment_read_states` của user đang đăng nhập; user chưa có checkpoint → đếm toàn bộ comment của order là chưa đọc.
- Subquery join `order_comment_read_states` (alias `rsc`, theo `orderId + userId`) + `order_comments` (alias `anchor`, theo `lastReadCommentId`); điều kiện chưa đọc = `rsc."lastReadCommentId" IS NULL OR oc."timeAt" > anchor."timeAt" OR (bằng timeAt và id > anchor.id)` — dùng `Brackets` để nhóm OR.
- Không khai báo field `unreadCommentCount` trong class `Order` (giữ comment): `mapRawEntities` chỉ map alias addSelect không có underscore vào `extras` nếu field chưa tồn tại trong entity; khai báo field sẽ bị `useDefineForClassFields` (target es2022) define `undefined` → extras bị bỏ qua.
- FE: cột "Chưa đọc" trong `OrderTable.tsx` hiển thị `Badge` với icon message khi `unreadCommentCount > 0`, ẩn trên summary row (`isSummary`).

## Tính lại dữ liệu tiền hợp đồng

- `CalculateOrderData.process()` chỉ tính đồng bộ `preVatAmount`, `discountAmount`, `vatAmount`, `amount`, `isPaid`, sau đó tăng `Order.calculationVersion` trong cùng transaction.
- Dispatcher chạy mỗi 2 giây, enqueue một job ID cố định theo `orderId`; Bull không cho hai version của cùng hợp đồng chạy song song.
- Worker chốt version trước khi gọi `processRelatedData()` và cập nhật `calculatedVersion` bằng `GREATEST`; không giữ khóa ghi trên Order suốt tác vụ nặng.
- Queue runtime phải dùng Bull 3.x, đồng bộ với `@types/bull` và API named job/processor của `BaseQueue`; Bull 1.x không đọc đúng `redis.password` và gây `NOAUTH`.
- Query dispatcher dùng alias `pending_order`; không dùng `order` vì đây là từ khóa PostgreSQL và raw condition sẽ lỗi `42601` nếu alias không được quote.
- Job retry tối đa 3 lần với exponential backoff. Bull Promise timeout bị tắt cho queue này; transaction worker tự đặt `lock_timeout = 10s`, `statement_timeout = 90s` và `idle_in_transaction_session_timeout = 90s` để lỗi DB luôn rollback trước khi job failed. Job failed cùng version chỉ được requeue sau cooldown 60 giây.
- `CalculateOrderData` không được dùng `OrderRepository.findById()` vì JOIN nhiều relation one-to-many có thể gây OOM; query tính tổng phải giữ `loadEagerRelations: false`.
- Đồng bộ `Finance.customerId` dùng một bulk update. Phiếu đặt cọc đã có phải cập nhật bằng `FinanceRepository.update()` để tránh vòng gọi ngược service.
- Với Order `COMPLETED`, `processRelatedData()` tìm `OrderLeader` theo `orderId` và vị trí `BRANCH_MANAGER`, rồi tạo hoặc đối soát một `TimeKeeping` cho `employeeId` của leader; số tiền là `amount * allocateRevenuePercent / 100`, loại `ALLOCATED_REVENUE_ORDER` và khóa liên kết `referrerOrderId`. Không đánh dấu `hasAllocatedRevenue` ở bước này vì đây là cờ đã thanh toán.
- Logic chia sẻ doanh thu kiểm tra `hasAllocatedRevenue` trước, sau đó vẫn double-check `TimeKeeping` khi cờ chưa bật để hỗ trợ dữ liệu cũ hoặc retry; migration `1779100000000-AddOrderAllocatedRevenueTracking.ts` bổ sung cột Order và enum PostgreSQL.
- Với Order `COMPLETED`, phần thưởng `referrerId` và `createdByEmployeeId` cũng được lấy trực tiếp từ Order, không query nhân viên trung gian; số tiền lần lượt là `amount * referrerPercent / 100` và `amount * createdByEmployeePercent / 100`, lưu bằng `REFERRER_ORDER` và `CREATE_ORDER`. Mỗi loại có cờ đã trả riêng (`isReferrerPaid`, `isPaidForEmployeeCreateOrder`) và đối soát `TimeKeeping` theo `referrerOrderId + otherAmountType`.
- Các loại `REFERRER_ORDER`, `CREATE_ORDER`, `ALLOCATED_REVENUE_ORDER` được xếp vào nhóm thưởng khi tổng hợp bảng lương; job referral cũ phải lọc đúng `REFERRER_ORDER` để không cập nhật nhầm dòng phân bổ doanh thu.
- Trong `processRelatedData()`, mọi thao tác ghi và truy vấn file phát sinh từ `BaseRepository` phải dùng cùng `manager` của transaction worker. Không được insert `TimeKeeping` bằng transaction rồi query/update qua repository mặc định; FK `TimeKeeping.referrerOrderId` có thể giữ khóa trên `Order` và tạo vòng chờ đến timeout. Các cờ `isReferrerPaid`/`isPaidForEmployeeCreateOrder`/`hasAllocatedRevenue` chỉ cập nhật khi chốt phiếu lương.
- Deploy bắt buộc chạy migration `1778500000000-AddOrderCalculationVersions.ts` và chạy cả API lẫn `yarn worker`.
- Test hồi quy: `src/modules/order/handles/tests/calculate.order.spec.ts`.

## Nhân viên tạo đơn và thưởng tạo đơn

- `Order.createdByEmployeeId` luôn lấy từ `req.user.employeeId`, không nhận từ body; `createdByEmployeePercent` mặc định lấy từ `AppSetting.order.accountantRevenueShare`.
- Chỉ ADMIN hoặc request đã có `req.user.permissionAdvance` mới được override phần trăm thưởng khi tạo hợp đồng; `isPaidForEmployeeCreateOrder` luôn khởi tạo `false`.
- `OrderSelectFull` phải hydrate `createdByEmployee`; migration `1778900000000-AddOrderCreatorRewardFields.ts` tạo ba cột mới và FK tới `employees`.

## Phần trăm phân bổ doanh thu theo hợp đồng

- `Order.allocateRevenuePercent` lấy mặc định từ `AppSetting.order.branchManagerRevenueShare` khi tạo; client có thể override trong khoảng 0-100.
- Create/Update schema và `OrderSelectBasic` phải giữ field này để form tạo/sửa và chi tiết dùng cùng contract.
- Migration `1779000000000-AddAllocateRevenuePercentToOrders.ts` tạo cột nullable; không tự thay đổi `OrderLeader.revenueShare` trong flow này vì công thức phân bổ kỳ nằm ở `allocateRevenue`.

## Gọi khách hàng qua Stringee

- `POST /orders/:id/make-call-to-customer` đi qua `OrderController.makeCallToCustomer()`, dùng transaction manager khi gọi `OrderService.makeCallToCustomer()` và yêu cầu quyền `order.read`.

## Thông báo Zalo cho Order

- `OrderController.create()` gọi `OrderService.notifyOrderCreatedViaZalo()` sau khi transaction tạo đơn commit; side effect được chạy bất đồng bộ để response tạo đơn không phải chờ Zalo. `completeOrder()` gọi `notifyOrderCompletedViaZalo()` cùng nhóm side effect sau commit.
- Payload dùng template `ZaloTemplateTypeEnum.CREATE`/`COMPLETE_AND_VOTE`, lấy số điện thoại và tên từ `Order.customer`; không có số điện thoại thì bỏ qua.
- Lỗi gửi Zalo chỉ được log qua `Promise.allSettled`, không rollback, đổi response hoặc chặn response của thao tác Order đã commit.
- Khi gửi Zalo cho Order, truyền `orderId`/`customerId` vào `ZaloService.sendMessage()` để cả kết quả thành công và thất bại đều được lưu vào `ZaloMessageHistory`.
- `ZaloTemplate` dùng default `CREATE`, đồng bộ với enum hiện tại (enum không còn giá trị `BOOK`).
- Danh sách Order thêm field dẫn xuất `latestZaloMessage` từ lịch sử Zalo gần nhất; FE dùng `id` của bản ghi này để gọi endpoint resend khi trạng thái gửi lỗi.

## Comment mới nhất theo hợp đồng (latestComment)

- `latestComment` là field dẫn xuất trên **danh sách** Order (mobile hiển thị tin nhắn mới nhất ở màn danh sách hợp đồng).
- **Không dùng subquery tương quan** trong `extendQueryBuilder` nữa. Subquery cũ (`order_comments` + `json_build_object` + `leftJoin users`, `ORDER BY createdAt DESC LIMIT 1`) chạy lặp theo từng raw row vì list query `leftJoin` 3 relation one-to-many (`details` × `orderEmployees` × `orderLeaders`) nhân dòng ~7× → rất chậm.
- Cách mới: override `findWithPagination` → sau `super.findWithPagination` gọi `enrichLatestComments` → `getLatestCommentByOrderIds` chạy **1 query `DISTINCT ON (orderId)`** cho đúng 20 orderId đã phân trang, rồi merge vào JS. `json_build_object` (bao gồm nested `user`) giữ nguyên cấu trúc cũ để mobile không đổi contract.
- Query batch dùng `ANY($1::uuid[])` trong `manager.query` (alias quote `"latestComment"`/`"orderId"` để giữ đúng camelCase, tránh bẫy key lowercase của pg — xem memory `typeorm-getrawmany-lowercase-keys`).
- ⚠️ **Behavior change**: `latestComment` chỉ còn có ở list (`findWithPagination`). `findById` (detail) và `findByOptions` không còn trả `latestComment` — detail lấy comment qua endpoint riêng `/orders/:orderId/comments`.
- `OrderComment` khai báo metadata index `IDX_order_comments_active_order_created` trên `orderId + createdAt`, lọc `deletedAt IS NULL`, đồng bộ với migration `1778300000000-AddOrderListChildIndexes`.

## Đơn gấp (isUrgent)

- `Order.isUrgent` là trường boolean (mặc định `false`) dùng để đánh dấu đơn hàng cần xử lý ngay.
- Migration: `1779400000000-AddIsUrgentToOrders.ts` thêm cột `isUrgent` vào bảng `orders`.
- BE validator: `CreateOrderSchema` và `UpdateOrderSchema` đều có `isUrgent: z.boolean().optional()`.
- FE model: `IOrder.isUrgent?: boolean`.
- Form thêm mới (`AddPage/BaseInfo.tsx`): dùng `Switch` với `checkedChildren="Gấp"` / `unCheckedChildren="Bình thường"`.
- Trang chi tiết (`DetailPage.tsx`): hiển thị `Switch` để toggle (chỉ ADMIN/user có permission `order.update`), disabled khi đơn đã thanh toán (`isPaid`).

## Comment khi thay đổi isUrgent

- Khi update Order và trường `isUrgent` có sự thay đổi, `actionAfterUpdate` trong `OrderService` sẽ tạo comment tự động:
  - `isUrgent: true → false`: `"Loại đơn: Đơn gấp -> Đơn thường"`
  - `isUrgent: false → true`: `"Loại đơn: Đơn thường -> Đơn gấp"`
- Comment được gắn vào nội dung chung: `"Hợp đồng đã có thay đổi:\n   Loại đơn: ..."`
- Logic nằm trong switch case `isUrgent` của `actionAfterUpdate` (order.service.ts).
- ⚠️ **Quan trọng**: Trường `isUrgent` phải được thêm vào `OrderSelectBasic` (order.select.ts) để `findById` trả về đúng giá trị. Nếu không, `dataOld.isUrgent` sẽ là `undefined` → luôn hiển thị "Đơn thường".

## Job cảnh báo nhân viên chưa checkin

- **File**: `BE/src/queue/jobs/orderCheckinNotification.job.ts`
- **Cron**: Chạy mỗi 3 phút (`0 */3 * * * *`, timezone `Asia/Ho_Chi_Minh`)
- **Logic**:
  1. Trong entity hiện tại, `Order.timeAt` là thời điểm bắt đầu thực hiện tương đương `order.startAt` trong nghiệp vụ.
  2. Lấy Order có status `PENDING` hoặc `PROCESSING` và `timeAt <= now + 20 phút`.
  3. Lấy các `OrderEmployee` active có `status = CONFIRMED` và `checkInAt IS NULL` (dùng TypeORM `IsNull()` để không bị bỏ qua điều kiện `null`); loại `PENDING/REJECTED`, không dùng `hasNotifiedCheckIn` vì cảnh báo phải lặp lại.
  4. Gửi notification type `ALERT` riêng tới các user liên kết với từng `OrderEmployee` chưa check-in, nhắc nhân viên thực hiện sớm.
  5. Gửi notification type `ALERT` tới toàn bộ Admin, Quản lý chi nhánh và người tạo đơn (`createdByEmployeeId`), khử trùng user ID.
  6. Job tiếp tục nhắc mỗi 3 phút cho tới khi nhân viên check-in đủ hoặc Order rời trạng thái active.
- **Field legacy**: `OrderEmployee.hasNotifiedCheckIn` vẫn tồn tại để tương thích dữ liệu cũ, nhưng job không dùng field này để lọc hay đánh dấu vì cảnh báo phải lặp lại.
- **Notification gửi tới**: Tất cả Admin + Branch Manager + người tạo đơn của đơn hàng
- **Đăng ký**: Import và gọi `JobOrderCheckinNotification.start()` trong `BE/src/index.ts`

## Tiêu đề notification theo mã đơn hàng

- Các notification gắn với `Order` phải truyền `orderCode` để tiêu đề có dạng `[order.code]: tiêu đề`.
- Luồng cập nhật trạng thái đơn, check-in cảnh báo, comment/mention và chat quản lý dùng chung quy tắc này cho DB, socket và Firebase.
- Firebase trực tiếp từ `OrderCommentService` cũng phải truyền `orderCode`; không lấy mã từ `objectId` hoặc dữ liệu phía client.

## Job cảnh báo thiếu nhân sự hợp đồng

- **File**: `BE/src/queue/jobs/orderEmployeeShortageNotification.job.ts`
- **Cron**: Chạy mỗi 5 phút (`0 */5 * * * *`, timezone `Asia/Ho_Chi_Minh`).
- Job lọc hợp đồng `OrderStatusEnum.PENDING` đã được quản lý xác nhận nhận đơn (`branchManagerConfirmedStatus = CONFIRMED`) có `timeAt - hiện tại <= 2 giờ`, đếm `order_employees` chưa soft-delete và chỉ cảnh báo khi số đã gán nhỏ hơn `Order.employeeCount`.
- Notification type là `ALERT`, gửi tới toàn bộ user ADMIN và user liên kết với `Order.branchManagerId`; truyền `orderCode` để tiêu đề có dạng `[order.code]: Sắp xếp nhân sự hợp đồng`.
- Không lưu cờ đã gửi: mỗi lần cron chạy vẫn gửi lại khi hợp đồng còn thiếu nhân sự; khi số nhân sự đủ hoặc thừa, query không còn trả hợp đồng đó.
- Query phải tính `cutoff = now + 2 giờ` thành `Date` rồi bind trực tiếp với `timeAt <= :cutoff`; không dùng `:now + INTERVAL` vì PostgreSQL có thể phân giải sai thành phép so sánh `timestamptz <= interval` (`42883`).

## Job cảnh báo đầu cánh chưa gọi xác nhận khách hàng

- **File**: `BE/src/queue/jobs/orderEmployeeCallConfirmationNotification.job.ts`
- **Cron**: Chạy mỗi 10 phút (`0 */10 * * * *`, timezone `Asia/Ho_Chi_Minh`).
- Job chỉ lấy Order đang `PENDING`, có `OrderEmployee` active với `isLeader = true`, và không có `CallNavigation` active cùng `orderId` với `callId IS NOT NULL`.
- Notification type là `ALERT`, gửi tới User của toàn bộ nhân viên đầu cánh thuộc chính Order đó, toàn bộ user ADMIN và user liên kết với `Order.branchManagerId`; các user trùng chỉ nhận một notification. Tiêu đề là `Chưa gọi xác nhận khách hàng`, nội dung yêu cầu nhanh chóng gọi cho khách hàng để xác nhận thông tin, và truyền `orderCode` để prefix `[order.code]:` được tạo thống nhất.
- Không lưu cờ đã gửi; các lần chạy tiếp theo tiếp tục cảnh báo khi Order vẫn thỏa điều kiện.

## Quy tắc truy vấn codebase

- ⚠️ **LUÔN sử dụng CodeGraph** cho mọi thao tác khám phá codebase: `codegraph_search`, `codegraph_explore`, `codegraph_trace`, `codegraph_impact`, `codegraph_node`, `codegraph_callers`, `codegraph_callees`.
- Chỉ dùng `grep`/`glob`/`read` khi CodeGraph không khả dụng hoặc không trả về kết quả.
- CodeGraph cho phép hiểu nhanh kiến trúc, call graph, dependency — không đọc file ngẫu nhiên để tìm code.

## Trạng thái phản hồi nhận hợp đồng của nhân viên

- `OrderEmployee.status` dùng `OrderEmployeeStatusEnum`: `PENDING` (mặc định), `CONFIRMED`, `REJECTED`; migration `1780200000000-AddStatusToOrderEmployees.ts` tạo PostgreSQL enum và cột mặc định `PENDING`.
- Nhân viên chỉ phản hồi bản ghi của chính mình khi trạng thái còn `PENDING`: `POST /orders/:orderId/employees/:id/confirm` hoặc `POST /orders/:orderId/employees/:id/reject`. Service lấy `employeeId` từ JWT và lọc đồng thời `id + orderId + employeeId`.
- `PUT /orders/:orderId/employees/:id/status` dành cho `ADMIN` hoặc nhân viên tồn tại trong `OrderLeader` của đúng hợp đồng; không dựa vào FE/permission màn hình để quyết định quyền này.
- Sau một thay đổi thật sự, controller gửi notification hậu commit (lỗi notify chỉ log) tới toàn bộ ADMIN và các `OrderLeader` có tài khoản; tiêu đề được prefix bởi `order.code`. Gửi lại cùng trạng thái không tạo notification trùng.
- FE tab Nhân viên (`Salary.tsx`) hiển thị Tag trạng thái. Chỉ admin/quản lý của Order được click Tag; dropdown chỉ chứa hai trạng thái còn lại và gọi endpoint status chuyên biệt.

## Nhân viên đầu cánh và quản lý điều hành

- Không dùng `Order.employeeId` hoặc relation `Order.employee` nữa. Nhân viên đầu cánh là các bản ghi `OrderEmployee` có `isLeader = true`; một hợp đồng có thể có nhiều nhân viên đầu cánh.
- `OrderLeader` chỉ là quản lý điều hành. Không được tạo, cập nhật `isLeader` hoặc xóa `OrderEmployee` khi đồng bộ `OrderLeader`, và ngược lại.
- Migration `1780300000000-RemoveEmployeeFromOrders.ts` backfill `orders.employeeId` cũ sang `order_employees` (ưu tiên bản ghi active có sẵn, nếu chưa có thì tạo mới với `isLeader = true`) rồi mới drop cột. Down migration chỉ khôi phục nhân viên đầu cánh đầu tiên theo `createdAt`.
- Tất cả lọc danh sách nhân viên của hợp đồng, map xử lý đơn, theo dõi vị trí và chat đơn dịch vụ lấy nhân viên thực hiện từ `OrderEmployee`; quyền quản lý điều hành vẫn lấy từ `OrderLeader`.
- Khi Service Order tạo Order từ `payload.employeeId`, service phải tạo trực tiếp `OrderEmployee` với `isLeader = true` sau khi Order đã tồn tại, không được đưa field đó vào payload tạo `Order`.

## Quản lý chi nhánh xác nhận tiếp nhận hợp đồng

- `Order.branchManagerConfirmedStatus` dùng `BranchManagerConfirmStatusEnum`: `PENDING`, `CONFIRMED`, `REJECTED`; `branchManagerConfirmedAt` lưu thời điểm phản hồi gần nhất. Migration `1780400000000-AddBranchManagerConfirmationToOrders.ts` tạo enum PostgreSQL và hai cột.
- `POST /orders/:id/branch-manager/confirm` và `POST /orders/:id/branch-manager/reject` khóa Order trong transaction, chỉ cho phép ADMIN hoặc nhân viên trùng `Order.branchManagerId`. Gọi lại cùng trạng thái là idempotent; đổi trạng thái sẽ ghi lại `branchManagerConfirmedAt`.
- Controller gửi notification sau commit tới toàn bộ ADMIN và tài khoản liên kết với `Order.createdByEmployeeId`, có `orderId`, `orderCode`, `status` và event `ORDER_BRANCH_MANAGER_CONFIRMATION_UPDATED`; lỗi notification không làm fail response cập nhật.
- `OrderSelectBasic` phải chứa cả hai field để danh sách/detail hydrate đúng trạng thái xác nhận.
- Không thêm điều kiện raw `order."deletedAt"` trong query khóa xác nhận; TypeORM tự áp dụng soft-delete filter và alias `order` là từ khóa PostgreSQL nếu không được quote.

## Job nhắc quản lý chi nhánh xác nhận nhận đơn

- **File**: `BE/src/queue/jobs/orderBranchManagerConfirmationNotification.job.ts`
- **Cron**: Chạy mỗi 2 phút (`0 */2 * * * *`, timezone `Asia/Ho_Chi_Minh`).
- Job lọc Order chưa xóa có `status = PENDING` và `branchManagerConfirmedStatus = PENDING`.
- Notification type là `ALERT`. ADMIN nhận tiêu đề `Quản lý {tên Zalo quản lý chi nhánh} chưa xác nhận đơn hàng`; quản lý chi nhánh giữ tiêu đề `Yêu cầu xác nhận nhận đơn hàng` và nội dung yêu cầu đồng ý hoặc từ chối nhận đơn.
- Gửi thành hai notification riêng: một tới toàn bộ user `ADMIN`, một tới user liên kết với `Order.branchManagerId`; user trùng trong cùng nhóm chỉ nhận một notification.
- Không lưu cờ đã gửi: mỗi lần cron chạy vẫn nhắc lại khi quản lý chưa phản hồi. Job được đăng ký trong `src/index.ts`.

## Job nhắc nhân viên xác nhận tham gia hợp đồng

- **File**: `BE/src/queue/jobs/orderEmployeeConfirmationNotification.job.ts`
- **Cron**: Chạy mỗi 2 phút (`0 */2 * * * *`, timezone `Asia/Ho_Chi_Minh`).
- Job lọc Order chưa xóa có `status = PENDING`, `branchManagerConfirmedStatus = CONFIRMED` và các `OrderEmployee` active có `status = PENDING`.
- Gửi `ALERT` tới tài khoản của nhân viên pending với yêu cầu nhanh chóng xác nhận đồng ý hoặc từ chối tham gia hợp đồng.
- Gửi một notification tổng hợp `ALERT` tới toàn bộ ADMIN và user liên kết với `Order.branchManagerId`, kèm danh sách nhân viên pending để chủ động đôn đốc; user trùng chỉ nhận một notification.
- Không lưu cờ đã gửi: mỗi lần cron chạy vẫn nhắc lại khi các trạng thái còn pending. Job được đăng ký trong `src/index.ts`.

## Thời gian hoàn thành dự kiến và số điện thoại riêng của Order

- `Order.estimatedCompletionAt` lưu thời gian người dùng dự kiến hoàn thành đơn; nếu có giá trị thì phải sau `Order.timeAt`.
- `Order.customerPhone` lưu số điện thoại thay thế chỉ áp dụng cho hợp đồng này, không thay đổi `Customer.phone`.
- Migration `1780400000000-AddEstimatedCompletionAndCustomerPhoneToOrders.ts` tạo hai cột nullable để không ảnh hưởng dữ liệu Order hiện có.
- `CreateOrderSchema`/`UpdateOrderSchema` kiểm tra quan hệ giữa hai mốc thời gian khi cùng xuất hiện; `OrderService.validateBeforeUpdate` còn kiểm tra với `timeAt`/`estimatedCompletionAt` đang lưu khi chỉ cập nhật một field.
- Các luồng gửi Zalo, gọi khách hàng và xuất hóa đơn ưu tiên `customerPhone` của Order, sau đó mới dùng `Customer.phone` làm fallback.

## Checkout nhân viên trên hợp đồng

- `OrderEmployee.checkOutAt` là thời điểm nhân viên checkout thực tế, nullable; migration `1780500000000-AddCheckOutAtToOrderEmployees.ts` tạo cột tương ứng.
- API `POST /orders/:orderId/employees/:id/check-out` nhận body bắt buộc `{ breakTime }` (đơn vị giờ), lấy nhân viên từ JWT và đồng thời kiểm tra `id + orderId + employeeId` trên `OrderEmployee`.
- Chỉ cho checkout khi hợp đồng có trạng thái `COMPLETED` và có ít nhất một File active liên kết bằng `entityType = order`, `entityId = orderId`.
- Thời gian checkout luôn lấy từ server (`new Date()`); cùng một mốc được lưu vào `checkOutAt` và phần giờ `HH:mm:ss` được lưu vào `endTime`; nếu bản ghi đã có `checkOutAt` thì từ chối để không ghi đè lịch sử.
- Sau khi check-in hoặc checkout commit thành công, thông báo `SYSTEM` được gửi tới user liên kết với `Order.branchManagerId`, kèm `orderCode`, `orderId`, `employeeId` và event tương ứng `ORDER_EMPLOYEE_CHECKED_IN`/`ORDER_EMPLOYEE_CHECKED_OUT`; lỗi side effect chỉ được log, không đổi response thao tác chính.

## Thông báo tức thời cho đơn gấp

- Khi tạo Order có `isUrgent = true`, sau khi transaction commit sẽ gửi `ALERT` tới User liên kết với `Order.branchManagerId`, yêu cầu xác nhận nhận đơn.
- Khi tạo mới `OrderEmployee` trên Order gấp, sau khi transaction commit sẽ gửi `ALERT` tới User liên kết với nhân viên vừa được gán, yêu cầu xác nhận tham gia hợp đồng.
- Hai side effect đều kiểm tra lại Order gấp và bỏ qua nếu không có tài khoản người nhận; lỗi gửi thông báo chỉ được log, không rollback thao tác tạo Order/OrderEmployee.
- Payload truyền `orderCode` và metadata event lần lượt là `URGENT_ORDER_CREATED` và `URGENT_ORDER_EMPLOYEE_ASSIGNED`.

## Job cảnh báo hợp đồng hoàn thành chưa upload tài liệu

- **File**: `BE/src/queue/jobs/orderDocumentUploadNotification.job.ts`
- **Cron**: Chạy mỗi 5 phút (`0 */5 * * * *`, timezone `Asia/Ho_Chi_Minh`).
- Job lọc Order `COMPLETED` có `timeAt >= 07/07/2026 00:00:00` theo múi giờ Việt Nam, chưa bị xóa và không có File `ACTIVE` chưa bị xóa liên kết bằng `entityType = order`, `entityId = order.id`; dùng `NOT EXISTS` để không hydrate relation lớn.
- Gửi `ALERT` tới ADMIN và tài khoản quản lý chi nhánh với nội dung `Hợp đồng chưa được cập nhật đầy đủ tài liệu chứng từ.`; gửi riêng tới các `OrderEmployee` active có `isLeader = true` với nội dung `Vui lòng cập nhật đầy đủ tài liệu chứng từ cho hợp đồng.`
- Hai nhóm nhận payload riêng nhưng cùng `objectId = order.id`, metadata `orderId`/`orderCode`, và truyền `orderCode` qua `NotificationService` để đồng bộ title/socket/Firebase.
- Không lưu cờ đã gửi: job tiếp tục nhắc mỗi 5 phút cho tới khi có File active; có `isProcessing` để tránh overlap và được start/stop trong `src/index.ts`.

## Thông báo khi nhân viên phản hồi tham gia hợp đồng

- `OrderEmployeeService.notifyOrderEmployeeAssignmentStatus()` gửi `ALERT` sau khi nhân viên xác nhận hoặc từ chối thành công.
- Recipient gồm toàn bộ ADMIN, user liên kết với các `OrderLeader` và user liên kết với `Order.createdByEmployeeId`; danh sách được khử trùng trước khi gửi.
- Test `orderEmployee.assignment-status.spec.ts` phải bao phủ cả `CONFIRMED` và `REJECTED`, đồng thời bảo đảm người tạo đơn nhận được thông báo.

## Tài nguyên Order gồm file của đơn và file trong hoạt động

- API `GET /orders/:orderId/comments/attachments` trả về cả File có `entityType = orderComment` của các `OrderComment` thuộc đơn và File có `entityType = order` với `entityId = orderId`.
- Thứ tự kết quả giữ nhóm file hoạt động trước, sau đó đến nhóm file upload trực tiếp trong đơn để không làm thay đổi hành vi hiển thị hiện có.
