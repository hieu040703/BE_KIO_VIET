import { z } from "zod";

const LatitudeSchema = z.coerce.number().min(-90).max(90);
const LongitudeSchema = z.coerce.number().min(-180).max(180);

export const GoogleMapOrderParamsSchema = z.object({
  orderId: z.uuid(),
});

export const UpdateManagerLocationSchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  accuracy: z.coerce.number().min(0).max(10000).nullish(),
  speedMetersPerSecond: z.coerce.number().min(0).max(100).nullish(),
  heading: z.coerce.number().min(0).max(360).nullish(),
  capturedAt: z.coerce.date().optional(),
  source: z.string().trim().min(1).max(50).optional(),
});

export const GeocodeQuerySchema = z.object({
  address: z.string().trim().min(3).max(500),
});

export const ReverseGeocodeQuerySchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
});

export type GoogleMapOrderParamsDto = z.infer<typeof GoogleMapOrderParamsSchema>;
export type UpdateManagerLocationDto = z.infer<typeof UpdateManagerLocationSchema>;
export type GeocodeQueryDto = z.infer<typeof GeocodeQuerySchema>;
export type ReverseGeocodeQueryDto = z.infer<typeof ReverseGeocodeQuerySchema>;
