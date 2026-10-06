# AdvanceSalary module notes

## Delete flow

`TimeKeeping.advanceSalaryId` là khóa ngoại trỏ tới `Finance.id` và không có
`ON DELETE CASCADE`. Vì vậy `AdvanceSalaryService.delete` phải xóa bản ghi
`TimeKeeping` liên kết trước khi gọi `BaseService.delete` để xóa Finance.

- Khi caller đã truyền `IEntityManager`, dùng lại manager đó.
- Khi xóa trực tiếp từ route, tự tạo một transaction bao quanh cả cleanup và
  delete Finance.
- Giữ `actionAfterDelete` để xóa `Transaction` liên quan sau khi Finance đã
  được xóa; bước tìm TimeKeeping trong hook này là no-op sau cleanup trước đó.
