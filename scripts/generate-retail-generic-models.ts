import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");
const sqlPath = path.join(root, "database", "kiot_retail_full_postgresql.sql");
const outputPath = path.join(root, "src", "database", "models", "retail", "RetailGenericEntities.ts");
const sql = fs.readFileSync(sqlPath, "utf8");

const toPascalCase = (value: string): string =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const tables = Array.from(sql.matchAll(/CREATE TABLE (\w+) \((.*?)\);/gs))
  .filter((match) => match[2].includes("reference_id uuid") && match[1] !== "stock_ledgers")
  .map((match) => match[1]);

const classes = tables
  .map((table) => {
    const className = `Retail${toPascalCase(table)}`;
    return `@Entity("${table}")\nexport class ${className} extends RetailGenericRecord {\n  @ManyToOne(() => RetailTenant)\n  @JoinColumn({ name: "tenant_id", foreignKeyConstraintName: "${table}_tenant_id_fkey" })\n  tenant!: RetailTenant;\n}`;
  })
  .join("\n\n");

const source = `import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { RetailBaseEntity } from "./RetailBaseEntity";
import { RetailTenant } from "./RetailTenant";

/**
 * Generic model for tables in the SQL file that intentionally share the same
 * extensible record shape. These tables are registered for schema awareness;
 * business APIs are enabled only after their workflow is defined.
 */
export abstract class RetailGenericRecord extends RetailBaseEntity {
  @Column({ name: "tenant_id", type: "uuid" }) tenantId!: string;
  @Column({ type: "varchar", length: 80, nullable: true }) code!: string | null;
  @Column({ type: "varchar", length: 255, nullable: true }) name!: string | null;
  @Column({ type: "varchar", length: 30, default: "ACTIVE" }) status!: string;
  @Column({ name: "reference_id", type: "uuid", nullable: true }) referenceId!: string | null;
  @Column({ type: "numeric", precision: 18, scale: 2, nullable: true }) amount!: number | null;
  @Column({ type: "numeric", precision: 18, scale: 4, nullable: true }) quantity!: number | null;
  @Column({ type: "jsonb", default: () => "'{}'::jsonb" }) data!: Record<string, unknown>;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
  @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true }) deletedAt!: Date | null;
}

${classes}

export const retailGenericTableEntities = [
${tables.map((table) => `  { tableName: "${table}", entity: Retail${toPascalCase(table)} },`).join("\n")}
] as const;

export const retailGenericEntities = retailGenericTableEntities.map(({ entity }) => entity);
`;

fs.writeFileSync(outputPath, source, "utf8");
console.log(`Generated ${tables.length} generic retail entities at ${path.relative(root, outputPath)}`);
