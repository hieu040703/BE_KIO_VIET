import {
  calculateEstimatedAvailableHours,
  getLatestEstimatedCompletionAtByEmployeeId,
} from "../employee.availability";

describe("employee availability", () => {
  const now = new Date("2026-09-09T10:00:00.000Z");

  it("selects the latest estimated completion time for each employee", () => {
    const result = getLatestEstimatedCompletionAtByEmployeeId([
      {
        employeeId: "employee-1",
        estimatedCompletionAt: "2026-09-09T12:00:00.000Z",
      },
      {
        employeeId: "employee-1",
        estimatedCompletionAt: "2026-09-09T14:00:00.000Z",
      },
      {
        employeeId: "employee-2",
        estimatedCompletionAt: "2026-09-09T11:30:00.000Z",
      },
    ]);

    expect(result.get("employee-1")).toEqual(new Date("2026-09-09T14:00:00.000Z"));
    expect(result.get("employee-2")).toEqual(new Date("2026-09-09T11:30:00.000Z"));
  });

  it("returns the remaining time in hours", () => {
    expect(
      calculateEstimatedAvailableHours(new Date("2026-09-09T12:30:00.000Z"), now),
    ).toBe(2.5);
  });

  it("returns null when there is no valid estimated completion time", () => {
    expect(calculateEstimatedAvailableHours(null, now)).toBeNull();
    expect(
      getLatestEstimatedCompletionAtByEmployeeId([
        { employeeId: "employee-1", estimatedCompletionAt: null },
        { employeeId: "employee-2", estimatedCompletionAt: "invalid-date" },
      ]),
    ).toEqual(new Map());
  });
});
