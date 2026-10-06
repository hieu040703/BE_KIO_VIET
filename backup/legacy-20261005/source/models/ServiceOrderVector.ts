// Bảng service_order_vectors được quản lý bởi LangChain PGVectorStore (raw pg.Pool),
// KHÔNG đăng ký vào TypeORM DataSource để tránh xung đột schema.
// Migration: 1775200000000-CreateServiceOrderVectors.ts

export interface IServiceOrderVectorMetadata {
  serviceOrderId: string;
  type: string;
  status: string;
  amount: number | null;
  customerId: string;
  timeAt: string;
  branchId?: string | null;
}
