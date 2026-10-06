import { BaseEntity, BaseNullableNumericColumnOptions } from "@/shared/base/BaseEntity";
import { VouchersTemplateStatusEnum } from "@/shared/constants/constance";
import { Column, Entity, Index, OneToMany } from "typeorm";
import { Vouchers } from "./Vouchers";

@Entity("vouchers_templates")
export class VouchersTemplate extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Index("IDX_vouchers_templates_code")
  @Column({ type: "varchar", length: 50, unique: true })
  code!: string;

  @Column({ type: "int" })
  points!: number;

  @Column(BaseNullableNumericColumnOptions)
  amount!: number | null;

  @Column({ type: "enum", enum: VouchersTemplateStatusEnum, default: VouchersTemplateStatusEnum.ACTIVE })
  status!: VouchersTemplateStatusEnum;

  @OneToMany(() => Vouchers, (voucher) => voucher.vouchersTemplate)
  vouchers!: Vouchers[];
}
