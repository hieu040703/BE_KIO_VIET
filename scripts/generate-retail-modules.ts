import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const sql = fs.readFileSync(path.join(root, "database", "kiot_retail_full_postgresql.sql"), "utf8");
const outputRoot = path.join(root, "src", "modules", "retail");

const toPascalCase = (value: string): string =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const toCamelCase = (value: string): string => {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const dedicatedEntityTables = new Set([
  "tenants",
  "branches",
  "warehouses",
  "users",
  "employees",
  "attendances",
  "payrolls",
  "products",
  "product_variants",
  "stock_ledgers",
  "inventories",
  "customers",
  "orders",
  "order_items",
  "payments",
]);

const dedicatedEntityNames: Record<string, string> = {
  tenants: "RetailTenant",
  branches: "RetailBranch",
  warehouses: "RetailWarehouse",
  users: "RetailUser",
  employees: "RetailEmployee",
  attendances: "RetailAttendance",
  payrolls: "RetailPayroll",
  products: "RetailProduct",
  product_variants: "RetailProductVariant",
  stock_ledgers: "RetailStockLedger",
  inventories: "RetailInventory",
  customers: "RetailCustomer",
  orders: "RetailOrder",
  order_items: "RetailOrderItem",
  payments: "RetailPayment",
};

const tables = Array.from(sql.matchAll(/CREATE TABLE (\w+) \((.*?)\);/gs)).map((match) => match[1]);

const generatedModules: Array<{ table: string; folder: string; prefix: string; className: string; typesName: string; moduleName: string }> = [];

for (const table of tables) {
  const folder = toCamelCase(table);
  const prefix = folder;
  const className = `Retail${toPascalCase(table)}`;
  const entityClassName = dedicatedEntityNames[table] ?? className;
  const entityImportPath = dedicatedEntityTables.has(table)
    ? "@/database/models"
    : "@/database/models/retail/RetailGenericEntities";
  const typesName = `RETAIL_${table.toUpperCase()}_TYPES`;
  const moduleName = `${prefix}Module`;
  const resource = table.replace(/_/g, "-");
  const directory = path.join(outputRoot, folder);
  fs.mkdirSync(directory, { recursive: true });

  fs.writeFileSync(
    path.join(directory, `${prefix}.types.ts`),
    `export const ${typesName} = {\n  Repository: Symbol.for("${className}Repository"),\n  Service: Symbol.for("${className}Service"),\n  Controller: Symbol.for("${className}Controller"),\n  Router: Symbol.for("${className}Router"),\n} as const;\n\nexport const ${prefix.toUpperCase()}_RESOURCE = "${resource}" as const;\n`,
  );

  fs.writeFileSync(
    path.join(directory, `${prefix}.container.ts`),
    `import { ContainerModule, ContainerModuleLoadOptions } from "inversify";\nimport { ${className}Controller } from "./${prefix}.controller";\nimport { ${className}Repository } from "./${prefix}.repository";\nimport { ${className}Router } from "./${prefix}.route";\nimport { ${className}Service } from "./${prefix}.service";\nimport { ${typesName} } from "./${prefix}.types";\n\nexport const ${moduleName} = new ContainerModule((options: ContainerModuleLoadOptions) => {\n  options.bind<${className}Repository>(${typesName}.Repository).to(${className}Repository);\n  options.bind<${className}Service>(${typesName}.Service).to(${className}Service);\n  options.bind<${className}Controller>(${typesName}.Controller).to(${className}Controller);\n  options.bind<${className}Router>(${typesName}.Router).to(${className}Router);\n});\n`,
  );

  fs.writeFileSync(
    path.join(directory, `${prefix}.repository.ts`),
    `import { injectable } from "inversify";\nimport { ${entityClassName} } from "${entityImportPath}";\nimport { BaseRepository } from "@/shared/base/BaseRepository";\nimport { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";\nimport { ${prefix.toUpperCase()}_RESOURCE } from "./${prefix}.types";\n\n@injectable()\nexport class ${className}Repository extends BaseRepository<${entityClassName}> {\n  protected entityClass = ${entityClassName};\n\n  protected getDefinition(): RetailTableDefinition {\n    return RETAIL_RESOURCES[${prefix.toUpperCase()}_RESOURCE];\n  }\n}\n`,
  );

  fs.writeFileSync(
    path.join(directory, `${prefix}.service.ts`),
    `import { inject, injectable } from "inversify";\nimport { BaseService } from "@/shared/base/BaseService";\nimport { ${entityClassName} } from "${entityImportPath}";\nimport { ${className}Repository } from "./${prefix}.repository";\nimport { ${typesName} } from "./${prefix}.types";\n\n@injectable()\nexport class ${className}Service extends BaseService<${entityClassName}> {\n  constructor(@inject(${typesName}.Repository) repository: ${className}Repository) {\n    super(repository);\n  }\n}\n`,
  );

  fs.writeFileSync(
    path.join(directory, `${prefix}.controller.ts`),
    `import { injectable, inject } from "inversify";\nimport { ${className}Service } from "./${prefix}.service";\nimport { ${typesName} } from "./${prefix}.types";\nimport { BaseController } from "@/shared/base/BaseController";\n\n@injectable()\nexport class ${className}Controller extends BaseController<${className}Service> {\n  constructor(@inject(${typesName}.Service) protected service: ${className}Service) {\n    super(service);\n  }\n}\n`,
  );

  fs.writeFileSync(
    path.join(directory, `${prefix}.route.ts`),
    `import { Router } from "express";\nimport { inject, injectable } from "inversify";\nimport { zodValidate } from "@/shared/middleware/validation.middleware";\nimport { permissionMiddleware } from "@/shared/middleware/permission.middleware";\nimport { ${className}Controller } from "./${prefix}.controller";\nimport { ${typesName} } from "./${prefix}.types";\nimport { ${prefix}BodySchema, ${prefix}IdParamsSchema, ${prefix}QuerySchema } from "./${prefix}.validator";\n\n@injectable()\nexport class ${className}Router {\n  private router: Router;\n\n  constructor(@inject(${typesName}.Controller) private ${prefix}Controller: ${className}Controller) {\n    this.router = Router();\n    this.initializeRoutes();\n  }\n\n  private initializeRoutes(): void {\n    this.router.get(\n      \"/\",\n      permissionMiddleware({ \"${resource}\": [\"read\"] }),\n      zodValidate(${prefix}QuerySchema, \"query\"),\n      this.${prefix}Controller.getAllWithPagination,\n    );\n    this.router.post(\n      \"/\",\n      permissionMiddleware({ \"${resource}\": [\"create\"] }),\n      zodValidate(${prefix}BodySchema, \"body\"),\n      this.${prefix}Controller.create,\n    );\n    this.router.get(\n      \"/:id\",\n      permissionMiddleware({ \"${resource}\": [\"read\"] }),\n      zodValidate(${prefix}IdParamsSchema, \"params\"),\n      this.${prefix}Controller.getById,\n    );\n    this.router.put(\n      \"/:id\",\n      permissionMiddleware({ \"${resource}\": [\"update\"] }),\n      zodValidate(${prefix}IdParamsSchema, \"params\"),\n      zodValidate(${prefix}BodySchema, \"body\"),\n      this.${prefix}Controller.update,\n    );\n    this.router.delete(\n      \"/:id\",\n      permissionMiddleware({ \"${resource}\": [\"delete\"] }),\n      zodValidate(${prefix}IdParamsSchema, \"params\"),\n      this.${prefix}Controller.delete,\n    );\n  }\n\n  public getRouter(): Router {\n    return this.router;\n  }\n}\n`,
  );

  fs.writeFileSync(
    path.join(directory, `${prefix}.select.ts`),
    `export const ${prefix}Select = { id: true } as const;\n`,
  );

  fs.writeFileSync(
    path.join(directory, `${prefix}.validator.ts`),
    `import { z } from "zod";\nimport { RetailBodySchema, RetailQuerySchema } from "../retail.validator";\n\nexport const ${prefix}BodySchema = RetailBodySchema;\nexport const ${prefix}QuerySchema = RetailQuerySchema;\nexport const ${prefix}IdParamsSchema = z.object({ id: z.uuid() });\n`,
  );

  generatedModules.push({ table, folder, prefix, className, typesName, moduleName });
}

const imports = generatedModules
  .map(({ folder, prefix, moduleName }) => `import { ${moduleName} } from "./${folder}/${prefix}.container";`)
  .join("\n");
const modules = generatedModules.map(({ moduleName }) => `  ${moduleName},`).join("\n");
const routeImports = generatedModules
  .map(({ folder, prefix, typesName }) => `import { ${typesName}, ${prefix.toUpperCase()}_RESOURCE } from "./${folder}/${prefix}.types";`)
  .join("\n");
const routes = generatedModules
  .map(({ prefix }) => `  { resource: ${prefix.toUpperCase()}_RESOURCE, token: ${generatedModules.find((item) => item.prefix === prefix)!.typesName}.Router },`)
  .join("\n");

fs.writeFileSync(
  path.join(outputRoot, "retail-generated.container.ts"),
  `${imports}\n\nexport const retailGeneratedModules = [\n${modules}\n];\n\n${routeImports}\n\nexport const retailGeneratedRoutes = [\n${routes}\n];\n`,
);

console.log(`Generated ${generatedModules.length} basic retail modules under src/modules/retail`);
