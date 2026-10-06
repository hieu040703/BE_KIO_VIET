import { createHash } from "crypto";
import { inject, injectable } from "inversify";
import { Request } from "express";
import { AppError, BadRequestError, ForbiddenError, NotFoundError, ServiceUnavailableError, UnauthorizedError } from "@/shared/types/errors";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { IAddress } from "@/modules/common/common.validator";
import { config } from "@/shared/config/env";
import { GOOGLE_MAP_TYPES } from "./googleMap.types";
import { GoogleMapCacheService } from "./googleMap.cache.service";
import { GoogleMapRepository, OrderTrackingContext } from "./googleMap.repository";
import {
  GeocodeQueryDto,
  ReverseGeocodeQueryDto,
  UpdateManagerLocationDto,
} from "./googleMap.validator";
import { OrderManagerLocation } from "@/database/models/OrderManagerLocation";
import { UserRepository } from "../user/user.repository";
import { USER_TYPES } from "../user/user.types";
import { OrderStatusEnum, ServiceOrderStatusEnum } from "@/shared/constants/constance";
import {
  buildOrderTrackingCommandPayload,
  emitOrderTrackingToUsers,
  getOrderTrackingRoomId,
  ORDER_TRACKING_EVENTS,
} from "./orderTracking.socket";

type TrackingStatus = "on_the_way" | "arrived" | "offline" | "no_recent_data";

type GoogleGeocodeResult = {
  formattedAddress: string;
  placeId: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  locationType: string | null;
  types: string[];
  addressComponents: Array<{
    longName: string;
    shortName: string;
    types: string[];
  }>;
};

type OrderTrackingPayload = {
  orderId: string;
  serviceOrderId: string | null;
  trackingRoomId: string;
  employeeId: string | null;
  status: TrackingStatus;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    speedMetersPerSecond: number | null;
    heading: number | null;
    capturedAt: string;
    source: string;
    distanceFromPreviousMeters: number | null;
  } | null;
  destination: {
    latitude: number;
    longitude: number;
  } | null;
  distanceMeters: number | null;
  etaMinutes: number | null;
  etaSource: "arrived" | "device_speed" | "historical_speed" | "average_speed" | null;
  lastUpdatedAt: string | null;
};

const toRadians = (value: number): number => (value * Math.PI) / 180;

const haversineDistanceMeters = (
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
): number => {
  const earthRadiusMeters = 6371000;
  const deltaLatitude = toRadians(endLatitude - startLatitude);
  const deltaLongitude = toRadians(endLongitude - startLongitude);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(toRadians(startLatitude)) *
      Math.cos(toRadians(endLatitude)) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
};

const roundNumber = (value: number | null, digits: number = 2): number | null => {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return Number(value.toFixed(digits));
};

const hashValue = (payload: unknown): string => {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
};

const getDestinationAddress = (orderContext: OrderTrackingContext): IAddress | null => {
  return orderContext.address ?? orderContext.deliveryAddress ?? orderContext.customerAddress ?? null;
};

const hasCoordinates = (address: IAddress | null | undefined): address is IAddress => {
  return (
    !!address &&
    typeof address.latitude === "number" &&
    Number.isFinite(address.latitude) &&
    typeof address.longitude === "number" &&
    Number.isFinite(address.longitude)
  );
};

const formatLocation = (location: OrderManagerLocation) => {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    speedMetersPerSecond: location.speedMetersPerSecond,
    heading: location.heading,
    capturedAt: location.capturedAt.toISOString(),
    source: location.source,
    distanceFromPreviousMeters: roundNumber(location.distanceFromPreviousMeters),
  };
};

@injectable()
export class GoogleMapService {
  constructor(
    @inject(GOOGLE_MAP_TYPES.GoogleMapRepository) private readonly googleMapRepository: GoogleMapRepository,
    @inject(GOOGLE_MAP_TYPES.GoogleMapCacheService) private readonly cacheService: GoogleMapCacheService,
    @inject(USER_TYPES.UserRepository) private readonly userRepository: UserRepository,
  ) {}

  private buildTrackingCacheKey(orderId: string): string {
    return `google-maps:tracking:${orderId}`;
  }

  private isTrackingActive(orderContext: OrderTrackingContext): boolean {
    const activeOrderStatuses = [OrderStatusEnum.PENDING, OrderStatusEnum.PROCESSING];
    const activeServiceOrderStatuses = [ServiceOrderStatusEnum.CONFIRMED, ServiceOrderStatusEnum.PROCESSING];

    if (!activeOrderStatuses.includes(orderContext.orderStatus)) {
      return false;
    }

    if (orderContext.serviceOrderId && orderContext.serviceOrderStatus) {
      return activeServiceOrderStatuses.includes(orderContext.serviceOrderStatus);
    }

    return true;
  }

  private buildGeocodeCacheKey(type: "geocode" | "reverse-geocode", payload: unknown): string {
    return `google-maps:${type}:${hashValue(payload)}`;
  }

  private buildDailyQuotaKey(): string {
    return `google-maps:daily-quota:${new Date().toISOString().slice(0, 10)}`;
  }

  private ensureManagerEmployeeId(req?: Request): string {
    const employeeId = req?.user?.employeeId;

    if (!employeeId) {
      throw new UnauthorizedError("Tài khoản hiện tại chưa gắn với nhân viên quản lý");
    }

    return employeeId;
  }

  private ensureCustomerId(req?: Request): string {
    const customerId = req?.user?.customerId;

    if (!customerId) {
      throw new UnauthorizedError("Tài khoản hiện tại chưa gắn với khách hàng");
    }

    return customerId;
  }

  private async getAuthorizedOrderContextForManager(orderId: string, employeeId: string): Promise<OrderTrackingContext> {
    const orderContext = await this.googleMapRepository.getOrderTrackingContext(orderId);

    if (!orderContext) {
      throw new NotFoundError("Không tìm thấy đơn hàng cần cập nhật vị trí");
    }

    const allowedEmployeeIds = new Set([
      ...orderContext.fieldLeaderEmployeeIds,
      ...orderContext.orderLeaderEmployeeIds,
    ]);

    if (!allowedEmployeeIds.has(employeeId)) {
      throw new ForbiddenError("Bạn không được phép cập nhật vị trí cho đơn hàng này");
    }

    return orderContext;
  }

  private async getAuthorizedOrderContextForCustomer(orderId: string, customerId: string): Promise<OrderTrackingContext> {
    const orderContext = await this.googleMapRepository.getOrderTrackingContext(orderId);

    if (!orderContext) {
      throw new NotFoundError("Không tìm thấy đơn hàng cần theo dõi");
    }

    if (orderContext.customerId !== customerId) {
      throw new ForbiddenError("Bạn không được phép xem vị trí của đơn hàng này");
    }

    return orderContext;
  }

  private async estimateSpeedKmh(
    orderId: string,
    latestLocation: OrderManagerLocation,
  ): Promise<{ speedKmh: number; source: OrderTrackingPayload["etaSource"] }> {
    if (latestLocation.speedMetersPerSecond && latestLocation.speedMetersPerSecond > 0) {
      return {
        speedKmh: latestLocation.speedMetersPerSecond * 3.6,
        source: "device_speed",
      };
    }

    const locationHistory = await this.googleMapRepository.findLatestLocations(orderId, latestLocation.employeeId, 2);
    if (locationHistory.length >= 2) {
      const previousLocation = locationHistory[1];
      const elapsedHours =
        (latestLocation.capturedAt.getTime() - previousLocation.capturedAt.getTime()) / (60 * 60 * 1000);

      if (elapsedHours > 0) {
        const distanceKm =
          haversineDistanceMeters(
            previousLocation.latitude,
            previousLocation.longitude,
            latestLocation.latitude,
            latestLocation.longitude,
          ) / 1000;

        const calculatedSpeed = distanceKm / elapsedHours;

        if (Number.isFinite(calculatedSpeed) && calculatedSpeed >= 1 && calculatedSpeed <= 120) {
          return {
            speedKmh: calculatedSpeed,
            source: "historical_speed",
          };
        }
      }
    }

    return {
      speedKmh: config.GOOGLE_MAPS_AVG_SPEED_KMH,
      source: "average_speed",
    };
  }

  private async buildTrackingPayload(orderId: string, orderContext: OrderTrackingContext): Promise<OrderTrackingPayload> {
    const latestLocation = (await this.googleMapRepository.findLatestLocations(orderId, undefined, 1))[0] ?? null;
    const destinationAddress = getDestinationAddress(orderContext);
    const destination =
      hasCoordinates(destinationAddress)
        ? {
            latitude: destinationAddress.latitude as number,
            longitude: destinationAddress.longitude as number,
          }
        : null;

    if (!latestLocation) {
      return {
        orderId,
        serviceOrderId: orderContext.serviceOrderId,
        trackingRoomId: getOrderTrackingRoomId(orderId),
        employeeId: orderContext.fieldLeaderEmployeeIds[0] ?? null,
        status: "no_recent_data",
        location: null,
        destination,
        distanceMeters: null,
        etaMinutes: null,
        etaSource: null,
        lastUpdatedAt: null,
      };
    }

    const freshnessCutoff = Date.now() - config.GOOGLE_MAPS_TRACKING_FRESHNESS_SECONDS * 1000;
    const isFresh = latestLocation.capturedAt.getTime() >= freshnessCutoff;

    if (!isFresh) {
      return {
        orderId,
        serviceOrderId: orderContext.serviceOrderId,
        trackingRoomId: getOrderTrackingRoomId(orderId),
        employeeId: latestLocation.employeeId,
        status: "offline",
        location: formatLocation(latestLocation),
        destination,
        distanceMeters: null,
        etaMinutes: null,
        etaSource: null,
        lastUpdatedAt: latestLocation.capturedAt.toISOString(),
      };
    }

    if (!destination) {
      return {
        orderId,
        serviceOrderId: orderContext.serviceOrderId,
        trackingRoomId: getOrderTrackingRoomId(orderId),
        employeeId: latestLocation.employeeId,
        status: "on_the_way",
        location: formatLocation(latestLocation),
        destination: null,
        distanceMeters: null,
        etaMinutes: null,
        etaSource: null,
        lastUpdatedAt: latestLocation.capturedAt.toISOString(),
      };
    }

    const distanceMeters = haversineDistanceMeters(
      latestLocation.latitude,
      latestLocation.longitude,
      destination.latitude,
      destination.longitude,
    );

    if (distanceMeters <= config.GOOGLE_MAPS_ARRIVAL_DISTANCE_METERS) {
      return {
        orderId,
        serviceOrderId: orderContext.serviceOrderId,
        trackingRoomId: getOrderTrackingRoomId(orderId),
        employeeId: latestLocation.employeeId,
        status: "arrived",
        location: formatLocation(latestLocation),
        destination,
        distanceMeters: roundNumber(distanceMeters),
        etaMinutes: 0,
        etaSource: "arrived",
        lastUpdatedAt: latestLocation.capturedAt.toISOString(),
      };
    }

    const { speedKmh, source } = await this.estimateSpeedKmh(orderId, latestLocation);
    const adjustedSpeedKmh = Math.max(5, speedKmh / Math.max(config.GOOGLE_MAPS_TRAFFIC_FACTOR, 1));
    const etaMinutes = ((distanceMeters / 1000) / adjustedSpeedKmh) * 60;

    return {
      orderId,
      serviceOrderId: orderContext.serviceOrderId,
      trackingRoomId: getOrderTrackingRoomId(orderId),
      employeeId: latestLocation.employeeId,
      status: "on_the_way",
      location: formatLocation(latestLocation),
      destination,
      distanceMeters: roundNumber(distanceMeters),
      etaMinutes: roundNumber(etaMinutes),
      etaSource: source,
      lastUpdatedAt: latestLocation.capturedAt.toISOString(),
    };
  }

  async updateManagerLocation(orderId: string, dto: UpdateManagerLocationDto, req?: Request) {
    const employeeId = this.ensureManagerEmployeeId(req);
    const orderContext = await this.getAuthorizedOrderContextForManager(orderId, employeeId);

    if (!this.isTrackingActive(orderContext)) {
      throw new BadRequestError("Đơn hàng đã kết thúc hoặc chưa ở trạng thái cho phép cập nhật vị trí");
    }

    const capturedAt = dto.capturedAt ?? new Date();
    const latestLocation = (await this.googleMapRepository.findLatestLocations(orderId, employeeId, 1))[0] ?? null;

    if (latestLocation && capturedAt.getTime() <= latestLocation.capturedAt.getTime()) {
      throw new BadRequestError("Thời điểm vị trí mới phải sau lần cập nhật gần nhất");
    }

    if (
      latestLocation &&
      capturedAt.getTime() - latestLocation.capturedAt.getTime() <
        config.GOOGLE_MAPS_TRACKING_MIN_INTERVAL_SECONDS * 1000
    ) {
      throw new AppError(
        `Chỉ được cập nhật vị trí tối đa 1 lần mỗi ${config.GOOGLE_MAPS_TRACKING_MIN_INTERVAL_SECONDS} giây`,
        429,
        true,
      );
    }

    const distanceFromPreviousMeters = latestLocation
      ? haversineDistanceMeters(latestLocation.latitude, latestLocation.longitude, dto.latitude, dto.longitude)
      : null;

    if (
      latestLocation &&
      distanceFromPreviousMeters !== null &&
      distanceFromPreviousMeters < config.GOOGLE_MAPS_DEDUP_DISTANCE_METERS
    ) {
      return ApiResponseHandler.getSuccess("Vị trí không thay đổi đáng kể", {
        accepted: false,
        skippedReason: "deduplicated",
        distanceFromPreviousMeters: roundNumber(distanceFromPreviousMeters),
        latestLocation: formatLocation(latestLocation),
      });
    }

    const savedLocation = await this.googleMapRepository.createLocation({
      orderId,
      employeeId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      accuracy: dto.accuracy ?? null,
      speedMetersPerSecond: dto.speedMetersPerSecond ?? null,
      heading: dto.heading ?? null,
      capturedAt,
      source: dto.source ?? "manager-mobile",
      distanceFromPreviousMeters,
    });

    await this.cacheService.del(this.buildTrackingCacheKey(orderId));
    const trackingPayload = await this.buildTrackingPayload(orderId, orderContext);
    await this.broadcastLocationUpdated(trackingPayload, orderContext.customerId);

    return ApiResponseHandler.createSuccess("Cập nhật vị trí thành công", {
      accepted: true,
      skippedReason: null,
      location: formatLocation(savedLocation),
      distanceFromPreviousMeters: roundNumber(distanceFromPreviousMeters),
      tracking: trackingPayload,
    });
  }

  async getOrderTracking(orderId: string, req?: Request) {
    const customerId = this.ensureCustomerId(req);
    const orderContext = await this.getAuthorizedOrderContextForCustomer(orderId, customerId);
    const cacheKey = this.buildTrackingCacheKey(orderId);

    const cachedPayload = await this.cacheService.getJson<OrderTrackingPayload>(cacheKey);
    if (cachedPayload) {
      return ApiResponseHandler.getSuccess("OK", {
        ...cachedPayload,
        cacheHit: true,
      });
    }

    const payload = await this.buildTrackingPayload(orderId, orderContext);
    await this.cacheService.setJson(cacheKey, payload, config.GOOGLE_MAPS_TRACKING_CACHE_TTL);

    return ApiResponseHandler.getSuccess("OK", {
      ...payload,
      cacheHit: false,
    });
  }

  async notifyOrderAssigned(orderId: string): Promise<void> {
    const orderContext = await this.googleMapRepository.getOrderTrackingContext(orderId);
    if (!orderContext || !this.isTrackingActive(orderContext)) {
      return;
    }

    const targets = await this.googleMapRepository.findActiveTrackingTargets(undefined, orderId);
    for (const target of targets) {
      if (!target.employeeUserId) continue;
      const payload = buildOrderTrackingCommandPayload(
        orderId,
        target.employeeId,
        orderContext.serviceOrderId,
        "assigned",
      );
      emitOrderTrackingToUsers([target.employeeUserId], ORDER_TRACKING_EVENTS.ORDER_ASSIGNED, payload);
      emitOrderTrackingToUsers([target.employeeUserId], ORDER_TRACKING_EVENTS.PING_LOCATION, payload);
    }
  }

  async notifyServiceOrderAssigned(serviceOrderId: string): Promise<void> {
    const orderId = await this.googleMapRepository.findOrderIdByServiceOrderId(serviceOrderId);
    if (!orderId) {
      return;
    }

    await this.notifyOrderAssigned(orderId);
  }

  async stopOrderTracking(orderId: string, reason: "completed" | "canceled" | "status_changed"): Promise<void> {
    const orderContext = await this.googleMapRepository.getOrderTrackingContext(orderId);
    if (!orderContext) {
      return;
    }

    const [targets, customerUserId] = await Promise.all([
      this.googleMapRepository.findActiveTrackingTargets(undefined, orderId, true),
      this.userRepository.findUserIdByCustomerId(orderContext.customerId),
    ]);

    for (const target of targets) {
      const payload = {
        ...buildOrderTrackingCommandPayload(
          orderId,
          target.employeeId,
          orderContext.serviceOrderId,
          "stopped",
        ),
        stopReason: reason,
      };
      emitOrderTrackingToUsers(
        target.employeeUserId ? [target.employeeUserId] : [],
        ORDER_TRACKING_EVENTS.STOP_TRACKING,
        payload,
      );
      emitOrderTrackingToUsers([customerUserId], ORDER_TRACKING_EVENTS.STOP_TRACKING, payload);
    }
    await this.cacheService.del(this.buildTrackingCacheKey(orderId));
  }

  async stopServiceOrderTracking(
    serviceOrderId: string,
    reason: "completed" | "canceled" | "status_changed",
  ): Promise<void> {
    const orderId = await this.googleMapRepository.findOrderIdByServiceOrderId(serviceOrderId);
    if (!orderId) {
      return;
    }

    await this.stopOrderTracking(orderId, reason);
  }

  async sendPingRequestsForActiveOrders(): Promise<void> {
    const targets = await this.googleMapRepository.findActiveTrackingTargets();

    for (const target of targets) {
      if (!target.employeeUserId) {
        continue;
      }

      const payload = buildOrderTrackingCommandPayload(
        target.orderId,
        target.employeeId,
        target.serviceOrderId,
        "scheduled",
      );
      emitOrderTrackingToUsers([target.employeeUserId], ORDER_TRACKING_EVENTS.PING_LOCATION, payload);
    }
  }

  private async broadcastLocationUpdated(payload: OrderTrackingPayload, customerId: string): Promise<void> {
    const customerUserId = await this.userRepository.findUserIdByCustomerId(customerId);
    emitOrderTrackingToUsers([customerUserId], ORDER_TRACKING_EVENTS.LOCATION_UPDATED, payload);
  }

  private normalizeGoogleResult(result: any): GoogleGeocodeResult {
    return {
      formattedAddress: result.formatted_address,
      placeId: result.place_id ?? null,
      location:
        result.geometry?.location &&
        typeof result.geometry.location.lat === "number" &&
        typeof result.geometry.location.lng === "number"
          ? {
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng,
            }
          : null,
      locationType: result.geometry?.location_type ?? null,
      types: Array.isArray(result.types) ? result.types : [],
      addressComponents: Array.isArray(result.address_components)
        ? result.address_components.map((component: any) => ({
            longName: component.long_name,
            shortName: component.short_name,
            types: Array.isArray(component.types) ? component.types : [],
          }))
        : [],
    };
  }

  private async callGoogleGeocodingApi(searchParams: URLSearchParams): Promise<GoogleGeocodeResult[]> {
    if (!config.GOOGLE_MAPS_API_KEY) {
      throw new ServiceUnavailableError("GOOGLE_MAPS_API_KEY chưa được cấu hình");
    }

    const dailyCounter = await this.cacheService.incrementDailyCounter(this.buildDailyQuotaKey());
    if (dailyCounter > config.GOOGLE_MAPS_DAILY_LIMIT) {
      throw new ServiceUnavailableError("Đã vượt hạn mức gọi Google Maps trong ngày");
    }

    const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    endpoint.search = searchParams.toString();
    endpoint.searchParams.set("key", config.GOOGLE_MAPS_API_KEY);

    const response = await fetch(endpoint.toString(), {
      signal: AbortSignal.timeout(config.GOOGLE_MAPS_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new ServiceUnavailableError("Không thể kết nối tới dịch vụ Google Maps");
    }

    const payload = (await response.json()) as {
      status?: string;
      results?: any[];
      error_message?: string;
    };

    if (payload.status === "ZERO_RESULTS") {
      return [];
    }

    if (payload.status === "OK") {
      return Array.isArray(payload.results) ? payload.results.map((result) => this.normalizeGoogleResult(result)) : [];
    }

    if (payload.status === "OVER_DAILY_LIMIT" || payload.status === "OVER_QUERY_LIMIT") {
      throw new ServiceUnavailableError(payload.error_message || "Google Maps đã vượt hạn mức xử lý");
    }

    if (payload.status === "REQUEST_DENIED") {
      throw new ServiceUnavailableError(payload.error_message || "Google Maps từ chối yêu cầu");
    }

    throw new BadRequestError(payload.error_message || "Yêu cầu Google Maps không hợp lệ");
  }

  async geocode(dto: GeocodeQueryDto) {
    const normalizedAddress = dto.address.trim().replace(/\s+/g, " ");
    const cacheKey = this.buildGeocodeCacheKey("geocode", { address: normalizedAddress.toLowerCase() });
    const cachedResult = await this.cacheService.getJson<GoogleGeocodeResult[]>(cacheKey);

    if (cachedResult) {
      return ApiResponseHandler.getSuccess("OK", {
        query: normalizedAddress,
        source: "cache",
        results: cachedResult,
      });
    }

    const results = await this.callGoogleGeocodingApi(
      new URLSearchParams({
        address: normalizedAddress,
      }),
    );

    await this.cacheService.setJson(cacheKey, results, config.GOOGLE_MAPS_GEOCODE_CACHE_TTL);

    return ApiResponseHandler.getSuccess("OK", {
      query: normalizedAddress,
      source: "google",
      results,
    });
  }

  async reverseGeocode(dto: ReverseGeocodeQueryDto) {
    const normalizedPayload = {
      latitude: roundNumber(dto.latitude, 6),
      longitude: roundNumber(dto.longitude, 6),
    };
    const cacheKey = this.buildGeocodeCacheKey("reverse-geocode", normalizedPayload);
    const cachedResult = await this.cacheService.getJson<GoogleGeocodeResult[]>(cacheKey);

    if (cachedResult) {
      return ApiResponseHandler.getSuccess("OK", {
        query: normalizedPayload,
        source: "cache",
        results: cachedResult,
      });
    }

    const results = await this.callGoogleGeocodingApi(
      new URLSearchParams({
        latlng: `${dto.latitude},${dto.longitude}`,
      }),
    );

    await this.cacheService.setJson(cacheKey, results, config.GOOGLE_MAPS_GEOCODE_CACHE_TTL);

    return ApiResponseHandler.getSuccess("OK", {
      query: normalizedPayload,
      source: "google",
      results,
    });
  }
}
