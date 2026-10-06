import { IAddress } from "../common/common.validator";

export type CheckInCoordinate = {
  latitude: number;
  longitude: number;
};

export type ServiceOrderCheckInResult = {
  isWithinThreshold: boolean;
  nearestDistanceMeters: number;
};

type NullableCoordinate = {
  latitude?: number | null;
  longitude?: number | null;
};

const toRadians = (value: number): number => (value * Math.PI) / 180;

const isValidCoordinate = (coordinate?: NullableCoordinate | null): coordinate is CheckInCoordinate => {
  return Number.isFinite(Number(coordinate?.latitude)) && Number.isFinite(Number(coordinate?.longitude));
};

export const calculateAerialDistanceMeters = (origin: CheckInCoordinate, destination: CheckInCoordinate): number => {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLng = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
};

export const evaluateServiceOrderCheckIn = (input: {
  employeeLocation: CheckInCoordinate;
  addresses: Array<Pick<IAddress, "latitude" | "longitude"> | null | undefined>;
  thresholdMeters: number;
}): ServiceOrderCheckInResult => {
  const workCoordinates = input.addresses.filter(isValidCoordinate);

  if (!isValidCoordinate(input.employeeLocation) || workCoordinates.length === 0) {
    return {
      isWithinThreshold: false,
      nearestDistanceMeters: Number.POSITIVE_INFINITY,
    };
  }

  const nearestDistanceMeters = Math.min(
    ...workCoordinates.map((coordinate) => calculateAerialDistanceMeters(input.employeeLocation, coordinate)),
  );

  return {
    isWithinThreshold: nearestDistanceMeters <= input.thresholdMeters,
    nearestDistanceMeters,
  };
};
