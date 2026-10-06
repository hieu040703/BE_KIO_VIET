import z from "zod";

const toPositiveInt = (value: unknown, fallback: number, max?: number): number => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  if (typeof max === "number") {
    return Math.min(parsed, max);
  }
  return parsed;
};

const toOptionalDate = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return value;
}, z.coerce.date().optional());

export const BaseSchema = z.object({
  page: z
    .string()
    .transform((val) => toPositiveInt(val, 1))
    .optional(),
  size: z
    .string()
    .transform((val) => toPositiveInt(val, 20, 200))
    .optional(),
  keyword: z.string().optional(),
  searchFields: z.array(z.string()).optional(),
  timeField: z.string().optional(),
  summaryFields: z.array(z.string()).optional(),
  type: z.string().optional(),
  startAt: toOptionalDate,
  endAt: toOptionalDate,
  sortBy: z.string().default("createdAt").optional(),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC").optional(),
});
