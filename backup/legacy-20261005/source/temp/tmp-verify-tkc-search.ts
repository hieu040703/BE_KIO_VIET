/**
 * TẠM THỜI — script verify bug tìm kiếm danh sách lương đã duyệt (TimeKeepingConfirm).
 * CHỈ đọc dữ liệu (SELECT), không ghi. Xóa sau khi dùng.
 * Chạy: DB_LOGGING=true npx ts-node --transpile-only -r tsconfig-paths/register src/tmp-verify-tkc-search.ts
 */
import DatabaseConfig from "@/database/database";
import { TimeKeepingConfirmRepository } from "@/modules/timeKeeping/timeKeepingConfirm/timeKeepingConfirm.repository";

async function main() {
  await DatabaseConfig.initialize();

  // 1) Nhân viên nào có nhiều phiếu lương đã duyệt
  const owners: any[] = await DatabaseConfig.query(
    `SELECT e.name, count(*) AS cnt
       FROM time_keeping_confirms t
       JOIN employees e ON e.id = t."employeeId"
      WHERE t."deletedAt" IS NULL
      GROUP BY e.name
      ORDER BY cnt DESC
      LIMIT 5`,
  );
  console.log("\n========== EMPLOYEES CÓ PHIẾU LƯƠNG ==========");
  owners.forEach((o) => console.log("-", o.name, ":", o.cnt, "phiếu"));

  // 2) Ghi chú trong time_keepings + người sở hữu
  const tkNotes: any[] = await DatabaseConfig.query(
    `SELECT t.note, e.name AS empName
       FROM time_keepings t
       JOIN employees e ON e.id = t."employeeId"
      WHERE t.note IS NOT NULL AND t.note <> '' AND t."deletedAt" IS NULL
      ORDER BY t."updatedAt" DESC NULLS LAST
      LIMIT 12`,
  );
  console.log("\n========== TIMEKEEPING NOTES (mẫu) ==========");
  tkNotes.forEach((t) => console.log("-", t.empName ?? "(không join được)", "| tk.note:", t.note));

  const repo: any = new (TimeKeepingConfirmRepository as any)(undefined, undefined, undefined);
  repo.enableFileAttachment = false; // bỏ qua auto-attach files để tập trung vào query chính

  const searchAndPrint = async (keyword: string) => {
    console.log(`\n========== SEARCH keyword="${keyword}" ==========`);
    const res = await repo.findWithPagination({ keyword, page: 1, size: 20, sortBy: "timeAt", sortOrder: "DESC" });
    console.log(`-- KẾT QUẢ (total=${res.total}) --`);
    res.data.forEach((d: any, i: number) => {
      const matchName = d.employee?.name && d.employee.name.toLowerCase().includes(keyword.toLowerCase());
      console.log(
        `${i + 1}. ${matchName ? "[TÊN KHỚP]" : "[TÊN KHÔNG KHỚP]"} ${d.employee?.name} | TKC note: ${d.note ?? "(null)"} | ${d.startAt} -> ${d.endAt}`,
      );
    });
  };

  // 3) Tìm tên ĐẦY ĐỦ của nhân viên có nhiều phiếu nhất → kỳ vọng chỉ ra phiếu của người đó
  if (owners[0]) {
    await searchAndPrint(owners[0].name);
  }

  // 4) Tìm 1 từ có trong ghi chú timekeeping (vd tên kho/khách hàng) → xem có ra phiếu của
  //    nhân viên KHÔNG liên quan không (false positive từ timeKeepings.note)
  const noteWords = tkNotes
    .map((t) => (t.note || "").trim().split(/\s+/)[0])
    .filter((w) => w && w.length > 2);
  const uniqueNoteWords = Array.from(new Set(noteWords)).slice(0, 3);
  for (const w of uniqueNoteWords) {
    await searchAndPrint(w);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
