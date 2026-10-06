import * as fs from "fs";
import * as path from "path";
import { Utils } from "./utils";
import dotenv from "dotenv";

// Load .env file trước khi access process.env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Đảm bảo NODE_ENV được set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

interface EntityInfo {
  name: string;
  fileName: string;
  filePath: string;
  tableName: string;
  columns: ColumnInfo[];
}

interface ColumnInfo {
  name: string;
  type: string;
  propertyType: string; // TypeScript type (e.g., string, number, boolean, etc.)
  isOptional: boolean;
  isArray: boolean;
  enumValues?: string[];
  length?: number;
}

export class ModuleGenerator {
  private entitiesPath: string;
  private modulesPath: string;

  constructor(entitiesPath: string = "src/database/models", modulesPath: string = "src/modules") {
    this.entitiesPath = path.resolve(entitiesPath);
    this.modulesPath = path.resolve(modulesPath);
  }

  public async generateAllModules(): Promise<void> {
    const entities = this.getEntities();

    // for (const entity of entities) {
    //   console.log(`Generating module for ${entity.name}...`);
    //   await this.generateModuleForEntity(entity);
    // }

    // await this.generateDbConfig(entities);
    // await this.generateRouter(entities);
    // await this.generateTypes(entities);
    // await this.generateContainer(entities);
    await this.generatePostman(entities);

    console.log(`Generated ${entities.length} modules successfully!`);
  }

  /**
   * Generate module for specific entity by name
   */
  public async generateModuleByName(entityName: string): Promise<void> {
    const entities = this.getEntities();
    const entity = entities.find((e) => e.name.toLowerCase() === entityName.toLowerCase());

    if (!entity) {
      throw new Error(
        `Entity '${entityName}' not found. Available entities: ${entities.map((e) => e.name).join(", ")}`,
      );
    }

    console.log(`Generating module for ${entity.name}...`);
    await this.generateModuleForEntity(entity);
    console.log(`Module for ${entity.name} generated successfully!`);
  }

  public getEntityByName(entityName: string): EntityInfo | undefined {
    const entities = this.getEntities();
    const entity = entities.find((e) => e.name.toLowerCase() === entityName.toLowerCase());

    if (!entity) {
      throw new Error(
        `Entity '${entityName}' not found. Available entities: ${entities.map((e) => e.name).join(", ")}`,
      );
    }

    return entity;
  }

  public async generateRouter(entities: EntityInfo[]) {
    const imports = entities
      .map(
        (e) =>
          `import { ${e.name}Router } from "./modules/${this.toCamelCase(e.name)}/${this.toCamelCase(e.name)}.route";`,
      )
      .join("\n");

    const routerInstances = entities
      .map((e) => `const ${this.toCamelCase(e.name)}Router = container.get<${e.name}Router>(TYPES.${e.name}Router);`)
      .join("\n");

    const routes = entities
      .map((e) => `router.use("/${e.tableName.replace("_", "-")}", ${this.toCamelCase(e.name)}Router.getRouter());`)
      .join("\n");

    const data = `
    import { Router } from "express";
    import { container } from "@/config/container";
    import { TYPES } from "@/shared/types/container.types";
    import { authenticate } from "./shared/middleware/auth.middleware";

    import { AuthRouter } from "./modules/auth/auth.route";
    ${imports}

    const router = Router();
    const authRouter = container.get<AuthRouter>(TYPES.AuthRouter);

    ${routerInstances}

    router.use("/auth", authRouter.getRouter());
    
    router.use(authenticate); // Apply authentication middleware to all routes below

    ${routes}

    export default router;
    `;

    const filePath = path.join("src", "routes.ts");

    fs.writeFileSync(filePath, data);
  }

  public async generateDbConfig(entities: EntityInfo[]) {
    const importData = entities
      .map(
        (e) =>
          `
      import { ${e.name} } from "@/database/models/${e.name}";
      `,
      )
      .join("\n");

    const entitiesList = entities.map((e) => `${e.name},`).join("\n");

    const data = `
      import { DataSource } from "typeorm";
      import { config } from "./env";
      import path from "path";

      ${importData}

      const isDevelopment = process.env.NODE_ENV !== "production";
      const isProduction = process.env.NODE_ENV === "production";
      
      // Get the correct base path for entities, migrations, and subscribers
      const getBasePath = () => {
        if (isProduction) {
          // In production, __dirname will be dist/config
          return path.join(__dirname, "..");
        } else {
          // In development, __dirname will be src/config
          return path.join(__dirname, "..");
        }
      };
      
      const basePath = getBasePath();

      export const DatabaseConfig = new DataSource({
        type: "postgres",
        host: config.DB_HOST,
        port: config.DB_PORT,
        username: config.DB_USERNAME,
        password: config.DB_PASSWORD,
        database: config.DB_DATABASE,
        synchronize: config.NODE_ENV === "development",
        logging: config.NODE_ENV === "development",
        entities: [
          ${entitiesList}
        ],
        migrations: [
          isProduction
            ? path.join(basePath, "database/migrations/**/*.js")
            : path.join(basePath, "database/migrations/**/*.ts"),
        ],
        subscribers: [
          isProduction
            ? path.join(basePath, "database/subscribers/**/*.js")
            : path.join(basePath, "database/subscribers/**/*.ts"),
        ],
      });

      export default DatabaseConfig;
    `;

    const filePath = path.join("src/config", "database.ts");

    fs.writeFileSync(filePath, data);
  }

  public async generateTypes(entities: EntityInfo[]) {
    const types = entities
      .map(
        (e) =>
          `
      ${e.name}Service: Symbol.for("${e.name}Service"),
      ${e.name}Controller: Symbol.for("${e.name}Controller"),
      ${e.name}Repository: Symbol.for("${e.name}Repository"),
      ${e.name}Router: Symbol.for("${e.name}Router"),
      `,
      )
      .join("\n");

    const data = `
      export const TYPES = {
        AuthController: Symbol.for("AuthController"),
        AuthService: Symbol.for("AuthService"),
        AuthRepository: Symbol.for("AuthRepository"),
        AuthRouter: Symbol.for("AuthRouter"),

        TransactionManager: Symbol.for("TransactionManager"),

        ${types}
      };
    `;

    const filePath = path.join("src/shared/types", "container.types.ts");

    fs.writeFileSync(filePath, data);
  }

  public async generateContainer(entities: EntityInfo[]) {
    const importData = entities
      .map(
        (e) =>
          `
      import { ${e.name}Controller } from "@/modules/${this.toCamelCase(e.name)}/${this.toCamelCase(
        e.name,
      )}.controller";
      import { ${e.name}Service } from "@/modules/${this.toCamelCase(e.name)}/${this.toCamelCase(e.name)}.service";
      import { ${e.name}Repository } from "@/modules/${this.toCamelCase(e.name)}/${this.toCamelCase(
        e.name,
      )}.repository";
      import { ${e.name}Router } from "@/modules/${this.toCamelCase(e.name)}/${this.toCamelCase(e.name)}.route";
      `,
      )
      .join("\n");

    const bindingData = entities
      .map(
        (e) =>
          `
      container.bind<${e.name}Controller>(TYPES.${e.name}Controller).to(${e.name}Controller);
      container.bind<${e.name}Service>(TYPES.${e.name}Service).to(${e.name}Service);
      container.bind<${e.name}Repository>(TYPES.${e.name}Repository).to(${e.name}Repository);
      container.bind<${e.name}Router>(TYPES.${e.name}Router).to(${e.name}Router);
      `,
      )
      .join("\n");

    const data = `
      import { Container } from "inversify";
      import { TYPES } from "@/shared/types/container.types";

      // Base classes
      import { TransactionManager } from "@/shared/base/TransactionManager";

      // Auth module
      import { AuthController } from "@/modules/auth/auth.controller";
      import { AuthService } from "@/modules/auth/auth.service";
      import { AuthRepository } from "@/modules/auth/auth.repository";
      import { AuthRouter } from "@/modules/auth/auth.route";

      ${importData}

      const container = new Container();

      // Base services
      container.bind<TransactionManager>(TYPES.TransactionManager).to(TransactionManager);

      container.bind<AuthController>(TYPES.AuthController).to(AuthController);
      container.bind<AuthService>(TYPES.AuthService).to(AuthService);
      container.bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepository);
      container.bind<AuthRouter>(TYPES.AuthRouter).to(AuthRouter);

      ${bindingData}

      export { container };
    `;

    const filePath = path.join("src/config", "container.ts");

    fs.writeFileSync(filePath, data);
  }

  public async generatePostman(entities: EntityInfo[]) {
    const api = entities
      .map(
        (e) =>
          `
           {
            "name": "${e.name}",
            "item": [
              {
                "name": "get all",
                "request": {
                  "method": "GET",
                  "header": [],
                  "url": {
                    "raw": "{{base${process.env.PROJECT_NAME}}}/${e.tableName.replace(
                      "_",
                      "-",
                    )}?page=1&size=20&sortBy=id&sortOrder=DESC",
                    "host": [
                      "{{base${process.env.PROJECT_NAME}}}"
                    ],
                    "path": [
                      "${e.tableName.replace("_", "-")}"
                    ],
                    "query": [
                      {
                        "key": "page",
                        "value": "1"
                      },
                      {
                        "key": "size",
                        "value": "20"
                      },
                      {
                        "key": "type",
                        "value": "UNIT",
                        "disabled": true
                      },
                      {
                        "key": "keyword",
                        "value": "cái",
                        "disabled": true
                      },
                      {
                        "key": "status",
                        "value": "active",
                        "disabled": true
                      },
                      {
                        "key": "sortBy",
                        "value": "name"
                      },
                      {
                        "key": "sortOrder",
                        "value": "DESC"
                      },
                       {
                        "key": "startAt",
                        "value": "2025-01-01",
                      },
                      {
                        "key": "endAt",
                        "value": "2025-12-31"
                      },
                    ]
                  }
                },
                "response": []
              },
              {
                "name": "get by id",
                "request": {
                  "method": "GET",
                  "header": [],
                  "url": {
                    "raw": "{{base${process.env.PROJECT_NAME}}}/${e.tableName.replace("_", "-")}/:id",
                    "host": [
                      "{{base${process.env.PROJECT_NAME}}}"
                    ],
                    "path": [
                      "${e.tableName.replace("_", "-")}",
                      ":id"
                    ]
                  }
                },
                "response": []
              },
              {
                "name": "create",
                "request": {
                  "method": "POST",
                  "header": [],
                  "body": {
                    "mode": "raw",
                    "raw": "{ ${e.columns.map((col) => `    \\"${col.name}\\": \\"value\\"`).join(", ")} }",
                    "options": {
                      "raw": {
                        "language": "json"
                      }
                    }
                  },
                  "url": {
                    "raw": "{{base${process.env.PROJECT_NAME}}}/${e.tableName.replace("_", "-")}",
                    "host": [
                      "{{base${process.env.PROJECT_NAME}}}"
                    ],
                    "path": [
                      "${e.tableName.replace("_", "-")}"
                    ]
                  }
                },
                "response": []
              },
              {
                "name": "update",
                "request": {
                  "method": "PUT",
                  "header": [],
                  "body": {
                    "mode": "raw",
                    "raw": "{ ${e.columns.map((col) => `    \\"${col.name}\\": \\"value\\"`).join(", ")} }",
                    "options": {
                      "raw": {
                        "language": "json"
                      }
                    }
                  },
                  "url": {
                    "raw": "{{base${process.env.PROJECT_NAME}}}/${e.tableName.replace("_", "-")}/:id",
                    "host": [
                      "{{base${process.env.PROJECT_NAME}}}"
                    ],
                    "path": [
                      "${e.tableName.replace("_", "-")}",
                      ":id"
                    ],
                    "variable": [
                      {
                        "key": "id",
                        "value": ""
                      }
                    ]
                  }
                },
                "response": []
              },
              {
                "name": "delete",
                "request": {
                  "method": "DELETE",
                  "header": [],
                  "body": {
                    "mode": "raw",
                    "raw": {   "name": "SP0002",    
                                "code": "SP0002"
                            },
                    "options": {
                      "raw": {
                        "language": "json"
                      }
                    }
                  },
                  "url": {
                    "raw": "{{base${process.env.PROJECT_NAME}}}/${e.tableName.replace("_", "-")}/:id",
                    "host": [
                      "{{base${process.env.PROJECT_NAME}}}"
                    ],
                    "path": [
                      "${e.tableName.replace("_", "-")}",
                      ":id"
                    ],
                    "variable": [
                      {
                        "key": "id",
                        "value": ""
                      }
                    ]
                  }
                },
                "response": []
              }
            ]
          },
      `,
      )
      .join("\n");

    const data = `
      {
        "info": {
          "_postman_id": "12345678-1234-1234-1234-123456789012",
          "name": ${process.env.PROJECT_NAME},
          "note": "API documentation for ${process.env.PROJECT_NAME}",
          "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": [
          ${api}
        ]
      }
    `;

    const filePath = path.join("src/shared/api", `${process.env.PROJECT_NAME}.postman_collection.json`);

    fs.writeFileSync(filePath, data);
  }

  /**
   * List all available entities
   */
  public listEntities(): string[] {
    const entities = this.getEntities();
    return entities.map((e) => e.name);
  }

  private getEntities(): EntityInfo[] {
    const entities: EntityInfo[] = [];

    if (!fs.existsSync(this.entitiesPath)) {
      throw new Error(`Entities directory not found: ${this.entitiesPath}`);
    }

    const files = fs.readdirSync(this.entitiesPath);

    for (const file of files) {
      if (file.endsWith(".ts") && !file.includes(".spec.") && !file.includes(".test.")) {
        const filePath = path.join(this.entitiesPath, file);
        const entityContent = fs.readFileSync(filePath, "utf8");

        // Extract entity information
        const classNameMatch = entityContent.match(/export\s+class\s+(\w+)/);
        const tableNameMatch = entityContent.match(/@Entity\(['"](.*?)['"]\)/);

        if (classNameMatch) {
          const entityName = classNameMatch[1];
          const tableName = tableNameMatch ? tableNameMatch[1] : entityName.toLowerCase() + "s";
          const columns = this.extractColumnsFromSource(entityContent);

          entities.push({
            name: entityName,
            fileName: file,
            filePath,
            tableName,
            columns,
          });
        }
      }
    }

    return entities;
  }

  private extractColumnsFromSource(sourceCode: string): ColumnInfo[] {
    const columns: ColumnInfo[] = [];

    // Find all @Column decorators and their properties
    const columnRegex = /@Column\(([^)]*)\)\s*(\w+)(!|\?)?:\s*(\w+(?:\[\])?)/g;
    let match;

    while ((match = columnRegex.exec(sourceCode)) !== null) {
      const [, decoratorOptions, propertyName, optionalModifier, propertyType] = match;

      // Parse decorator options
      const options = this.parseDecoratorOptions(decoratorOptions);

      // Determine if property is optional
      const isOptional = optionalModifier === "?" || options.nullable === true;

      // Determine if property is array
      const isArray = propertyType.includes("[]") || options.array === true;

      // Detect nullable type (e.g., string | null)
      if (propertyType.includes("null")) {
        options.nullable = true;
      }

      // Map TypeScript/TypeORM types to Zod types
      const zodType = this.mapTypeToZod(propertyType, { ...options, optional: isOptional }, propertyName);

      columns.push({
        name: propertyName,
        type: zodType,
        propertyType,
        isOptional,
        isArray,
        enumValues: options.enum,
        length: options.length,
      });
    }

    // Also look for simple property declarations without @Column
    const simplePropertyRegex = /^\s*(\w+)(!|\?)?:\s*(\w+(?:\[\])?(?:\s*\|\s*null)?);/gm;
    let propMatch;

    while ((propMatch = simplePropertyRegex.exec(sourceCode)) !== null) {
      const [, propertyName, optionalModifier, propertyType] = propMatch;

      // Skip if already found with @Column decorator
      if (columns.find((col) => col.name === propertyName)) {
        continue;
      }

      // Skip common base entity fields and relations
      if (["id", "createdAt", "updatedAt", "deletedAt"].includes(propertyName)) {
        continue;
      }

      // Skip if it looks like a relation (has @OneToMany, @ManyToOne, etc. nearby)
      const beforeProperty = sourceCode.substring(0, propMatch.index);
      const relationDecorators = /@(OneToMany|ManyToOne|OneToOne|ManyToMany)/;
      const linesBeforeProperty = beforeProperty.split("\n").slice(-5).join("\n");

      if (relationDecorators.test(linesBeforeProperty)) {
        continue;
      }

      const isOptional = optionalModifier === "?";
      const isArray = propertyType.includes("[]");
      const options: any = {};
      if (propertyType.includes("null")) {
        options.nullable = true;
      }

      const zodType = this.mapTypeToZod(propertyType, { optional: isOptional, ...options }, propertyName);

      columns.push({
        name: propertyName,
        type: zodType,
        propertyType,
        isOptional,
        isArray,
      });
    }

    return columns;
  }

  private parseDecoratorOptions(optionsString: string): any {
    if (!optionsString || optionsString.trim() === "") {
      return {};
    }

    const options: any = {};

    try {
      // Simple parsing for common options
      if (optionsString.includes("nullable: true")) {
        options.nullable = true;
      }

      if (optionsString.includes("array: true")) {
        options.array = true;
      }

      // Extract type
      const typeMatch = optionsString.match(/type:\s*["']([^"']+)["']/);
      if (typeMatch) {
        options.type = typeMatch[1];
      }

      // Extract length
      const lengthMatch = optionsString.match(/length:\s*(\d+)/);
      if (lengthMatch) {
        options.length = parseInt(lengthMatch[1]);
      }

      // Extract enum - improved pattern matching
      const enumMatch = optionsString.match(/enum:\s*\[([^\]]+)\]/);
      if (enumMatch) {
        // Parse array of enum values like ["GENERAL", "TEAM_1", "TEAM_2"]
        const enumValuesStr = enumMatch[1];
        const enumValues = enumValuesStr
          .split(",")
          .map((v) => v.trim().replace(/['"]/g, ""))
          .filter((v) => v.length > 0);
        options.enumValues = enumValues;
      } else {
        // Check for Object.values pattern
        const objectEnumMatch = optionsString.match(/enum:\s*([^,}]+)/);
        if (objectEnumMatch) {
          options.enum = objectEnumMatch[1];
        }
      }

      // Extract default
      const defaultMatch = optionsString.match(/default:\s*([^,}]+)/);
      if (defaultMatch) {
        options.default = defaultMatch[1];
      }
    } catch (error) {
      console.warn("Error parsing decorator options:", optionsString);
    }

    return options;
  }

  private mapTypeToZod(tsType: string, options: any, fieldName?: string): string {
    // Remove array notation for base type mapping
    const baseType = tsType.replace("[]", "");
    const isArray = tsType.includes("[]") || options.array;
    const isOptional = options.nullable || options.optional;

    let zodType = "";

    // Handle enums
    if (options.enumValues && options.enumValues.length > 0) {
      // Direct enum values from parsing
      const enumValues = options.enumValues;
      if (!isOptional && fieldName) {
        zodType = `z.enum([${enumValues.map((v: string) => `"${v}"`).join(", ")}])`;
      } else {
        zodType = `z.enum([${enumValues.map((v: string) => `"${v}"`).join(", ")}])`;
      }
    } else if (options.enum) {
      // Object.values pattern or other enum references
      const enumValues = this.extractEnumValues(options.enum);
      if (enumValues.length > 0) {
        if (!isOptional && fieldName) {
          zodType = `z.enum([${enumValues.map((v: string) => `"${v}"`).join(", ")}])`;
        } else {
          zodType = `z.enum([${enumValues.map((v: string) => `"${v}"`).join(", ")}])`;
        }
      } else {
        // If we can't extract enum values, fallback to string with enum constraint comment
        if (!isOptional && fieldName) {
          zodType = `z.string()`;
        } else {
          zodType = `z.string()`;
        }
      }
    } else {
      // Map basic types
      switch (baseType.toLowerCase()) {
        case "string":
          if (!isOptional && fieldName) {
            zodType = `z.string()`;
          } else {
            zodType = `z.string()`;
          }
          // Add length constraint
          if (options.length) {
            zodType += `.max(${options.length})`;
          }
          // Add nullable if needed
          if (options.nullable) {
            zodType += ".nullable()";
          }
          break;
        case "number":
          if (!isOptional && fieldName) {
            zodType = `z.number()`;
          } else {
            zodType = `z.number()`;
          }
          if (options.nullable) {
            zodType += ".nullable()";
          }
          break;
        case "boolean":
          if (!isOptional && fieldName) {
            zodType = `z.boolean()`;
          } else {
            zodType = `z.boolean()`;
          }
          if (options.nullable) {
            zodType += ".nullable()";
          }
          break;
        case "date":
          if (!isOptional && fieldName) {
            zodType = `z.coerce.date()`;
          } else {
            zodType = `z.coerce.date()`;
          }
          if (options.nullable) {
            zodType += ".nullable()";
          }
          break;
        default:
          // Handle custom types or fallback to string
          if (!isOptional && fieldName) {
            zodType = `z.string()`;
          } else {
            zodType = `z.string()`;
          }
          if (options.nullable) {
            zodType += ".nullable()";
          }
      }
    }

    // Add special validations based on field name
    // if (fieldName && zodType.includes("z.string(")) {
    //   if (fieldName.includes("email")) {
    //     zodType += `.email()`;
    //   } else if (fieldName.includes("password")) {
    //     zodType += `.min(6, { message: "${fieldName}.min_length" })`;
    //   } else if (fieldName.includes("phone")) {
    //     zodType += `.regex(/^[0-9+\\-\\s()]+$/, )`;
    //   } else if (fieldName.includes("url") || fieldName.includes("link")) {
    //     zodType += `.url()`;
    //   }
    // }

    // Handle arrays
    if (isArray) {
      zodType = `z.array(${zodType})`;
    }

    return zodType;
  }

  private extractEnumValues(enumString: string): string[] {
    // Handle Object.values(EnumName) pattern
    const objectValuesMatch = enumString.match(/Object\.values\((\w+)\)/);
    if (objectValuesMatch) {
      const enumName = objectValuesMatch[1];
      // For common enum patterns, return some default values
      // In a real implementation, you'd want to parse the actual enum definition
      switch (enumName.toLowerCase()) {
        case "team":
        case "teamtype":
          return ["DEVELOPMENT", "DESIGN", "MARKETING", "SELLS"];
        case "status":
        case "orderstatus":
          return ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
        case "role":
        case "userrole":
          return ["USER", "ADMIN", "MANAGER"];
        case "type":
          return ["TYPE_A", "TYPE_B", "TYPE_C"];
        default:
          return ["VALUE_1", "VALUE_2", "VALUE_3"];
      }
    }

    // Handle direct enum values array like ['value1', 'value2']
    const arrayMatch = enumString.match(/\[([^\]]+)\]/);
    if (arrayMatch) {
      const values = arrayMatch[1].split(",").map((v) => v.trim().replace(/['"]/g, ""));
      return values;
    }

    // Handle inline enum object like {VALUE1: 'value1', VALUE2: 'value2'}
    const objectMatch = enumString.match(/\{([^}]+)\}/);
    if (objectMatch) {
      const entries = objectMatch[1].split(",");
      const values: string[] = [];
      for (const entry of entries) {
        const valueMatch = entry.match(/:\s*['"]([^'"]+)['"]/);
        if (valueMatch) {
          values.push(valueMatch[1]);
        }
      }
      return values;
    }

    // If we can't parse the enum, fallback to string validation
    return [];
  }
  private async generateModuleForEntity(entity: EntityInfo): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const moduleDir = path.join(this.modulesPath, moduleName);

    // Create module directory if it doesn't exist
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true });
    }

    // Generate each file
    await this.generateAdminController(entity, moduleDir);
    await this.generateClientController(entity, moduleDir);
    await this.generateAdminService(entity, moduleDir);
    await this.generateClientService(entity, moduleDir);
    await this.generateRepository(entity, moduleDir);
    await this.generateAdminRoute(entity, moduleDir);
    await this.generateClientRoute(entity, moduleDir);
    await this.generateSelect(entity, moduleDir);
    await this.generateValidator(entity, moduleDir);
    await this.generateModuleContainer(entity, moduleDir);
    await this.generateModuleType(entity, moduleDir);
    // await this.generateIndex(entity, moduleDir);
  }

  private generateTypesName(moduleName: string): string {
    return Utils.convertCamelToSnakeCase(moduleName).toUpperCase() + "_TYPES";
  }

  private async generateIndex(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `index.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Index already exists: ${fileName}`);
      return;
    }

    const content = `
      export * from "./admin.${moduleName}.route";
      export * from "./client.${moduleName}.route";
      export * from "./${moduleName}.container";
      export * from "./${moduleName}.controller";
      export * from "./${moduleName}.repository";
      export * from "./${moduleName}.select";
      export * from "./${moduleName}.service";
      export * from "./${moduleName}.types";
      export * from "./${moduleName}.validator";
    `;

    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private async generateAdminController(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `admin.${moduleName}.controller.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Controller already exists: ${fileName}`);
      return;
    }

    const content = `import { injectable, inject } from "inversify";
    import { Admin${entity.name}Service } from "./admin.${moduleName}.service";
    import { ${this.generateTypesName(moduleName)} } from "./${moduleName}.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class Admin${entity.name}Controller extends BaseController<Admin${entity.name}Service> {
      constructor(@inject(${this.generateTypesName(moduleName)}.Admin${entity.name}Service) protected service: Admin${
        entity.name
      }Service) {
        super(service);
      }
    }
    `;

    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private async generateClientController(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `client.${moduleName}.controller.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Controller already exists: ${fileName}`);
      return;
    }

    const content = `import { injectable, inject } from "inversify";
    import { Client${entity.name}Service } from "./client.${moduleName}.service";
    import { ${this.generateTypesName(moduleName)} } from "./${moduleName}.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class Client${entity.name}Controller extends BaseController<Client${entity.name}Service> {
      constructor(@inject(${this.generateTypesName(moduleName)}.Client${entity.name}Service) protected service: Client${
        entity.name
      }Service) {
        super(service);
      }
    }
    `;

    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private async generateAdminService(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `admin.${moduleName}.service.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Service already exists: ${fileName}`);
      return;
    }

    const content = `import { injectable, inject } from "inversify";
    import { BaseService } from "@/shared/base/BaseService";
    import { ${entity.name}Repository } from "./${moduleName}.repository";
    import { TransactionManager } from "@/shared/base/TransactionManager";
    import { ${this.generateTypesName(moduleName)} } from "./${moduleName}.types";
    import { COMMON_TYPES } from "../common/common.types";
    import { ${entity.name} } from "@/database/models/${entity.name}";
    import { ${entity.name}Relations, ${entity.name}SelectFull } from "./${moduleName}.select";

    @injectable()
    export class Admin${entity.name}Service extends BaseService<${entity.name}> {
      protected relations = ${entity.name}Relations;
      protected selectedFields = ${entity.name}SelectFull;
      constructor(
        @inject(${this.generateTypesName(moduleName)}.${entity.name}Repository) private ${moduleName}Repository: ${
          entity.name
        }Repository,
        @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager
      ) {
        super(${moduleName}Repository);
      }
    }
`;

    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private async generateClientService(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `client.${moduleName}.service.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Service already exists: ${fileName}`);
      return;
    }

    const content = `import { injectable, inject } from "inversify";
    import { BaseService } from "@/shared/base/BaseService";
    import { ${entity.name}Repository } from "./${moduleName}.repository";
    import { TransactionManager } from "@/shared/base/TransactionManager";
    import { ${this.generateTypesName(moduleName)} } from "./${moduleName}.types";
    import { COMMON_TYPES } from "../common/common.types";
    import { ${entity.name} } from "@/database/models/${entity.name}";
    import { ${entity.name}Relations, ${entity.name}SelectFull } from "./${moduleName}.select";

    @injectable()
    export class Client${entity.name}Service extends BaseService<${entity.name}> {
      protected relations = ${entity.name}Relations;
      protected selectedFields = ${entity.name}SelectFull;
      constructor(
        @inject(${this.generateTypesName(moduleName)}.${entity.name}Repository) private ${moduleName}Repository: ${
          entity.name
        }Repository,
        @inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager
      ) {
        super(${moduleName}Repository);
      }
    }
`;

    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private async generateRepository(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `${moduleName}.repository.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Repository already exists: ${fileName}`);
      return;
    }

    const content = `import { BaseRepository } from "@/shared/base/BaseRepository";
    import { ${entity.name} } from "@/database/models/${entity.name}";
    import { FindOptionsSelect } from "typeorm";
    import { ${entity.name}SelectFull, ${entity.name}Relations } from "./${moduleName}.select";
    import { injectable, inject } from "inversify";

    @injectable()
    export class ${entity.name}Repository extends BaseRepository<${entity.name}> {
      protected entityClass = ${entity.name};
      protected selectedFields = ${entity.name}SelectFull;
      protected relations = ${entity.name}Relations;

      constructor() {
        super();
        this.setOptions();
      }

      setOptions(selectedFields?: FindOptionsSelect<${entity.name}> | undefined): void {
        this.selectedFields = selectedFields || ${entity.name}SelectFull;
        this.relations = ${entity.name}Relations;
      }
    }
    `;

    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private async generateModuleType(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `${moduleName}.types.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Type already exists: ${fileName}`);
      return;
    }

    const content = `export const ${this.generateTypesName(moduleName)} = {
      Admin${entity.name}Router: Symbol.for("Admin${entity.name}Router"),
      Client${entity.name}Router: Symbol.for("Client${entity.name}Router"),
      Admin${entity.name}Controller: Symbol.for("Admin${entity.name}Controller"),
      Client${entity.name}Controller: Symbol.for("Client${entity.name}Controller"),
      Admin${entity.name}Service: Symbol.for("Admin${entity.name}Service"),
      Client${entity.name}Service: Symbol.for("Client${entity.name}Service"),
      ${entity.name}Repository: Symbol.for("${moduleName}Repository"),
    };
    `;

    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private async generateModuleContainer(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `${moduleName}.container.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Container already exists: ${fileName}`);
      return;
    }

    const content = `
    import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
    import {Admin${entity.name}Controller} from "./admin.${moduleName}.controller";
    import {Client${entity.name}Controller} from "./client.${moduleName}.controller";
    import {Admin${entity.name}Service} from "./admin.${moduleName}.service";
    import {Client${entity.name}Service} from "./client.${moduleName}.service";
    import {${entity.name}Repository} from "./${moduleName}.repository";
    import {Admin${entity.name}Router} from "./admin.${moduleName}.route";
    import {Client${entity.name}Router} from "./client.${moduleName}.route";
    import {${this.generateTypesName(moduleName)} } from "./${moduleName}.types";



    const ${moduleName}Module = new ContainerModule((options: ContainerModuleLoadOptions) => {
      options.bind<Admin${entity.name}Service>(${this.generateTypesName(moduleName)}.Admin${
        entity.name
      }Service).to(Admin${entity.name}Service);
      options.bind<Admin${entity.name}Controller>(${this.generateTypesName(moduleName)}.Admin${
        entity.name
      }Controller).to(Admin${entity.name}Controller);
      options.bind<Admin${entity.name}Router>(${this.generateTypesName(moduleName)}.Admin${
        entity.name
      }Router).to(Admin${entity.name}Router);

    options.bind<Client${entity.name}Service>(${this.generateTypesName(moduleName)}.Client${
      entity.name
    }Service).to(Client${entity.name}Service);
      options.bind<Client${entity.name}Controller>(${this.generateTypesName(moduleName)}.Client${
        entity.name
      }Controller).to(Client${entity.name}Controller);
      options.bind<Client${entity.name}Router>(${this.generateTypesName(moduleName)}.Client${
        entity.name
      }Router).to(Client${entity.name}Router);
     options.bind<${entity.name}Repository>(${this.generateTypesName(moduleName)}.${entity.name}Repository).to(${
       entity.name
     }Repository);
    });

    export { ${moduleName}Module };`;

    fs.writeFileSync(filePath, content);
  }

  private async generateAdminRoute(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `admin.${moduleName}.route.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Route already exists: ${fileName}`);
      return;
    }

    const content = `import { Router } from "express";
    import { injectable, inject } from "inversify";
    import { Admin${entity.name}Controller } from "./admin.${moduleName}.controller";
    import { zodValidate } from "@/shared/middleware/validation.middleware";
    
    import { Create${entity.name}Schema, Update${entity.name}Schema, ${entity.name}QuerySchema, ${
      entity.name
    }ParamsSchema } from "./${moduleName}.validator";
    import { ${this.generateTypesName(moduleName)} } from "./${moduleName}.types";

    @injectable()
    export class Admin${entity.name}Router {
      private router: Router;

      constructor(@inject(${this.generateTypesName(moduleName)}.Admin${
        entity.name
      }Controller) private ${moduleName}Controller: Admin${entity.name}Controller) {
        this.router = Router();
        this.initializeRoutes();
      }

      private initializeRoutes(): void {
        // All ${moduleName} routes require authentication
        // this.router.use(authenticate);

        // GET /${moduleName}s - Get all ${moduleName}s with filters
        this.router.get("/", zodValidate(${
          entity.name
        }QuerySchema, "query"), this.${moduleName}Controller.getAllWithPagination);

        // POST /${moduleName}s - Create new ${moduleName}
        this.router.post("/", zodValidate(Create${entity.name}Schema, "body"), this.${moduleName}Controller.create);

        // GET /${moduleName}s/:id - Get ${moduleName} by ID
        this.router.get("/:id", zodValidate(${
          entity.name
        }ParamsSchema, "params"), this.${moduleName}Controller.getById);

        // PUT /${moduleName}s/:id - Update ${moduleName}
        this.router.put(
          "/:id",
          zodValidate(${entity.name}ParamsSchema, "params"),
          zodValidate(Update${entity.name}Schema, "body"),
          this.${moduleName}Controller.update
        );

        // DELETE /${moduleName}s/:id - Delete ${moduleName}
        this.router.delete("/:id", zodValidate(${
          entity.name
        }ParamsSchema, "params"), this.${moduleName}Controller.delete);
      }

      public getRouter(): Router {
        return this.router;
      }
    }
    `;

    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private async generateClientRoute(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `client.${moduleName}.route.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Route already exists: ${fileName}`);
      return;
    }

    const content = `import { Router } from "express";
    import { injectable, inject } from "inversify";
    import { Client${entity.name}Controller } from "./client.${moduleName}.controller";
    import { zodValidate } from "@/shared/middleware/validation.middleware";
    
    import { Create${entity.name}Schema, Update${entity.name}Schema, ${entity.name}QuerySchema, ${
      entity.name
    }ParamsSchema } from "./${moduleName}.validator";
    import { ${this.generateTypesName(moduleName)} } from "./${moduleName}.types";

    @injectable()
    export class Client${entity.name}Router {
      private router: Router;

      constructor(@inject(${this.generateTypesName(moduleName)}.Client${
        entity.name
      }Controller) private ${moduleName}Controller: Client${entity.name}Controller) {
        this.router = Router();
        this.initializeRoutes();
      }

      private initializeRoutes(): void {
        // All ${moduleName} routes require authentication
        // this.router.use(authenticate);

        // GET /${moduleName}s - Get all ${moduleName}s with filters
        this.router.get("/", zodValidate(${
          entity.name
        }QuerySchema, "query"), this.${moduleName}Controller.getAllWithPagination);

        // POST /${moduleName}s - Create new ${moduleName}
        this.router.post("/", zodValidate(Create${entity.name}Schema, "body"), this.${moduleName}Controller.create);

        // GET /${moduleName}s/:id - Get ${moduleName} by ID
        this.router.get("/:id", zodValidate(${
          entity.name
        }ParamsSchema, "params"), this.${moduleName}Controller.getById);

        // PUT /${moduleName}s/:id - Update ${moduleName}
        this.router.put(
          "/:id",
          zodValidate(${entity.name}ParamsSchema, "params"),
          zodValidate(Update${entity.name}Schema, "body"),
          this.${moduleName}Controller.update
        );

        // DELETE /${moduleName}s/:id - Delete ${moduleName}
        this.router.delete("/:id", zodValidate(${
          entity.name
        }ParamsSchema, "params"), this.${moduleName}Controller.delete);
      }

      public getRouter(): Router {
        return this.router;
      }
    }
    `;

    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private async generateSelect(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `${moduleName}.select.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Select already exists: ${fileName}`);
      return;
    }

    // Generate basic select fields from columns
    const basicFields = ["id"];
    entity.columns.forEach((col) => {
      if (!basicFields.includes(col.name)) {
        basicFields.push(col.name);
      }
    });

    let selectRelations = "";
    entity.columns.forEach((col) => {
      if (col.propertyType === "object") {
        // Assuming relations are named like "relatedEntity"
        const relationName = col.name.charAt(0).toUpperCase() + col.name.slice(1);
        selectRelations += `  ${relationName}: true,\n`;
      }
    });

    const selectFields = basicFields.map((field) => `  ${field}: true`).join(",\n");

    const content = `import { ${entity.name} } from "@/database/models/${entity.name}";
    import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

    export const ${entity.name}SelectBasic: FindOptionsSelect<${entity.name}> = {
      ${selectFields},
      note: true
    };

    export const ${entity.name}SelectFull: FindOptionsSelect<${entity.name}> = {
      ...${entity.name}SelectBasic,
    };

    export const ${entity.name}Relations: FindOptionsRelations<${entity.name}> = {
      ${selectRelations}
    };`;

    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private async generateValidator(entity: EntityInfo, moduleDir: string): Promise<void> {
    const moduleName = this.toCamelCase(entity.name);
    const fileName = `${moduleName}.validator.ts`;
    const filePath = path.join(moduleDir, fileName);

    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`  Validator already exists: ${fileName}`);
      return;
    }

    const content = this.generateValidatorContent(entity.name, entity.columns);
    fs.writeFileSync(filePath, content);
    console.log(`  Generated: ${fileName}`);
  }

  private generateValidatorContent(className: string, columns: ColumnInfo[]): string {
    const imports = `import { z } from "zod";\nimport { BaseSchema } from "@/shared/base/BaseSchema";`;

    const createSchemaFields = columns
      .filter((col) => !["id", "createdAt", "updatedAt", "deletedAt", "refreshToken"].includes(col.name))
      .map((col) => {
        let field = `  ${col.name}: ${col.type}`;
        if (col.isOptional) {
          field += ".optional()";
        }
        return field;
      })
      .join(",\n");

    const updateSchemaFields = columns
      .filter((col) => !["id", "createdAt", "updatedAt", "deletedAt"].includes(col.name))
      .map((col) => {
        // For update schema, create a version without required messages
        let updateType = col.type;

        // Remove required messages for update schema
        if (updateType.includes("{ message:") && updateType.includes('.required"')) {
          // Handle z.enum case
          if (updateType.startsWith("z.enum(")) {
            const enumMatch = updateType.match(/z\.enum\(\[([^\]]+)\]/);
            if (enumMatch) {
              updateType = `z.enum([${enumMatch[1]}], { message: "${col.name}.invalid" })`;
            }
          } else {
            // Handle other types
            updateType = updateType.replace(/{ message: "[^"]*\.required" }/, `{ message: "${col.name}.invalid" }`);
            updateType = updateType.replace(/z\.(\w+)\(\)/, `z.$1(${col.name}.invalid)`);
          }
        }

        return `  ${col.name}: ${updateType}.optional()`;
      })
      .join(",\n");

    const schemas = `
      export const Create${className}Schema = z.object({${createSchemaFields} , note: z.string().nullish() });
      export const Update${className}Schema = z.object({ ${updateSchemaFields}, note: z.string().nullish() });

      export const ${className}QuerySchema = BaseSchema.extend({});

      export const ${className}ParamsSchema = z.object({
        id: z.uuid(),
      });`;

    const types = `
      export type Create${className}Dto = z.infer<typeof Create${className}Schema>;
      export type Update${className}Dto = z.infer<typeof Update${className}Schema>;
      export type ${className}QueryDto = z.infer<typeof ${className}QuerySchema>;
      export type ${className}ParamsDto = z.infer<typeof ${className}ParamsSchema>;`;

    return imports + schemas + types;
  }

  /**
   * Convert PascalCase to camelCase
   * ProductAttribute -> productAttribute
   * User -> user
   */
  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const generator = new ModuleGenerator();

  if (args.length === 0) {
    // Generate all modules
    generator
      .generateAllModules()
      .then(() => {
        console.log("All modules generated successfully!");
      })
      .catch((error) => {
        console.error("Error generating modules:", error);
        process.exit(1);
      });
  } else if (args[0] === "list") {
    // List available entities
    try {
      const entities = generator.listEntities();
      console.log("Available entities:");
      entities.forEach((entity) => console.log(`  - ${entity}`));
    } catch (error) {
      console.error("Error listing entities:", error);
      process.exit(1);
    }
  } else if (args[0] === "generate" && args[1]) {
    // Generate specific module
    const entityName = args[1];
    generator
      .generateModuleByName(entityName)
      .then(() => {
        console.log(`Module for ${entityName} generated successfully!`);
      })
      .catch((error) => {
        console.error("Error generating module:", error);
        process.exit(1);
      });
  } else {
    console.log("Usage:");
    console.log("  npx ts-node generateModuleAuto.utils.ts                    # Generate all modules");
    console.log("  npx ts-node generateModuleAuto.utils.ts list               # List available entities");
    console.log("  npx ts-node generateModuleAuto.utils.ts generate <entity>  # Generate specific module");
    console.log("");
    console.log("Examples:");
    console.log("  npx ts-node generateModuleAuto.utils.ts");
    console.log("  npx ts-node generateModuleAuto.utils.ts list");
    console.log("  npx ts-node generateModuleAuto.utils.ts generate User");
  }
}
