import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import fs from "node:fs";
import path from "node:path";

import { Ticket } from "@/database/models/Ticket";
import { getMetadataArgsStorage } from "typeorm";

describe("Ticket serviceOrder delete contract", () => {
  it("keeps the entity relation and migration aligned on ON DELETE SET NULL", () => {
    const serviceOrderRelation = getMetadataArgsStorage().relations.find(
      (relation) => relation.target === Ticket && relation.propertyName === "serviceOrder",
    );
    const migrationSource = fs.readFileSync(
      path.resolve(
        __dirname,
        "../../../database/migrations/1777500000000-SetNullOnDeleteForTicketServiceOrder.ts",
      ),
      "utf8",
    );

    expect(serviceOrderRelation?.options.nullable).toBe(true);
    expect(serviceOrderRelation?.options.onDelete).toBe("SET NULL");
    expect(migrationSource).toContain('ALTER TABLE "tickets"');
    expect(migrationSource).toContain('REFERENCES "service_orders"("id")');
    expect(migrationSource).toContain("ON DELETE SET NULL");
  });
});
