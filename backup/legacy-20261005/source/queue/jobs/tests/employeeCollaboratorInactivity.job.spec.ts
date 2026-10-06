jest.mock("@/modules/container", () => ({
  container: {
    get: jest.fn(),
  },
}));
jest.mock("@/shared/utils/logger", () => ({
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

import { container } from "@/modules/container";
import { EmployeeStatusType, PositionDefaultEnum } from "@/shared/constants/constance";
import { COLLABORATOR_INACTIVITY_NOTE } from "../employeeCollaboratorInactivity.helpers";
import {
  deactivateInactiveCollaborators,
  EMPLOYEE_COLLABORATOR_INACTIVITY_CRON,
} from "../employeeCollaboratorInactivity.job";

describe("deactivateInactiveCollaborators", () => {
  it("is scheduled for 01:00 every day", () => {
    expect(EMPLOYEE_COLLABORATOR_INACTIVITY_CRON).toBe("0 0 1 * * *");
  });

  it("updates only active collaborators without recent started work", async () => {
    const query = jest.fn().mockResolvedValue([{ id: "employee-1" }, { id: "employee-2" }]);
    (container.get as jest.Mock).mockReturnValue({
      getRepository: () => ({ manager: { query } }),
    });
    const now = new Date("2026-08-13T01:00:00.000+07:00");

    await expect(deactivateInactiveCollaborators(now)).resolves.toBe(2);

    expect(query).toHaveBeenCalledTimes(1);
    const [statement, parameters] = query.mock.calls[0] as [string, unknown[]];
    expect(statement).toContain('employee."position" = $3');
    expect(statement).toContain('employee."status" = $4');
    expect(statement).toContain('order_employee."startTime" IS NOT NULL');
    expect(statement).toContain('order_employee."timeAt" <= $6');
    expect(statement).toContain('employee."startDate"');
    expect(statement).toContain('ORDER BY order_employee."timeAt" DESC');
    expect(statement).toContain('LIMIT 1');
    expect(statement).toContain('candidate."inactivityReferenceAt" IS NULL');
    expect(statement).toContain('candidate."inactivityReferenceAt" < $5');
    expect(parameters).toEqual([
      EmployeeStatusType.INACTIVE,
      COLLABORATOR_INACTIVITY_NOTE,
      PositionDefaultEnum.COLLABORATORS,
      EmployeeStatusType.ACTIVE,
      new Date("2026-08-08T01:00:00.000+07:00"),
      now,
    ]);
  });
});
