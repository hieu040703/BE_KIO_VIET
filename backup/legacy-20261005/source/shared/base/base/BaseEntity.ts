import {
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  ColumnOptions,
  AfterLoad,
  getMetadataArgsStorage,
} from "typeorm";

const parseNumericValue = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    if (!/^-?\d+\.?\d*$/.test(value)) {
      return null;
    }

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

/**
 * Base Entity with Soft Delete Support
 * Tất cả entities nên extend từ class này để có soft delete functionality
 */
export abstract class BaseEntity {
  private static readonly numericColumnCache = new Map<Function, Set<string>>();

  // @PrimaryGeneratedColumn({ name: "id" })
  // id!: number;

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", nullable: true, default: null })
  tempId?: string | null;

  @Column({ name: "note", type: "text", nullable: true })
  note?: string | null;

  @CreateDateColumn({ name: "createdAt", type: "timestamp without time zone", nullable: true })
  createdAt!: Date | null;

  @UpdateDateColumn({ name: "updatedAt", type: "timestamp without time zone", nullable: true })
  updatedAt!: Date | null;

  @Column({ name: "createdBy", type: "int", nullable: true })
  createdBy?: number | null;

  @Column({ name: "updatedBy", type: "int", nullable: true })
  updatedBy?: number | null;

  @DeleteDateColumn({ name: "deletedAt", nullable: true })
  deletedAt?: Date | null;

  // Helper methods
  get isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  private getNumericColumnNames(): Set<string> {
    const ctor = this.constructor as Function;
    const cached = BaseEntity.numericColumnCache.get(ctor);
    if (cached) {
      return cached;
    }

    const columns = getMetadataArgsStorage().columns.filter((col) => {
      if (typeof col.target !== "function") {
        return false;
      }
      const target = col.target as Function;
      return target === ctor || ctor.prototype instanceof target;
    });

    const numericColumnNames = new Set(
      columns
        .filter((col) => {
          const type = col.options?.type;
          return type === "decimal" || type === "numeric";
        })
        .map((col) => col.propertyName),
    );

    BaseEntity.numericColumnCache.set(ctor, numericColumnNames);
    return numericColumnNames;
  }

  @AfterLoad()
  protected convertDecimalFields() {
    const numericColumnNames = this.getNumericColumnNames();

    Object.keys(this).forEach((key) => {
      if (!numericColumnNames.has(key)) return;
      const value = (this as any)[key];
      const parsed = parseNumericValue(value);
      if (parsed !== null) {
        (this as any)[key] = parsed;
      }
    });
  }
}

export const BaseNumericColumnOptions: ColumnOptions = {
  type: "decimal",
  precision: 15,
  scale: 2,
  default: 0,
  transformer: {
    to: (value: number | null) => value,
    from: (value: string | number | null) => parseNumericValue(value) ?? 0,
  },
};

export const BaseNullableNumericColumnOptions: ColumnOptions = {
  ...BaseNumericColumnOptions,
  nullable: true,
  default: null,
  transformer: {
    to: (value: number | null) => value,
    from: (value: string | number | null) => parseNumericValue(value),
  },
};

export const BaseSortOrderColumnOptions: ColumnOptions = {
  type: "numeric",
  precision: 10,
  scale: 4,
  default: 10,
  transformer: {
    to: (value: number) => value,
    from: (value: string | number | null) => parseNumericValue(value) ?? 0,
  },
};
