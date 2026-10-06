import { UserRoleEnum } from "@/shared/constants/constance";
import { UpdateManagerSchema } from "../user.validator";

describe("UpdateManagerSchema", () => {
  it("keeps the selected system manager role", () => {
    const result = UpdateManagerSchema.parse({ role: UserRoleEnum.MANAGER });

    expect(result.role).toBe(UserRoleEnum.MANAGER);
  });

  it("keeps the selected employee role", () => {
    const result = UpdateManagerSchema.parse({ role: UserRoleEnum.EMPLOYEE });

    expect(result.role).toBe(UserRoleEnum.EMPLOYEE);
  });
});
