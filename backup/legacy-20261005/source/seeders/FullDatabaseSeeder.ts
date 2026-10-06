import "reflect-metadata";
import { QueryRunner } from "typeorm";
import DatabaseConfig from "@/database/database";
import { AuthUtils } from "@/shared/utils/auth.utils";

/**
 * Seed dữ liệu demo cho toàn bộ các bảng hiện có trong database.
 *
 * Script này chỉ thêm dữ liệu, không synchronize/drop schema và không gọi API bên ngoài.
 * Các bản ghi dùng UUID/mã SEED-FULL cố định nên chạy lại không tạo thêm bản ghi.
 */
export class FullDatabaseSeeder {
  private static readonly date = new Date("2026-09-21T09:00:00.000Z");

  private static async insert(
    runner: QueryRunner,
    table: string,
    row: Record<string, unknown>,
  ): Promise<void> {
    const columns = Object.keys(row);
    const values = Object.values(row).map((value) => {
      if (value instanceof Date || value === null || value === undefined) return value;
      if (Array.isArray(value)) {
        // pg nhận mảng chuỗi cho cột text[]/uuid[]; các mảng object là JSON/JSONB.
        return value.every((item) => typeof item === "string") ? value : JSON.stringify(value);
      }
      if (typeof value === "object") return JSON.stringify(value);
      return value;
    });
    const quotedColumns = columns.map((column) => `"${column}"`).join(", ");
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    // ON CONFLICT DO NOTHING giúp seed có thể chạy lại mà không ảnh hưởng dữ liệu khác.
    await runner.query(
      `INSERT INTO "${table}" (${quotedColumns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      values,
    );
  }

  static async run(): Promise<void> {
    await DatabaseConfig.initialize();

    const ids = {
      permission: "00000000-0000-4000-8000-000000000001",
      branch: "00000000-0000-4000-8000-000000000002",
      employee: "00000000-0000-4000-8000-000000000003",
      employee2: "00000000-0000-4000-8000-000000000004",
      customer: "00000000-0000-4000-8000-000000000005",
      customerUser: "00000000-0000-4000-8000-000000000006",
      adminUser: "00000000-0000-4000-8000-000000000007",
      employeeUser: "00000000-0000-4000-8000-000000000008",
      attribute: "00000000-0000-4000-8000-000000000009",
      service: "00000000-0000-4000-8000-000000000010",
      servicePrice: "00000000-0000-4000-8000-000000000011",
      serviceOrder: "00000000-0000-4000-8000-000000000012",
      order: "00000000-0000-4000-8000-000000000013",
      orderDetail: "00000000-0000-4000-8000-000000000014",
      orderEmployee: "00000000-0000-4000-8000-000000000015",
      orderComment: "00000000-0000-4000-8000-000000000016",
      orderLeader: "00000000-0000-4000-8000-000000000017",
      managerLocation: "00000000-0000-4000-8000-000000000018",
      leaderChat: "00000000-0000-4000-8000-000000000019",
      financeIncome: "00000000-0000-4000-8000-000000000020",
      financeAdvance: "00000000-0000-4000-8000-000000000021",
      transaction: "00000000-0000-4000-8000-000000000022",
      debt: "00000000-0000-4000-8000-000000000023",
      invoice: "00000000-0000-4000-8000-000000000024",
      expenseApproval: "00000000-0000-4000-8000-000000000025",
      margin: "00000000-0000-4000-8000-000000000026",
      allocateRevenue: "00000000-0000-4000-8000-000000000027",
      timeConfirm: "00000000-0000-4000-8000-000000000028",
      timeKeeping: "00000000-0000-4000-8000-000000000029",
      fund: "00000000-0000-4000-8000-000000000030",
      fundTransaction: "00000000-0000-4000-8000-000000000031",
      notification: "00000000-0000-4000-8000-000000000032",
      notificationDetail: "00000000-0000-4000-8000-000000000033",
      supportRoom: "00000000-0000-4000-8000-000000000034",
      supportMessage: "00000000-0000-4000-8000-000000000035",
      ticket: "00000000-0000-4000-8000-000000000036",
      ticketReply: "00000000-0000-4000-8000-000000000037",
      employeeTicket: "00000000-0000-4000-8000-000000000038",
      employeeTicketReply: "00000000-0000-4000-8000-000000000039",
      employeeTicketParticipant: "00000000-0000-4000-8000-000000000040",
      file: "00000000-0000-4000-8000-000000000041",
      fileUpload: "00000000-0000-4000-8000-000000000042",
      rag: "00000000-0000-4000-8000-000000000043",
      reward: "00000000-0000-4000-8000-000000000044",
      voucherTemplate: "00000000-0000-4000-8000-000000000045",
      voucher: "00000000-0000-4000-8000-000000000046",
      zaloTemplate: "00000000-0000-4000-8000-000000000047",
      zaloHistory: "00000000-0000-4000-8000-000000000048",
      callHistory: "00000000-0000-4000-8000-000000000049",
      callNavigation: "00000000-0000-4000-8000-000000000050",
      customerCare: "00000000-0000-4000-8000-000000000051",
      announcement: "00000000-0000-4000-8000-000000000052",
      appSetting: "00000000-0000-4000-8000-000000000053",
      referralLog: "00000000-0000-4000-8000-000000000054",
      orderReadState: "00000000-0000-4000-8000-000000000055",
      leaderReadState: "00000000-0000-4000-8000-000000000056",
      serviceChat: "00000000-0000-4000-8000-000000000057",
      serviceParticipant: "00000000-0000-4000-8000-000000000058",
      serviceRating: "00000000-0000-4000-8000-000000000059",
    } as const;

    const address = {
      country: "Viet Nam",
      state: "Ha Noi",
      ward: "Cau Giay",
      detail: "Kho demo seed full",
    };
    const later = new Date("2026-09-21T17:00:00.000Z");
    const password = await AuthUtils.hashPassword("123456");

    try {
      await DatabaseConfig.transaction(async (manager) => {
        const runner = manager.queryRunner!;

        // 1. Quyền, chi nhánh, nhân sự, khách hàng, tài khoản
        await this.insert(runner, "permission_groups", {
          id: ids.permission,
          name: "Seed Full Manager",
          permissions: {
            branch: ["read", "create", "update"],
            customer: ["read", "create", "update"],
            employee: ["read", "create", "update"],
            order: ["read", "create", "update", "confirm"],
            finance: ["read", "create"],
            invoice: ["read", "create"],
            timekeeping: ["read", "create", "update"],
          },
        });

        await this.insert(runner, "branches", {
          id: ids.branch,
          name: "Chi nhánh Seed Full",
          code: "SEED-FULL-BRANCH-001",
          address,
          employeeId: null,
          hotline: "0900000001",
          isInternal: true,
          isDefault: false,
        });

        await this.insert(runner, "employees", {
          id: ids.employee,
          branchId: ids.branch,
          code: "SEED-FULL-EMP-001",
          name: "Nhân viên Seed Full",
          email: "seed.employee@example.com",
          phone: "0900000002",
          status: "active",
          isOfficial: true,
          isDefault: false,
          position: "Sale khảo sát báo giá",
          expertise: ["Bốc xếp", "Điều phối"],
          department: "Vận hành",
          isWorking: true,
          address,
        });
        await this.insert(runner, "employees", {
          id: ids.employee2,
          branchId: ids.branch,
          code: "SEED-FULL-EMP-002",
          name: "Kế toán Seed Full",
          email: "seed.accountant@example.com",
          phone: "0900000003",
          status: "active",
          isOfficial: true,
          position: "Kế toán",
          expertise: ["Kế toán"],
          department: "Kế toán",
          isWorking: true,
          address,
        });
        await runner.query(`UPDATE "branches" SET "employeeId" = $1 WHERE "id" = $2`, [ids.employee, ids.branch]);

        await this.insert(runner, "customers", {
          id: ids.customer,
          branchId: ids.branch,
          code: "SEED-FULL-CUS-001",
          type: "BUSINESS",
          name: "Công ty Demo Seed Full",
          phone: "0900000004",
          email: "seed.customer@example.com",
          source: "OTHER",
          address,
          taxCode: "0100000001",
          openingDebt: 0,
        });

        await this.insert(runner, "users", {
          id: ids.adminUser,
          permissionGroupId: ids.permission,
          employeeId: ids.employee,
          code: "SEED-FULL-ADMIN",
          username: "seedadmin",
          password,
          role: "ADMIN",
          phone: "0900000005",
          name: "Admin Seed Full",
          email: "seed.admin@example.com",
          address,
          isActive: true,
        });
        await this.insert(runner, "users", {
          id: ids.employeeUser,
          permissionGroupId: ids.permission,
          employeeId: ids.employee2,
          code: "SEED-FULL-ACCOUNTANT",
          username: "seedaccountant",
          password,
          role: "EMPLOYEE",
          phone: "0900000006",
          name: "Kế toán Seed Full",
          email: "seed.accountant.user@example.com",
          address,
          isActive: true,
        });
        await this.insert(runner, "users", {
          id: ids.customerUser,
          permissionGroupId: null,
          employeeId: null,
          customerId: ids.customer,
          code: "SEED-FULL-CUS-USER",
          username: "seedcustomer",
          password,
          role: "USER",
          phone: "0900000004",
          name: "Khách hàng Seed Full",
          email: "seed.customer@example.com",
          address,
          isActive: true,
        });

        // 2. Danh mục dịch vụ và quỹ
        await this.insert(runner, "attributes", {
          id: ids.attribute,
          name: "Đơn vị demo",
          code: "SEED-FULL-UNIT",
          type: "UNIT",
          value: "ca",
          isDefault: true,
        });
        await this.insert(runner, "services", {
          id: ids.service,
          name: "Bốc xếp theo ca - Seed Full",
          type: "BOC_XEP_THEO_CA",
          autoQuote: true,
          icon: null,
          description: "Dịch vụ mẫu để test API",
        });
        await this.insert(runner, "service_prices", {
          id: ids.servicePrice,
          serviceId: ids.service,
          category: "Ca 4 giờ",
          unit: "ca",
          price: 400000,
          quantity: 4,
          excessUnitPrice: 100000,
        });
        await this.insert(runner, "funds", {
          id: ids.fund,
          name: "Quỹ Seed Full",
          bankName: "MB Bank",
          bin: "970422",
          accountNumber: "0000000001",
          accountHolder: "CONG TY DEMO SEED FULL",
          branch: "Ha Noi",
          isDefault: false,
        });

        // 3. Đơn dịch vụ và hợp đồng/đơn hàng
        await this.insert(runner, "service_orders", {
          id: ids.serviceOrder,
          customerId: ids.customer,
          branchId: ids.branch,
          branchManagerId: ids.employee,
          employeeId: ids.employee,
          code: "SEED-FULL-SERVICE-001",
          type: "BOC_XEP_THEO_CA",
          timeAt: this.date,
          address,
          isDebt: true,
          needsQuote: false,
          documentRequirement: "HOP_DONG",
          contactName: "Người liên hệ Seed",
          contactPhone: "0900000004",
          description: "Đơn dịch vụ mẫu Seed Full",
          status: "CONFIRMED",
          basePrice: 5000000,
          hasVat: true,
          vat: 10,
          vatAmount: 500000,
          amount: 5500000,
          employeeCount: 2,
          servicePrices: [{ name: "Ca 4 giờ", quantity: 1, unit: "ca", price: 5000000 }],
        });
        await this.insert(runner, "orders", {
          id: ids.order,
          serviceOrderId: ids.serviceOrder,
          branchId: ids.branch,
          name: "Đơn bốc xếp Seed Full",
          code: "SEED-FULL-ORDER-001",
          customerId: ids.customer,
          customerEmail: "seed.customer@example.com",
          customerPhone: "0900000004",
          timeAt: this.date,
          estimatedCompletionAt: later,
          address,
          deliveryAddress: { ...address, detail: "Kho nhận demo Seed Full" },
          preVatAmount: 5000000,
          discountAmount: 0,
          vat: 10,
          vatAmount: 500000,
          amount: 5500000,
          branchManagerId: ids.employee,
          branchManagerConfirmedStatus: "CONFIRMED",
          branchManagerConfirmedAt: this.date,
          employeeCount: 2,
          description: "Đơn hàng mẫu để test toàn bộ API",
          status: "PROCESSING",
          isInvoiced: true,
          invoiceNumber: "SEED-FULL-INVOICE-001",
          invoiceDate: this.date,
          deposit: 1000000,
          isPaid: false,
          isUrgent: false,
          calculationVersion: 1,
          calculatedVersion: 1,
        });
        await this.insert(runner, "order_details", {
          id: ids.orderDetail,
          orderId: ids.order,
          name: "Nhân công bốc xếp",
          unit: "ca",
          quantity: 1,
          totalHours: 4,
          price: 5000000,
          amount: 5000000,
        });
        await this.insert(runner, "order_employees", {
          id: ids.orderEmployee,
          orderId: ids.order,
          employeeId: ids.employee,
          timeAt: this.date,
          startTime: "09:00:00",
          endTime: "13:00:00",
          totalHours: 4,
          salary: 800000,
          isConfirmed: true,
          status: "CONFIRMED",
          isLeader: true,
        });
        await this.insert(runner, "order_comments", {
          id: ids.orderComment,
          orderId: ids.order,
          userId: ids.adminUser,
          content: "Bản ghi chú demo Seed Full",
          timeAt: this.date,
          tags: null,
        });
        await this.insert(runner, "order_comment_read_states", {
          id: ids.orderReadState,
          orderId: ids.order,
          userId: ids.adminUser,
          lastReadCommentId: ids.orderComment,
        });
        await this.insert(runner, "order_leaders", {
          id: ids.orderLeader,
          position: "Quản lý chi nhánh",
          orderId: ids.order,
          employeeId: ids.employee,
          revenueShare: 10,
          isRevenueShareAllocated: false,
          allocateRevenueId: null,
        });
        await this.insert(runner, "order_manager_locations", {
          id: ids.managerLocation,
          orderId: ids.order,
          employeeId: ids.employee,
          latitude: 21.027096,
          longitude: 105.823715,
          accuracy: 5,
          capturedAt: this.date,
          source: "seed-full",
        });
        await this.insert(runner, "order_leader_chats", {
          id: ids.leaderChat,
          orderId: ids.order,
          userId: ids.adminUser,
          content: "Trao đổi mẫu giữa quản lý và nhân viên",
          timeAt: this.date,
        });
        await this.insert(runner, "order_leader_chat_read_states", {
          id: ids.leaderReadState,
          orderId: ids.order,
          userId: ids.adminUser,
          lastReadMessageId: ids.leaderChat,
        });

        // 4. Tài chính, công nợ, hóa đơn, chấm công
        await this.insert(runner, "allocate_revenue", {
          id: ids.allocateRevenue,
          timeAt: this.date,
          fromDate: "2026-09-01",
          toDate: "2026-09-30",
          type: "Quản lý chi nhánh",
          totalRevenue: 5500000,
          totalAllocatedRevenue: 0,
          totalUnallocatedRevenue: 5500000,
          totalRevenueToAllocate: 5500000,
        });
        await this.insert(runner, "expense_approvals", {
          id: ids.expenseApproval,
          timeAt: this.date,
          requestedBy: ids.adminUser,
          approvedBy: ids.adminUser,
          approvedAt: this.date,
          isConfirm: true,
          amount: 600000,
        });
        await this.insert(runner, "margins", {
          id: ids.margin,
          branchId: ids.branch,
          employeeId: ids.employee,
          code: "SEED-FULL-MARGIN-001",
          timeAt: this.date,
          amount: 200000,
          userId: ids.adminUser,
          type: "MARGIN",
          status: "APPROVED",
          expenseApprovalId: ids.expenseApproval,
        });
        await this.insert(runner, "finances", {
          id: ids.financeIncome,
          branchId: ids.branch,
          code: "SEED-FULL-INCOME-001",
          type: "INCOME",
          userId: ids.adminUser,
          timeAt: this.date,
          category: "Thu tiền đơn hàng Seed Full",
          amount: 1000000,
          customerId: ids.customer,
          orderId: ids.order,
          isDeposit: true,
          isDebtRelated: true,
          status: "APPROVED",
        });
        await this.insert(runner, "finances", {
          id: ids.financeAdvance,
          branchId: ids.branch,
          code: "SEED-FULL-ADVANCE-001",
          type: "ADVANCE_SALARY",
          userId: ids.adminUser,
          timeAt: this.date,
          category: "Tạm ứng lương Seed Full",
          amount: 600000,
          employeeId: ids.employee,
          isDeductedAdvanceSalary: false,
          isDebtRelated: false,
          status: "PENDING",
        });
        await this.insert(runner, "transactions", {
          id: ids.transaction,
          code: "SEED-FULL-TRANS-001",
          financeId: ids.financeIncome,
          type: "IN",
          timeAt: this.date,
          amount: 1000000,
        });
        await this.insert(runner, "debts", {
          id: ids.debt,
          code: "SEED-FULL-DEBT-001",
          customerId: ids.customer,
          type: "RECEIVABLE",
          timeAt: this.date,
          amount: 4500000,
          orderId: ids.order,
          financeId: ids.financeIncome,
        });
        await this.insert(runner, "invoices", {
          id: ids.invoice,
          orderId: ids.order,
          branchId: ids.branch,
          customerId: ids.customer,
          employeeId: ids.employee,
          timeAt: this.date,
          code: "SEED-FULL-INVOICE-001",
          type: "SALES",
          description: "Hóa đơn dịch vụ bốc xếp Seed Full",
          totalBeforeTax: 5000000,
          taxPercent: 10,
          taxAmount: 500000,
          totalAfterTax: 5500000,
        });
        await this.insert(runner, "time_keeping_confirms", {
          id: ids.timeConfirm,
          employeeId: ids.employee,
          timeAt: this.date,
          startAt: this.date,
          endAt: later,
          userId: ids.adminUser,
          totalHours: 4,
          totalDayWorked: 0.5,
          totalSalary: 800000,
          totalRealSalary: 800000,
          totalAdvance: 0,
          totalMargin: 0,
          totalUniform: 0,
          totalPenalty: 0,
          totalBonus: 0,
          isPaid: false,
        });
        await this.insert(runner, "time_keepings", {
          id: ids.timeKeeping,
          employeeId: ids.employee,
          timeKeepingConfirmId: ids.timeConfirm,
          orderEmployeeId: ids.orderEmployee,
          timeAt: this.date,
          startTime: "09:00:00",
          endTime: "13:00:00",
          totalHours: 4,
          salary: 800000,
          advanceSalaryId: ids.financeAdvance,
          marginId: ids.margin,
          otherAmount: 0,
          isPaid: false,
          isCollected: false,
          type: "IN",
          isRevenueShareAllocation: false,
          allocateRevenueId: ids.allocateRevenue,
        });
        await this.insert(runner, "fund_transactions", {
          id: ids.fundTransaction,
          code: "SEED-FULL-FUND-TRANS-001",
          fundId: ids.fund,
          amount: 1000000,
          timeAt: this.date,
          transactionCode: "BANK-SEED-001",
          description: "Nạp quỹ demo Seed Full",
        });

        // 5. Đơn chat, thông báo, hỗ trợ, ticket
        await this.insert(runner, "service_order_chat_messages", {
          id: ids.serviceChat,
          serviceOrderId: ids.serviceOrder,
          senderUserId: ids.adminUser,
          messageType: "TEXT",
          content: "Tin nhắn tư vấn demo Seed Full",
          timeAt: this.date,
        });
        await this.insert(runner, "service_order_chat_participants", {
          id: ids.serviceParticipant,
          serviceOrderId: ids.serviceOrder,
          userId: ids.adminUser,
          addedByUserId: ids.adminUser,
        });
        await this.insert(runner, "service_order_ratings", {
          id: ids.serviceRating,
          orderId: ids.order,
          employeeId: ids.employee,
          rating: 5,
          review: "Phục vụ tốt - dữ liệu demo",
        });
        await this.insert(runner, "notifications", {
          id: ids.notification,
          title: "Thông báo Seed Full",
          content: "Đây là thông báo mẫu để test API notification.",
          timeAt: this.date,
          type: "INFO",
          objectId: ids.order,
          metadata: { source: "db:seed:full" },
        });
        await this.insert(runner, "notification_details", {
          id: ids.notificationDetail,
          userId: ids.adminUser,
          notificationId: ids.notification,
          isRead: false,
        });
        await this.insert(runner, "tickets", {
          id: ids.ticket,
          customerId: ids.customer,
          serviceOrderId: ids.serviceOrder,
          type: "OTHER",
          priority: 1,
          issue: "Yêu cầu hỗ trợ demo",
          description: "Khách hàng cần kiểm tra lại lịch bốc xếp.",
          contactPhone: "0900000004",
          preferredTime: "09:00-10:00",
          status: "OPEN",
        });
        await this.insert(runner, "ticket_replies", {
          id: ids.ticketReply,
          userId: ids.adminUser,
          ticketId: ids.ticket,
          content: "Bộ phận hỗ trợ đã tiếp nhận yêu cầu.",
          type: "SUPPORT",
          isInternal: false,
        });
        await this.insert(runner, "support_rooms", {
          id: ids.supportRoom,
          name: "Phòng hỗ trợ Seed Full",
          customerId: ids.customer,
          hasUnreadMessages: true,
        });
        await this.insert(runner, "support_room_chat_messages", {
          id: ids.supportMessage,
          supportRoomId: ids.supportRoom,
          senderUserId: ids.adminUser,
          messageType: "TEXT",
          content: "Xin chào, chúng tôi đang hỗ trợ bạn.",
          timeAt: this.date,
        });
        await this.insert(runner, "employee_tickets", {
          id: ids.employeeTicket,
          employeeId: ids.employee,
          createdByUserId: ids.employeeUser,
          type: "WORK_ASSIGNMENT",
          priority: 2,
          issue: "Xác nhận phân công công việc",
          description: "Ticket nội bộ mẫu để test luồng nhân viên.",
          status: "OPEN",
        });
        await this.insert(runner, "employee_ticket_replies", {
          id: ids.employeeTicketReply,
          employeeTicketId: ids.employeeTicket,
          userId: ids.adminUser,
          content: "Đã tiếp nhận ticket nội bộ.",
          type: "AUTHORIZED_USER",
        });
        await this.insert(runner, "employee_ticket_participants", {
          id: ids.employeeTicketParticipant,
          employeeTicketId: ids.employeeTicket,
          userId: ids.employeeUser,
          addedByUserId: ids.adminUser,
        });

        // 6. Voucher, chăm sóc khách hàng, cuộc gọi, thông báo Zalo
        await this.insert(runner, "vouchers_templates", {
          id: ids.voucherTemplate,
          name: "Voucher Seed Full",
          code: "SEED-FULL-VOUCHER-TPL",
          points: 100,
          amount: 100000,
          status: "ACTIVE",
        });
        await this.insert(runner, "vouchers", {
          id: ids.voucher,
          userId: ids.customerUser,
          customerId: ids.customer,
          vouchersTemplateId: ids.voucherTemplate,
          code: "SEED-FULL-VOUCHER-001",
          redeemedAt: this.date,
          expiredAt: new Date("2027-09-21T09:00:00.000Z"),
          isUsed: false,
        });
        await this.insert(runner, "customer_cares", {
          id: ids.customerCare,
          customerId: ids.customer,
          employeeId: ids.employee,
          method: "CALL",
          status: "SCHEDULED",
          scheduledAt: later,
          nextFollowUpAt: new Date("2026-09-28T09:00:00.000Z"),
        });
        await this.insert(runner, "call_histories", {
          id: ids.callHistory,
          startTime: this.date,
          endTime: new Date("2026-09-21T09:05:00.000Z"),
          duration: 300,
          answerDuration: 280,
          endCallCause: "normal",
          endedBy: "caller",
          callType: "PTP",
          callerPhoneNumber: "0900000005",
          receiverPhoneNumber: "0900000004",
          callerId: ids.adminUser,
          receiverId: ids.employeeUser,
          orderId: ids.order,
          callId: "SEED-FULL-CALL-001",
        });
        await this.insert(runner, "call_navigations", {
          id: ids.callNavigation,
          customerId: ids.customer,
          employeePhone: "0900000002",
          phone: "0900000004",
          stringeePhone: "1900000001",
          userId: ids.adminUser,
          orderId: ids.order,
          priority: 1,
          callId: "SEED-FULL-NAV-001",
          expiresAt: new Date("2027-09-21T09:00:00.000Z"),
        });
        await this.insert(runner, "zalo_templates", {
          id: ids.zaloTemplate,
          name: "Thông báo tạo đơn Seed Full",
          type: "CREATE",
          templateId: "SEED-FULL-ZALO-001",
        });
        await this.insert(runner, "zalo_message_histories", {
          id: ids.zaloHistory,
          orderId: ids.order,
          customerId: ids.customer,
          templateId: 100001,
          templateName: "Thông báo tạo đơn Seed Full",
          templateType: "CREATE",
          phone: "0900000004",
          msgId: "SEED-FULL-ZALO-MSG-001",
          status: "SENT",
          templateData: { orderCode: "SEED-FULL-ORDER-001" },
          requestPayload: { demo: true },
          sentAt: this.date,
        });
        await this.insert(runner, "announcements", {
          id: ids.announcement,
          title: "Thông báo hệ thống Seed Full",
          content: "Nội dung thông báo mẫu để test API announcement.",
          sentAt: this.date,
          sentBy: ids.adminUser,
          status: "SENT",
        });

        // 7. File, cài đặt, điểm thưởng, log giới thiệu và token
        await this.insert(runner, "files", {
          id: ids.file,
          fileName: "seed-full-demo.txt",
          originalName: "seed-full-demo.txt",
          path: "seed/full/seed-full-demo.txt",
          url: "https://example.com/seed-full-demo.txt",
          size: 128,
          type: "DOCUMENT",
          entityType: "order",
          entityId: ids.order,
          category: "document",
          isPublic: true,
          isMain: false,
          alt: "Tệp demo Seed Full",
          status: "active",
        });
        await this.insert(runner, "file_uploads", {
          id: ids.fileUpload,
          objectName: "seed/full/seed-full-demo.txt",
          originalName: "seed-full-demo.txt",
          bucketName: "demo",
          mimeType: "text/plain",
          size: 128,
          folder: "seed/full",
          etag: "seed-full-etag",
          downloadUrl: "https://example.com/seed-full-demo.txt",
          uploadedBy: ids.adminUser,
          metadata: { source: "db:seed:full" },
          isActive: true,
        });
        await this.insert(runner, "rag_documents", {
          id: ids.rag,
          fileName: "seed-full-guide.txt",
          originalName: "seed-full-guide.txt",
          mimeType: "text/plain",
          size: 256,
          filePath: "seed/full/seed-full-guide.txt",
          fileUrl: "https://example.com/seed-full-guide.txt",
          status: "COMPLETED",
          chunkCount: 1,
          totalChars: 256,
          provider: "seed",
          embeddingModel: "none",
          category: "demo",
          extraMetadata: { source: "db:seed:full" },
        });
        await this.insert(runner, "reward_points", {
          id: ids.reward,
          customerId: ids.customer,
          orderId: ids.order,
          type: "EARNED",
          points: 100,
        });
        await this.insert(runner, "app_settings", {
          id: ids.appSetting,
          order: {
            vat: 10,
            commission: 5,
            checkInDistanceThreshold: 100,
            orderStartNotificationMinutes: 30,
            urgentOrderAlertIntervalMinutes: 15,
            regularOrderAlertIntervalMinutes: 60,
            branchManagerRevenueShare: 5,
            accountantRevenueShare: 2,
            urgentOrderEnabled: true,
            urgentOrderHours: 2,
            urgentOrderSurchargePercent: 20,
            fragileItemSurchargePercent: 10,
          },
          customer: { referralBonus: 100000, referralThreshold: 1000000 },
          employee: {
            salesTargetBonus: [],
            turnoverPenalty: { daysOff: 7, percentOff: 5, percentFine: 2 },
            uniform: 100000,
            margin: 200000,
          },
          voucher: { minOrderValue: 1000000, pointToMoneyRate: 1000 },
          notification: { preferences: ["ORDER", "FINANCE", "TIMEKEEPING"] },
        });
        // ReferralLog hiện chưa được đăng ký trong entities và database hiện tại
        // không có bảng referral_logs, nên không insert ở đây.
        await this.insert(runner, "tokens", {
          id: "00000000-0000-4000-8000-000000000060",
          userId: ids.adminUser,
          refreshToken: "seed-full-refresh-token",
          sessionType: "web",
          firebaseToken: null,
          expiresAt: new Date("2027-09-21T09:00:00.000Z"),
        });
      });

      console.log("✅ Full seed completed: 54 application tables have linked demo data.");
      console.log("   Admin demo login: seedadmin / 123456");
    } finally {
      await DatabaseConfig.destroy();
    }
  }
}
