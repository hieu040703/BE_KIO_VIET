import { resolveOrderEmployeeDefaultNote } from "../orderEmployee.helpers";

describe("resolveOrderEmployeeDefaultNote", () => {
  it("defaults note from order address detail when note is missing", () => {
    expect(resolveOrderEmployeeDefaultNote(undefined, "123 Nguyen Van Cu")).toBe("123 Nguyen Van Cu");
  });

  it("keeps the provided note instead of overwriting it", () => {
    expect(resolveOrderEmployeeDefaultNote("Ghi chu rieng", "123 Nguyen Van Cu")).toBe("Ghi chu rieng");
  });

  it("keeps an empty result when both note and address detail are missing", () => {
    expect(resolveOrderEmployeeDefaultNote(undefined, undefined)).toBeUndefined();
  });
});
