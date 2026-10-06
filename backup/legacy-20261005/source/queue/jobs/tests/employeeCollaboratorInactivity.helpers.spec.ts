import {
  hasCollaboratorWorkedWithinInactivityWindow,
  shouldDeactivateCollaborator,
} from "../employeeCollaboratorInactivity.helpers";

describe("employee collaborator inactivity rule", () => {
  const now = new Date("2026-08-13T01:00:00.000+07:00");

  it("deactivates a collaborator without any recorded work", () => {
    expect(shouldDeactivateCollaborator(null, now)).toBe(true);
  });

  it("keeps a collaborator whose work is within the last five days", () => {
    expect(
      hasCollaboratorWorkedWithinInactivityWindow(new Date("2026-08-08T01:00:00.000+07:00"), now),
    ).toBe(true);
    expect(shouldDeactivateCollaborator(new Date("2026-08-08T01:00:00.000+07:00"), now)).toBe(false);
  });

  it("deactivates a collaborator whose last work is older than five days", () => {
    expect(
      hasCollaboratorWorkedWithinInactivityWindow(new Date("2026-08-08T00:59:59.000+07:00"), now),
    ).toBe(false);
    expect(shouldDeactivateCollaborator(new Date("2026-08-08T00:59:59.000+07:00"), now)).toBe(true);
  });

  it("does not treat future work as a past work record", () => {
    expect(
      hasCollaboratorWorkedWithinInactivityWindow(new Date("2026-08-14T01:00:00.000+07:00"), now),
    ).toBe(false);
  });

  it("uses the employee start date when there is no previously worked contract", () => {
    expect(
      shouldDeactivateCollaborator(
        null,
        now,
        new Date("2026-08-09T00:00:00.000+07:00"),
      ),
    ).toBe(false);
  });

  it("deactivates an employee whose fallback start date is older than five days", () => {
    expect(
      shouldDeactivateCollaborator(
        null,
        now,
        new Date("2026-08-07T00:00:00.000+07:00"),
      ),
    ).toBe(true);
  });

  it("deactivates an employee immediately when both the latest contract and start date are missing", () => {
    expect(shouldDeactivateCollaborator(null, now, null)).toBe(true);
  });

  it("prioritizes the latest worked contract over the employee start date", () => {
    expect(
      shouldDeactivateCollaborator(
        new Date("2026-08-09T00:00:00.000+07:00"),
        now,
        new Date("2026-07-01T00:00:00.000+07:00"),
      ),
    ).toBe(false);
  });

  it("does not use a recent start date when the latest worked contract is already inactive", () => {
    expect(
      shouldDeactivateCollaborator(
        new Date("2026-08-07T00:00:00.000+07:00"),
        now,
        new Date("2026-08-12T00:00:00.000+07:00"),
      ),
    ).toBe(true);
  });
});
