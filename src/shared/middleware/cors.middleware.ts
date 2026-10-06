import cors from "cors";
import logger from "../utils/logger";

const allowedOrigins = [
  "http://localhost:3000",
  "https://bathless-slily-abbigail.ngrok-free.dev",
  "https://thienbao.itomosoft.com",
];

const corsMiddleware = cors({
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin or "null" origin (like mobile apps, curl, Postman, file://)
    if (!origin || origin === "null") {
      callback(null, true);
      return;
    }

    // In development, allow all origins
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
      callback(null, true);
      return;
    }

    // In production, check if the incoming request's origin is in the allowedOrigins array
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-device-id",
    "x-timezone",
    "Cache-Control",
    "x-tenant-id",
    "x-ip-address",
    "x-platform",
  ],
  exposedHeaders: ["Content-Length", "X-Requested-With"],
});

export default corsMiddleware;
