import winston from "winston";
import path from "path";
import { config } from "../config/env";

const logDir = "logs";
const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, application, ...metadata }) => {
  const meta = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : "";
  return `${timestamp} [${level}]: [${config.PROJECT_NAME}]:${message}${meta}`;
});

const transports: winston.transport[] = [
  // Error logs
  new winston.transports.File({
    filename: path.join(logDir, "error.log"),
    level: "error",
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // All logs
  new winston.transports.File({
    filename: path.join(logDir, "combined.log"),
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({
          all: true,
          colors: {
            error: "red",
            warn: "yellow",
            info: "green",
            debug: "blue",
          },
        }),
        logFormat,
      ),
    }),
  );
}

const logger = winston.createLogger({
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  defaultMeta: { application: config.PROJECT_NAME },
  transports,
});

// import("@datalust/winston-seq").then(({ SeqTransport }) => {
//   console.log("Create log in SEQ", process.env.SEQ_URL);
//   logger.add(
//     new SeqTransport({
//       serverUrl: process.env.SEQ_URL || "https://log.itomosoft.com",
//       apiKey: process.env.SEQ_API_KEY,
//       onError: (e) => {
//         console.error(e);
//       },
//       handleExceptions: true,
//       handleRejections: true,
//     }),
//   );
// });

export default logger;
