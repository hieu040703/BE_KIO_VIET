import { Entity, ManyToOne, Column, JoinColumn } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { Customer } from "./Customer";
import { Order } from "./Order";
import { ZaloMessageStatusEnum, ZaloTemplateTypeEnum } from "@/modules/zalo/zalo.constance";

// Lưu trữ lịch sử gửi tin nhắn Zalo tới khách hàng
@Entity("zalo_message_histories")
export class ZaloMessageHistory extends BaseEntity {
  //? đơn hàng liên quan
  @Column({ type: "uuid" })
  orderId!: string;

  //? customner
  @Column({ type: "uuid" })
  customerId!: string;

  //? ID template Zalo ZBS
  @Column({ type: "int", nullable: true })
  templateId!: number | null;

  //? tên template (lưu lại để tiện tra cứu)
  @Column({ type: "varchar", nullable: true })
  templateName!: string | null;

  //? loại template cấu hình trong hệ thống
  @Column({ type: "enum", enum: ZaloTemplateTypeEnum, nullable: true })
  templateType!: ZaloTemplateTypeEnum | null;

  //? số điện thoại nhận tin nhắn
  @Column({ type: "varchar" })
  phone!: string;

  //? msg_id trả về từ Zalo API (dùng để tra trạng thái sau)
  @Column({ type: "varchar", nullable: true })
  msgId!: string | null;

  //? trạng thái gửi tin nhắn: SENDING | SENT | FAILED | REJECTED | THROTTLED
  @Column({ type: "enum", enum: ZaloMessageStatusEnum, default: ZaloMessageStatusEnum.SENDING })
  status!: ZaloMessageStatusEnum;

  //? mã lỗi nếu gửi thất bại
  @Column({ type: "int", nullable: true })
  errorCode!: number | null;

  //? mô tả lỗi nếu gửi thất bại
  @Column({ type: "varchar", length: 500, nullable: true })
  errorMessage!: string | null;

  //? dữ liệu template đã gửi (lưu lại để kiểm tra)
  @Column({ type: "jsonb", nullable: true })
  templateData!: Record<string, any> | null;

  //? payload đầy đủ dùng để gửi lại tin nhắn khi cần
  @Column({ type: "jsonb", nullable: true })
  requestPayload!: Record<string, any> | null;

  //? thời gian gửi tin nhắn
  @Column({ type: "timestamp with time zone" })
  sentAt!: Date;

  //===== relations =====//

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: "customerId" })
  customer!: Customer | null;
}
