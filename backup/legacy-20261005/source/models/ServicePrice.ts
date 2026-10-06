import { Entity, ManyToOne, Column, OneToMany, Unique } from "typeorm";
import { BaseEntity, BaseNumericColumnOptions } from "@/shared/base/BaseEntity";
import { Service } from "./Service";

@Entity("service_prices")
export class ServicePrice extends BaseEntity {
  // serviceId
  @Column({ type: "uuid" })
  serviceId!: string;
  @ManyToOne(() => Service, (service) => service.servicePrices)
  service!: Service;

  // hạng mục
  @Column({ type: "varchar" })
  category!: string;

  // đơn vị
  @Column({ type: "varchar" })
  unit!: string;

  // giá/1 đơn vị
  @Column(BaseNumericColumnOptions)
  price!: number;

  // số lượng định mức
  @Column(BaseNumericColumnOptions)
  quantity!: number;

  // số tiền trên mỗi đơn vị vượt định mức
  @Column(BaseNumericColumnOptions)
  excessUnitPrice!: number;
}
