import { z } from "zod";

const LatitudeSchema = z.coerce.number().min(-90).max(90);
const LongitudeSchema = z.coerce.number().min(-180).max(180);

const LatLngStringSchema = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, "Định dạng latlng không hợp lệ, vui lòng dùng dạng 'lat,lng'");

const VehicleSchema = z.enum(["car", "bike", "motorcycle", "truck"]).default("car");

const HasDeprecatedSchema = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v) => (typeof v === "string" ? v === "true" : v))
  .optional();

// 1. AUTOCOMPLETE V2
export const AutocompleteQuerySchema = z.object({
  input: z.string().trim().min(1).max(500),
  location: LatLngStringSchema.optional(),
  radius: z.coerce.number().positive().optional(),
  more_compound: HasDeprecatedSchema,
  has_deprecated_administrative_unit: HasDeprecatedSchema,
});

// 2. PLACE CHILDREN (Child ID) V2
export const PlaceChildrenQuerySchema = z.object({
  parent_id: z.string().trim().min(1),
  has_deprecated_administrative_unit: HasDeprecatedSchema,
});

// 3. PLACE DETAIL V2
export const PlaceDetailQuerySchema = z.object({
  place_id: z.string().trim().min(1),
  has_deprecated_administrative_unit: HasDeprecatedSchema,
});

// 4. GEOCODE V2 – Forward (address → coords)
export const ForwardGeocodeQuerySchema = z.object({
  address: z.string().trim().min(3).max(500),
  has_deprecated_administrative_unit: HasDeprecatedSchema,
});

// 4. GEOCODE V2 – Reverse (coords → address)
export const ReverseGeocodeQuerySchema = z.object({
  latlng: LatLngStringSchema,
  has_deprecated_administrative_unit: HasDeprecatedSchema,
});

// 4. GEOCODE STREET V2 (coords → street name)
export const GeocodeStreetQuerySchema = z.object({
  latlng: LatLngStringSchema,
  has_deprecated_administrative_unit: HasDeprecatedSchema,
});

// 5. DIRECTIONS V2
export const DirectionsQuerySchema = z.object({
  origin: LatLngStringSchema,
  destination: LatLngStringSchema,
  vehicle: VehicleSchema,
  alternatives: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => (typeof v === "string" ? v === "true" : v))
    .optional(),
});

// 6. DISTANCE MATRIX V2
export const DistanceMatrixQuerySchema = z.object({
  origins: LatLngStringSchema,
  destinations: z.string().trim().min(1),
  vehicle: VehicleSchema,
});

// 7. TRIP V2
export const TripQuerySchema = z.object({
  origin: LatLngStringSchema.optional(),
  destination: LatLngStringSchema.optional(),
  waypoints: z.string().trim().optional(),
  vehicle: VehicleSchema,
  roundtrip: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => (typeof v === "string" ? v === "true" : v))
    .optional(),
});

export type AutocompleteQueryDto = z.infer<typeof AutocompleteQuerySchema>;
export type PlaceChildrenQueryDto = z.infer<typeof PlaceChildrenQuerySchema>;
export type PlaceDetailQueryDto = z.infer<typeof PlaceDetailQuerySchema>;
export type ForwardGeocodeQueryDto = z.infer<typeof ForwardGeocodeQuerySchema>;
export type ReverseGeocodeQueryDto = z.infer<typeof ReverseGeocodeQuerySchema>;
export type GeocodeStreetQueryDto = z.infer<typeof GeocodeStreetQuerySchema>;
export type DirectionsQueryDto = z.infer<typeof DirectionsQuerySchema>;
export type DistanceMatrixQueryDto = z.infer<typeof DistanceMatrixQuerySchema>;
export type TripQueryDto = z.infer<typeof TripQuerySchema>;

export const GoongMapOrderParamsSchema = z.object({
  orderId: z.uuid(),
});

export const ProcessingOrderMapQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(500).default(200),
  orderId: z.uuid().optional(),
  keyword: z.string().optional(),
});

export const UpdateGoongManagerLocationSchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  accuracy: z.coerce.number().min(0).max(10000).nullish(),
  speedMetersPerSecond: z.coerce.number().min(0).max(100).nullish(),
  heading: z.coerce.number().min(-100).max(360).nullish(),
  capturedAt: z.coerce.date().optional(),
  source: z.string().trim().min(1).max(50).optional(),
});

export type GoongMapOrderParamsDto = z.infer<typeof GoongMapOrderParamsSchema>;
export type ProcessingOrderMapQueryDto = z.infer<typeof ProcessingOrderMapQuerySchema>;
export type UpdateGoongManagerLocationDto = z.infer<typeof UpdateGoongManagerLocationSchema>;

export const AutocompleteResponseSchema = z.object({
  description: z.string(),
  matched_substrings: z.array(
    z.object({
      length: z.number(),
      offset: z.number(),
    }),
  ),
  place_id: z.string(),
  reference: z.string(),
  structured_formatting: z.object({
    main_text: z.string(),
    main_text_matched_substrings: z.array(
      z.object({
        length: z.number(),
        offset: z.number(),
      }),
    ),
    secondary_text: z.string(),
    secondary_text_matched_substrings: z.array(
      z.object({
        length: z.number(),
        offset: z.number(),
      }),
    ),
  }),
  has_children: z.boolean(),
  plus_code: z.object({
    compound_code: z.string(),
    global_code: z.string(),
  }),
  compound: z.object({
    commune: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
  }),
  terms: z.array(
    z.object({
      offset: z.number(),
      value: z.string(),
    }),
  ),
  types: z.array(z.string()),
  distance_meters: z.number().nullable(),
});

export type AutocompleteResponseDto = z.infer<typeof AutocompleteResponseSchema>;

// example place detail response: https://rsapi.goong.io/place/detail?place_id=ChIJN1t_tDeuEmsRU
// {
//         "place_id": "iyiAqYuYYZlt4XBEuWW9nWaEUkW3VT67E-VelEpnY6Yz-a0iXnhgmGL7ewq2d5ufYM53j4F4sQdQ73yJjHext1bMUjixZqanY-B5RRYd3h51ih0IRsRGXtWDHSjqHEPyr",
//         "formatted_address": "28 Long Khánh 7, An Khánh, Hà Nội",
//         "geometry": {
//             "location": {
//                 "lat": 20.998019758000055,
//                 "lng": 105.72138758600005
//             }
//         },
//         "plus_code": {
//             "compound_code": "+6X02H An Khánh, Hoài Đức, Hà Nội",
//             "global_code": "LQ77+6X02H"
//         },
//         "compound": {
//             "commune": "An Khánh",
//             "province": "Hà Nội"
//         },
//         "name": "28 Long Khánh 7",
//         "url": "https://maps.goong.io/?pid=iyiAqYuYYZlt4XBEuWW9nWaEUkW3VT67E-VelEpnY6Yz-a0iXnhgmGL7ewq2d5ufYM53j4F4sQdQ73yJjHext1bMUjixZqanY-B5RRYd3h51ih0IRsRGXtWDHSjqHEPyr",
//         "types": [
//             "house_number"
//         ]
// }

export const PlaceDetailResponseSchema = z.object({
  place_id: z.string(),
  formatted_address: z.string(),
  geometry: z.object({
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  plus_code: z.object({
    compound_code: z.string(),
    global_code: z.string(),
  }),
  compound: z.object({
    commune: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
  }),
  name: z.string(),
  url: z.string(),
  types: z.array(z.string()),
});

export type PlaceChildrenResponseDto = z.infer<typeof PlaceDetailResponseSchema>;

// example geocode response: https://rsapi.goong.io/geocode?address=28%20Long%20Khánh%207%2C%20An%20Khánh%2C%20Hà%20Nội
// {
//     "address_components": [
//         {
//             "long_name": "28 Long Khánh 7",
//             "short_name": "28 Long Khánh 7"
//         },
//         {
//             "long_name": "An Khánh",
//             "short_name": "An Khánh"
//         },
//         {
//             "long_name": "Hà Nội",
//             "short_name": "Hà Nội"
//         }
//     ],
//     "formatted_address": "28 Long Khánh 7, An Khánh, Hà Nội",
//     "geometry": {
//         "location": {
//             "lat": 20.998019758000055,
//             "lng": 105.72138758600005
//         },
//         "boundary": null
//     },
//     "place_id": "iyiAqYuYYZlt4XBEuWW9nWaEUkW3VT67E-VelEpnY6Yz-a0iXnhgmGL7ewq2d5ufYM53j4F4sQdQ73yJjHext1bMUjixZqanY-B5RRYd3h51ih0IRsRGXtWDHSjqHEPyr",
//     "reference": "iyiAqYuYYZlt4XBEuWW9nWaEUkW3VT67E-VelEpnY6Yz-a0iXnhgmGL7ewq2d5ufYM53j4F4sQdQ73yJjHext1bMUjixZqanY-B5RRYd3h51ih0IRsRGXtWDHSjqHEPyr",
//     "plus_code": {
//         "compound_code": "+6X02H An Khánh, Hoài Đức, Hà Nội",
//         "global_code": "LQ77+6X02H"
//     },
//     "compound": {
//         "commune": "An Khánh",
//         "province": "Hà Nội"
//     },
//     "types": [
//         "house_number"
//     ],
//     "name": "28 Long Khánh 7",
//     "address": "An Khánh, Hà Nội"
// }

const GoongGeocodeResultSchema = z.object({
  address_components: z.array(
    z.object({
      long_name: z.string(),
      short_name: z.string(),
    }),
  ),
  formatted_address: z.string(),
  geometry: z.object({
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    boundary: z.nullable(z.unknown()),
  }),
  place_id: z.string(),
  reference: z.string(),
  plus_code: z.object({
    compound_code: z.string(),
    global_code: z.string(),
  }),
  compound: z.object({
    commune: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
  }),
  types: z.array(z.string()),
  name: z.string(),
  address: z.string(),
});

export type GoongGeocodeResult = z.infer<typeof GoongGeocodeResultSchema>;
