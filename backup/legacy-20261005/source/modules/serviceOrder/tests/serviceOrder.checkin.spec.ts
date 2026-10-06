import { evaluateServiceOrderCheckIn } from "../serviceOrder.checkin";

describe("evaluateServiceOrderCheckIn", () => {
  it("allows checkin when employee location is within threshold of any work address", () => {
    const result = evaluateServiceOrderCheckIn({
      employeeLocation: { latitude: 21.02917, longitude: 105.77728 },
      addresses: [
        { latitude: 20.99812, longitude: 105.7212 },
        { latitude: 21.02917, longitude: 105.77728 },
      ],
      thresholdMeters: 50,
    });

    expect(result.isWithinThreshold).toBe(true);
    expect(result.nearestDistanceMeters).toBe(0);
  });

  it("rejects checkin when every work address is outside threshold", () => {
    const result = evaluateServiceOrderCheckIn({
      employeeLocation: { latitude: 21.02917, longitude: 105.77728 },
      addresses: [{ latitude: 20.99812, longitude: 105.7212 }],
      thresholdMeters: 50,
    });

    expect(result.isWithinThreshold).toBe(false);
    expect(result.nearestDistanceMeters).toBeGreaterThan(50);
  });
});
