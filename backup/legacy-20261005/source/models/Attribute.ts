import { Entity, ManyToOne, Column, OneToMany, Unique } from "typeorm";
import { BaseEntity } from "@/shared/base/BaseEntity";
import { AttributeTypeEnum } from "@/shared/constants/constance";

@Entity("attributes")
@Unique(["name", "type"])
export class Attribute extends BaseEntity {
  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  code!: string | null;

  @Column({ type: "enum", enum: AttributeTypeEnum })
  type!: AttributeTypeEnum;

  //? value
  @Column({ type: "varchar", nullable: true })
  value!: string | null;

  @Column({ type: "boolean", default: false })
  isDefault!: boolean;
}
