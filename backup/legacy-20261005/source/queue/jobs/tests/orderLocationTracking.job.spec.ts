jest.mock("@/modules/container", () => ({
  container: { get: jest.fn() },
}));

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

import { buildCronExpression } from "../orderLocationTracking.job";

describe("buildCronExpression", () => {
  it("schedules a 60-second interval once per minute", () => {
    expect(buildCronExpression(60)).toBe("0 */1 * * * *");
  });

  it("keeps intervals shorter than one minute in the seconds field", () => {
    expect(buildCronExpression(30)).toBe("*/30 * * * * *");
  });
});
