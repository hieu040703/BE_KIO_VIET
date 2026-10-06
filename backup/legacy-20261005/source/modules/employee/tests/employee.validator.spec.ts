import { PositionDefaultEnum } from "@/shared/constants/constance";
import { CreateEmployeeSchema, UpdateEmployeeSchema } from "../employee.validator";

describe("employee.validator position enum contract", () => {
  it("accepts PositionDefaultEnum values in create payloads", () => {
    const parsed = CreateEmployeeSchema.parse({
      branchId: "11111111-1111-4111-8111-111111111111",
      name: "Nguyen Van A",
      position: PositionDefaultEnum.BRANCH_MANAGER,
    });

    expect(parsed.position).toBe(PositionDefaultEnum.BRANCH_MANAGER);
  });

  it("accepts null position in update payloads", () => {
    const parsed = UpdateEmployeeSchema.parse({
      position: null,
    });

    expect(parsed.position).toBeNull();
  });

  it("rejects arbitrary string positions", () => {
    const result = CreateEmployeeSchema.safeParse({
      branchId: "11111111-1111-4111-8111-111111111111",
      name: "Nguyen Van B",
      position: "Truong phong",
    });

    expect(result.success).toBe(false);
  });

  it("accepts expertise as a string array in create payloads", () => {
    const parsed = CreateEmployeeSchema.parse({
      branchId: "11111111-1111-4111-8111-111111111111",
      name: "Nguyen Van C",
      expertise: ["Đóng gói", "Nâng hạ"],
    });

    expect(parsed.expertise).toEqual(["Đóng gói", "Nâng hạ"]);
  });

  it("accepts expertise as a string array in update payloads", () => {
    const parsed = UpdateEmployeeSchema.parse({
      expertise: ["Đóng gói"],
    });

    expect(parsed.expertise).toEqual(["Đóng gói"]);
  });

  it("rejects non-string expertise values", () => {
    const result = CreateEmployeeSchema.safeParse({
      branchId: "11111111-1111-4111-8111-111111111111",
      name: "Nguyen Van D",
      expertise: ["Đóng gói", 12],
    });

    expect(result.success).toBe(false);
  });
});
