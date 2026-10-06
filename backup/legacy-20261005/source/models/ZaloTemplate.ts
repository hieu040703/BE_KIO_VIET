import { Entity, Column, Unique } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { ZaloTemplateTypeEnum } from "@/modules/zalo/zalo.constance";

@Entity("zalo_templates")
@Unique(["type"])
export class ZaloTemplate extends BaseEntity {
  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "enum", enum: ZaloTemplateTypeEnum, default: ZaloTemplateTypeEnum.CREATE })
  type!: ZaloTemplateTypeEnum;

  @Column({ type: "varchar" })
  templateId!: string;
}
