import "reflect-metadata";

import fs from "node:fs";
import path from "node:path";

import { ZaloMessageHistory } from "@/database/models/ZaloMessageHistory";
import { getMetadataArgsStorage } from "typeorm";

describe("ZaloMessageHistory order delete contract", () => {
  it("cascades history rows when the related order is deleted", () => {
    const orderRelation = getMetadataArgsStorage().relations.find(
      (relation) =>
        relation.target === ZaloMessageHistory &&
        relation.propertyName === "order",
    );
    const migrationSource = fs.readFileSync(
      path.resolve(
        __dirname,
        "../../../../database/migrations/1779200000000-SetCascadeOnDeleteForZaloMessageHistories.ts",
      ),
      "utf8",
    );

    expect(orderRelation?.options.onDelete).toBe("CASCADE");
    expect(migrationSource).toContain('ALTER TABLE "zalo_message_histories"');
    expect(migrationSource).toContain('REFERENCES "orders"("id")');
    expect(migrationSource).toContain("ON DELETE CASCADE");
  });
});
