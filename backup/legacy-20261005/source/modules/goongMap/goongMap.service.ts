import { createHash } from "crypto";
import { inject, injectable } from "inversify";
import { Request } from "express";
import {
  AppError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
} from "@/shared/types/errors";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { config } from "@/shared/config/env";
import redisHelper from "@/shared/utils/redis.helper";
import { IAddress } from "@/modules/common/common.validator";
import { OrderManagerLocation } from "@/database/models/OrderManagerLocation";
import { OrderStatusEnum, ServiceOrderStatusEnum } from "@/shared/constants/constance";
import { UserRepository } from "../user/user.repository";
import { USER_TYPES } from "../user/user.types";
import {
  AutocompleteQueryDto,
  PlaceChildrenQueryDto,
  PlaceDetailQueryDto,
  ForwardGeocodeQueryDto,
  ReverseGeocodeQueryDto,
  GeocodeStreetQueryDto,
  DirectionsQueryDto,
  DistanceMatrixQueryDto,
  TripQueryDto,
  PlaceChildrenResponseDto,
  ProcessingOrderMapQueryDto,
  UpdateGoongManagerLocationDto,
} from "./goongMap.validator";
import { GoongMapUtils } from "./goongMap.utils";
import { GOONG_MAP_TYPES } from "./goongMap.types";
import { GoongMapCacheService } from "./goongMap.cache.service";
import { GoongMapRepository, GoongOrderTrackingContext } from "./goongMap.repository";
import {
  buildGoongOrderTrackingCommandPayload,
  emitGoongOrderTrackingToUsers,
  getGoongOrderTrackingRoomId,
  GOONG_ORDER_TRACKING_EVENTS,
} from "./goongOrderTracking.socket";
import logger from "@/shared/utils/logger";

const GOONG_BASE_URL = "https://rsapi.goong.io/v2";

const hashPayload = (payload: unknown): string => createHash("sha256").update(JSON.stringify(payload)).digest("hex");

type TrackingStatus = "on_the_way" | "arrived" | "offline" | "no_recent_data";

type GoongOrderTrackingPayload = {
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

const getDestinationAddress = (orderContext: GoongOrderTrackingContext): IAddress | null => {
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
export class GoongMapService {
  constructor(
    @inject(GOONG_MAP_TYPES.GoongMapRepository) private readonly goongMapRepository: GoongMapRepository,
    @inject(GOONG_MAP_TYPES.GoongMapCacheService) private readonly cacheService: GoongMapCacheService,
    @inject(USER_TYPES.UserRepository) private readonly userRepository: UserRepository,
  ) {}

  private buildCacheKey(method: string, params: unknown): string {
    return `goong-map:${method}:${hashPayload(params)}`;
  }

  private ensureApiKey(): string {
    const key = config.GOONG_API_KEY;
    if (!key) {
      throw new ServiceUnavailableError("GOONG_API_KEY chưa được cấu hình");
    }
    return key;
  }

  private buildTrackingCacheKey(orderId: string): string {
    return `goong-map:tracking:${orderId}`;
  }

  private isTrackingActive(orderContext: GoongOrderTrackingContext): boolean {
    const activeOrderStatuses = [OrderStatusEnum.PENDING];
    const activeServiceOrderStatuses = [ServiceOrderStatusEnum.CONFIRMED];

    if (!activeOrderStatuses.includes(orderContext.orderStatus)) {
      return false;
    }

    if (orderContext.serviceOrderId && orderContext.serviceOrderStatus) {
      return activeServiceOrderStatuses.includes(orderContext.serviceOrderStatus);
    }

    return true;
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

  private async getAuthorizedOrderContextForManager(
    orderId: string,
    employeeId: string,
  ): Promise<GoongOrderTrackingContext> {
    const orderContext = await this.goongMapRepository.getOrderTrackingContext(orderId);

    if (!orderContext) {
      throw new NotFoundError("Không tìm thấy đơn hàng cần cập nhật vị trí");
    }

    const allowedEmployeeIds = new Set([
      ...orderContext.fieldLeaderEmployeeIds,
      ...orderContext.orderLeaderEmployeeIds,
    ]);

    // if (!allowedEmployeeIds.has(employeeId)) {
    //   throw new ForbiddenError("Bạn không được phép cập nhật vị trí cho đơn hàng này");
    // }

    return orderContext;
  }

  private async getAuthorizedOrderContextForCustomer(
    orderId: string,
    customerId: string,
  ): Promise<GoongOrderTrackingContext> {
    const orderContext = await this.goongMapRepository.getOrderTrackingContext(orderId);

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
  ): Promise<{ speedKmh: number; source: GoongOrderTrackingPayload["etaSource"] }> {
    if (latestLocation.speedMetersPerSecond && latestLocation.speedMetersPerSecond > 0) {
      return {
        speedKmh: latestLocation.speedMetersPerSecond * 3.6,
        source: "device_speed",
      };
    }

    const locationHistory = await this.goongMapRepository.findLatestLocations(orderId, latestLocation.employeeId, 2);
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
      speedKmh: config.GOONG_AVG_SPEED_KMH,
      source: "average_speed",
    };
  }

  private async buildTrackingPayload(
    orderId: string,
    orderContext: GoongOrderTrackingContext,
  ): Promise<GoongOrderTrackingPayload> {
    const latestLocation = (await this.goongMapRepository.findLatestLocations(orderId, undefined, 1))[0] ?? null;
    const destinationAddress = getDestinationAddress(orderContext);
    const destination = hasCoordinates(destinationAddress)
      ? {
          latitude: destinationAddress.latitude as number,
          longitude: destinationAddress.longitude as number,
        }
      : null;

    if (!latestLocation) {
      return {
        orderId,
        serviceOrderId: orderContext.serviceOrderId,
        trackingRoomId: getGoongOrderTrackingRoomId(orderId),
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

    const freshnessCutoff = Date.now() - config.GOONG_TRACKING_FRESHNESS_SECONDS * 1000;
    const isFresh = latestLocation.capturedAt.getTime() >= freshnessCutoff;

    if (!isFresh) {
      return {
        orderId,
        serviceOrderId: orderContext.serviceOrderId,
        trackingRoomId: getGoongOrderTrackingRoomId(orderId),
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
        trackingRoomId: getGoongOrderTrackingRoomId(orderId),
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

    if (distanceMeters <= config.GOONG_ARRIVAL_DISTANCE_METERS) {
      return {
        orderId,
        serviceOrderId: orderContext.serviceOrderId,
        trackingRoomId: getGoongOrderTrackingRoomId(orderId),
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
    const adjustedSpeedKmh = Math.max(5, speedKmh / Math.max(config.GOONG_TRAFFIC_FACTOR, 1));
    const etaMinutes = (distanceMeters / 1000 / adjustedSpeedKmh) * 60;

    return {
      orderId,
      serviceOrderId: orderContext.serviceOrderId,
      trackingRoomId: getGoongOrderTrackingRoomId(orderId),
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

  private async checkDailyLimit(): Promise<void> {
    const quotaKey = `goong-map:daily-quota:${new Date().toISOString().slice(0, 10)}`;
    const raw = await redisHelper.get(quotaKey);
    const count = raw ? parseInt(raw, 10) : 0;

    if (count >= config.GOONG_DAILY_LIMIT) {
      throw new ServiceUnavailableError("Đã vượt hạn mức gọi Goong Maps trong ngày");
    }

    // increment counter – TTL 2 days to ensure cleanup
    await redisHelper.set(quotaKey, String(count + 1), 172800);
  }

  private async callGoong<T extends Record<string, unknown>>(
    endpoint: string,
    params: Record<string, string>,
  ): Promise<T> {
    const apiKey = this.ensureApiKey();
    await this.checkDailyLimit();

    const url = new URL(`${GOONG_BASE_URL}${endpoint}`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    url.searchParams.set("api_key", apiKey);

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(config.GOONG_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new ServiceUnavailableError(`Không thể kết nối tới dịch vụ Goong Maps (HTTP ${response.status})`);
    }

    const json = (await response.json()) as { status?: string; message?: string } & T;

    if (json.status && json.status !== "OK" && json.status !== "Ok") {
      throw new BadRequestError(json.message ?? `Goong Maps trả về lỗi: ${json.status}`);
    }

    return json;
  }

  private async withCache<T extends Record<string, unknown>>(
    cacheKey: string,
    ttl: number,
    fetchFn: () => Promise<T>,
  ): Promise<{ data: T; source: "cache" | "api" }> {
    const cached = await redisHelper.get(cacheKey);
    if (cached) {
      return { data: JSON.parse(cached) as T, source: "cache" };
    }
    const data = await fetchFn();
    await redisHelper.set(cacheKey, JSON.stringify(data), ttl);
    return { data, source: "api" };
  }

  // 1. AUTOCOMPLETE V2
  async autocomplete(dto: AutocompleteQueryDto) {
    const params: Record<string, string> = { input: dto.input };
    if (dto.location) params.location = dto.location;
    if (dto.radius !== undefined) params.radius = String(dto.radius);
    if (dto.more_compound !== undefined) params.more_compound = String(dto.more_compound);
    if (dto.has_deprecated_administrative_unit !== undefined)
      params.has_deprecated_administrative_unit = String(dto.has_deprecated_administrative_unit);

    const cacheKey = this.buildCacheKey("autocomplete", params);
    const { data, source } = await this.withCache(cacheKey, config.GOONG_AUTOCOMPLETE_CACHE_TTL, () =>
      this.callGoong("/place/autocomplete", params),
    );

    return ApiResponseHandler.getSuccess("OK", data.predictions);
  }

  // 2. PLACE CHILDREN (Child ID) V2
  async placeChildren(dto: PlaceChildrenQueryDto) {
    const params: Record<string, string> = { parent_id: dto.parent_id };
    if (dto.has_deprecated_administrative_unit !== undefined)
      params.has_deprecated_administrative_unit = String(dto.has_deprecated_administrative_unit);

    const cacheKey = this.buildCacheKey("place-children", params);
    const { data, source } = await this.withCache(cacheKey, config.GOONG_PLACE_CACHE_TTL, () =>
      this.callGoong("/place/children", params),
    );
    return ApiResponseHandler.getSuccess("OK", { source, ...data });
  }

  // 3. PLACE DETAIL V2
  async placeDetail(dto: PlaceDetailQueryDto) {
    const params: Record<string, string> = { place_id: dto.place_id };
    if (dto.has_deprecated_administrative_unit !== undefined)
      params.has_deprecated_administrative_unit = String(dto.has_deprecated_administrative_unit);

    const cacheKey = this.buildCacheKey("place-detail", params);
    const { data, source } = await this.withCache(cacheKey, config.GOONG_PLACE_CACHE_TTL, () =>
      this.callGoong("/place/detail", params),
    );
    const transformData = GoongMapUtils.transformPlaceDetailToAddress(data.result as PlaceChildrenResponseDto);
    return ApiResponseHandler.getSuccess("OK", transformData);
  }

  // 4a. GEOCODE V2 – Forward
  async geocode(dto: ForwardGeocodeQueryDto) {
    const params: Record<string, string> = { address: dto.address.trim() };
    if (dto.has_deprecated_administrative_unit !== undefined)
      params.has_deprecated_administrative_unit = String(dto.has_deprecated_administrative_unit);

    const cacheKey = this.buildCacheKey("geocode", { ...params, address: params.address.toLowerCase() });
    const { data, source } = await this.withCache(cacheKey, config.GOONG_GEOCODE_CACHE_TTL, () =>
      this.callGoong("/geocode", params),
    );
    return ApiResponseHandler.getSuccess("OK", data.results);
  }

  // 4b. GEOCODE V2 – Reverse
  async reverseGeocode(dto: ReverseGeocodeQueryDto) {
    const params: Record<string, string> = { latlng: dto.latlng };
    if (dto.has_deprecated_administrative_unit !== undefined)
      params.has_deprecated_administrative_unit = String(dto.has_deprecated_administrative_unit);

    const cacheKey = this.buildCacheKey("reverse-geocode", params);
    const { data, source } = await this.withCache(cacheKey, config.GOONG_GEOCODE_CACHE_TTL, () =>
      this.callGoong("/geocode", params),
    );
    return ApiResponseHandler.getSuccess("OK", { source, ...data });
  }

  // 4c. GEOCODE STREET V2
  async geocodeStreet(dto: GeocodeStreetQueryDto) {
    const params: Record<string, string> = { latlng: dto.latlng };
    if (dto.has_deprecated_administrative_unit !== undefined)
      params.has_deprecated_administrative_unit = String(dto.has_deprecated_administrative_unit);

    const cacheKey = this.buildCacheKey("geocode-street", params);
    const { data, source } = await this.withCache(cacheKey, config.GOONG_GEOCODE_CACHE_TTL, () =>
      this.callGoong("/geocode/street", params),
    );
    return ApiResponseHandler.getSuccess("OK", { source, ...data });
  }

  // 5. DIRECTIONS V2
  async directions(dto: DirectionsQueryDto) {
    const params: Record<string, string> = {
      origin: dto.origin,
      destination: dto.destination,
      vehicle: dto.vehicle,
    };
    if (dto.alternatives !== undefined) params.alternatives = String(dto.alternatives);

    const cacheKey = this.buildCacheKey("directions", params);
    const { data, source } = await this.withCache(cacheKey, config.GOONG_DIRECTIONS_CACHE_TTL, () =>
      this.callGoong("/direction", params),
    );
    return ApiResponseHandler.getSuccess("OK", { source, ...data });
  }

  // 6. DISTANCE MATRIX V2
  async distanceMatrix(dto: DistanceMatrixQueryDto) {
    const params: Record<string, string> = {
      origins: dto.origins,
      destinations: dto.destinations,
      vehicle: dto.vehicle,
    };

    const cacheKey = this.buildCacheKey("distance-matrix", params);
    const { data, source } = await this.withCache(cacheKey, config.GOONG_DIRECTIONS_CACHE_TTL, () =>
      this.callGoong("/distancematrix", params),
    );
    return ApiResponseHandler.getSuccess("OK", { source, ...data });
  }

  // 7. TRIP V2
  async trip(dto: TripQueryDto) {
    const params: Record<string, string> = { vehicle: dto.vehicle };
    if (dto.origin) params.origin = dto.origin;
    if (dto.destination) params.destination = dto.destination;
    if (dto.waypoints) params.waypoints = dto.waypoints;
    if (dto.roundtrip !== undefined) params.roundtrip = String(dto.roundtrip);

    const cacheKey = this.buildCacheKey("trip", params);
    const { data, source } = await this.withCache(cacheKey, config.GOONG_DIRECTIONS_CACHE_TTL, () =>
      this.callGoong("/trip", params),
    );
    return ApiResponseHandler.getSuccess("OK", { source, ...data });
  }

  async updateManagerLocation(orderId: string, dto: UpdateGoongManagerLocationDto, req?: Request) {
    const employeeId = this.ensureManagerEmployeeId(req);
    const orderContext = await this.getAuthorizedOrderContextForManager(orderId, employeeId);

    // if (!this.isTrackingActive(orderContext)) {
    //   throw new BadRequestError("Đơn hàng đã kết thúc hoặc chưa ở trạng thái cho phép cập nhật vị trí");
    // }

    const capturedAt = dto.capturedAt ?? new Date();
    const latestLocation = (await this.goongMapRepository.findLatestLocations(orderId, employeeId, 1))[0] ?? null;

    if (latestLocation && capturedAt.getTime() <= latestLocation.capturedAt.getTime()) {
      throw new BadRequestError("Thời điểm vị trí mới phải sau lần cập nhật gần nhất");
    }

    if (
      latestLocation &&
      capturedAt.getTime() - latestLocation.capturedAt.getTime() < config.GOONG_TRACKING_MIN_INTERVAL_SECONDS * 1000
    ) {
      throw new AppError(
        `Chỉ được cập nhật vị trí tối đa 1 lần mỗi ${config.GOONG_TRACKING_MIN_INTERVAL_SECONDS} giây`,
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
      distanceFromPreviousMeters < config.GOONG_DEDUP_DISTANCE_METERS
    ) {
      return ApiResponseHandler.getSuccess("Vị trí không thay đổi đáng kể", {
        accepted: false,
        skippedReason: "deduplicated",
        distanceFromPreviousMeters: roundNumber(distanceFromPreviousMeters),
        latestLocation: formatLocation(latestLocation),
      });
    }

    const savedLocation = await this.goongMapRepository.createLocation({
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

    const cachedPayload = await this.cacheService.getJson<GoongOrderTrackingPayload>(cacheKey);
    if (cachedPayload) {
      return ApiResponseHandler.getSuccess("OK", {
        ...cachedPayload,
        cacheHit: true,
      });
    }

    const payload = await this.buildTrackingPayload(orderId, orderContext);
    await this.cacheService.setJson(cacheKey, payload, config.GOONG_TRACKING_CACHE_TTL);

    return ApiResponseHandler.getSuccess("OK", {
      ...payload,
      cacheHit: false,
    });
  }

  async getProcessingOrdersForMap(query: ProcessingOrderMapQueryDto, req?: Request) {
    const { data, total } = await this.goongMapRepository.findProcessingOrderMapData(
      query.page,
      query.size,
      req,
      undefined,
      query.orderId,
      query.keyword,
    );

    return ApiResponseHandler.getSuccess("OK", data, {
      totalRecords: total,
      currentPage: query.page,
      size: query.size,
      totalPages: Math.ceil(total / query.size),
    });
  }

  async notifyOrderAssigned(orderId: string): Promise<void> {
    const orderContext = await this.goongMapRepository.getOrderTrackingContext(orderId);
    if (!orderContext || !this.isTrackingActive(orderContext)) {
      return;
    }

    const targets = await this.goongMapRepository.findActiveTrackingTargets(undefined, orderId);
    for (const target of targets) {
      if (!target.employeeUserId) continue;
      const payload = buildGoongOrderTrackingCommandPayload(
        orderId,
        target.employeeId,
        orderContext.serviceOrderId,
        "assigned",
      );
      emitGoongOrderTrackingToUsers([target.employeeUserId], GOONG_ORDER_TRACKING_EVENTS.ORDER_ASSIGNED, payload);
      emitGoongOrderTrackingToUsers([target.employeeUserId], GOONG_ORDER_TRACKING_EVENTS.PING_LOCATION, payload);
    }
  }

  async notifyServiceOrderAssigned(serviceOrderId: string): Promise<void> {
    const orderId = await this.goongMapRepository.findOrderIdByServiceOrderId(serviceOrderId);
    if (!orderId) {
      return;
    }

    await this.notifyOrderAssigned(orderId);
  }

  async stopOrderTracking(orderId: string, reason: "completed" | "canceled" | "status_changed"): Promise<void> {
    const orderContext = await this.goongMapRepository.getOrderTrackingContext(orderId);
    if (!orderContext) {
      return;
    }

    const [targets, customerUserId] = await Promise.all([
      this.goongMapRepository.findActiveTrackingTargets(undefined, orderId, true),
      this.userRepository.findUserIdByCustomerId(orderContext.customerId),
    ]);

    for (const target of targets) {
      const payload = {
        ...buildGoongOrderTrackingCommandPayload(orderId, target.employeeId, orderContext.serviceOrderId, "stopped"),
        stopReason: reason,
      };
      emitGoongOrderTrackingToUsers(
        target.employeeUserId ? [target.employeeUserId] : [],
        GOONG_ORDER_TRACKING_EVENTS.STOP_TRACKING,
        payload,
      );
      emitGoongOrderTrackingToUsers([customerUserId], GOONG_ORDER_TRACKING_EVENTS.STOP_TRACKING, payload);
    }
    await this.cacheService.del(this.buildTrackingCacheKey(orderId));
  }

  async stopServiceOrderTracking(
    serviceOrderId: string,
    reason: "completed" | "canceled" | "status_changed",
  ): Promise<void> {
    const orderId = await this.goongMapRepository.findOrderIdByServiceOrderId(serviceOrderId);
    if (!orderId) {
      return;
    }

    await this.stopOrderTracking(orderId, reason);
  }

  async sendPingRequestsForActiveOrders(): Promise<void> {
    const targets = await this.goongMapRepository.findActiveTrackingTargets();

    logger.info(`🚀 Found ${targets.length} active order tracking targets to ping`);

    for (const target of targets) {
      if (!target.employeeUserId) {
        continue;
      }

      const payload = buildGoongOrderTrackingCommandPayload(
        target.orderId,
        target.employeeId,
        target.serviceOrderId,
        "scheduled",
      );
      emitGoongOrderTrackingToUsers([target.employeeUserId], GOONG_ORDER_TRACKING_EVENTS.PING_LOCATION, payload);
    }
  }

  private async broadcastLocationUpdated(payload: GoongOrderTrackingPayload, customerId: string): Promise<void> {
    const customerUserId = await this.userRepository.findUserIdByCustomerId(customerId);
    emitGoongOrderTrackingToUsers([customerUserId], GOONG_ORDER_TRACKING_EVENTS.LOCATION_UPDATED, payload);
  }

  async getMapTileKey() {
    return ApiResponseHandler.getSuccess("OK", { tileKey: config.GOONG_MAP_TILE_KEY });
  }
}
