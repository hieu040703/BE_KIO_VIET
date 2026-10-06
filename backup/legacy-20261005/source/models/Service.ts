import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { ServiceOrderTypeEnum } from "@/shared/constants/constance";
import { ServicePrice } from "./ServicePrice";

@Entity("services")
export class Service extends BaseEntity {
  @Column({ type: "varchar" })
  name!: string;

  //? loại dịch vụ
  @Column({ type: "enum", enum: ServiceOrderTypeEnum })
  type!: ServiceOrderTypeEnum;

  //? báo giá tự động
  @Column({ type: "boolean", default: false })
  autoQuote!: boolean;

  //? icon
  @Column({ type: "varchar", nullable: true })
  icon!: string | null;

  //? mô tả dịch vụ
  @Column({ type: "varchar", nullable: true })
  description!: string | null;

  @OneToMany(() => ServicePrice, (servicePrice) => servicePrice.service)
  servicePrices!: ServicePrice[];
}

