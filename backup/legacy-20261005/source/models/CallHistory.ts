import { Entity, ManyToOne, Column, JoinColumn, Index } from "typeorm";
import { CallHistoryTypeEnum } from "@/shared/constants/constance";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { User } from "./User";
import { Order } from "./Order";

// Lưu trữ các cuộc gọi đã thực hiện
@Entity("call_histories")
export class CallHistory extends BaseEntity {
  //? thời gian bắt đầu cuộc gọi
  @Column({ type: "timestamp with time zone" })
  startTime!: Date;

  //? thời gian kết thúc cuộc gọi
  @Column({ type: "timestamp with time zone", nullable: true })
  endTime!: Date | null;

  //? thời lượng cuộc gọi (tính bằng giây)
  @Column({ type: "int", nullable: true })
  duration!: number | null;

  //? thời lượng cuộc gọi khi đã được trả lời (tính bằng giây)
  @Column({ type: "int", nullable: true })
  answerDuration!: number | null;

  //? nguyên nhân kết thúc cuộc gọi (ví dụ: "normal" - kết thúc bình thường, "missed" - cuộc gọi nhỡ, "rejected" - bị từ chối)
  @Column({ type: "varchar", nullable: true })
  endCallCause!: string | null;

  //? người kết thúc cuộc gọi (ví dụ: "caller" - người gọi, "receiver" - người nhận)
  @Column({ type: "varchar", nullable: true })
  endedBy!: string | null;

  //? loại cuộc gọi: ATA (app-to-app) hoặc PTP (phone-to-phone)
  @Column({ type: "enum", enum: CallHistoryTypeEnum, default: CallHistoryTypeEnum.PTP })
  callType!: CallHistoryTypeEnum;

  //? số điện thoại gọi đi
  @Column({ type: "varchar", nullable: true })
  callerPhoneNumber!: string | null;

  //? số điện thoại nhận cuộc gọi
  @Column({ type: "varchar", nullable: true })
  receiverPhoneNumber!: string | null;

  //? người dùng thực hiện cuộc gọi
  @Column({ type: "uuid", nullable: true })
  callerId!: string | null;
  @ManyToOne(() => User)
  @JoinColumn({ name: "callerId" })
  caller!: User | null;

  //? người dùng nhận cuộc gọi
  @Column({ type: "uuid", nullable: true })
  receiverId!: string | null;
  @ManyToOne(() => User)
  @JoinColumn({ name: "receiverId" })
  receiver!: User | null;

  //? đơn hàng liên quan đến cuộc gọi (nếu có)
  @Index("IDX_call_histories_orderId")
  @Column({ type: "uuid", nullable: true })
  orderId!: string | null;
  @ManyToOne(() => Order, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "orderId" })
  order!: Order | null;

  //? callId => lấy từ Stringee để liên kết với cuộc gọi thực tế trên Stringee
  @Column({ type: "varchar" })
  callId!: string;

  //? recording URL của cuộc gọi (nếu có)
  @Column({ type: "varchar", nullable: true })
  recordingUrl!: string | null;
}
