import "reflect-metadata";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "node:http";
import { config } from "@/shared/config/env";
import DatabaseConfig from "@/database/database";
import { entities } from "@/database/models";
import retailRouter from "@/routers/retail.routes";
import authRouter from "@/routers/auth.routes";
import corsMiddleware from "@/shared/middleware/cors.middleware";
import { errorHandler } from "@/shared/middleware/error.middleware";
import { sseMiddleware } from "@/shared/middleware/sse.middleware";
import Socket from "@/shared/config/socket";
import logger from "@/shared/utils/logger";

class App {
  public readonly app = express();
  private initialized = false;
  private shuttingDown = false;

  constructor() {
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await DatabaseConfig.initialize();
      const fullRepo = Object.fromEntries(
        entities.map((entity) => [entity.name, DatabaseConfig.getRepository(entity)]),
      );
      this.app.use((_req, res, next) => {
        res.locals.fullRepo = fullRepo;
        res.locals.dataSource = DatabaseConfig;
        next();
      });

      this.app.use(express.static("public"));
      this.app.use(helmet({ contentSecurityPolicy: false }));
      this.app.use(corsMiddleware);
      this.app.use(sseMiddleware);
      this.app.use(morgan("short"));
      this.app.use(express.json({ limit: "20mb" }));
      this.app.use(express.urlencoded({ extended: true }));
      this.app.use(cookieParser());
      this.app.get("/health", (_req, res) => res.status(200).json({ status: "OK", environment: config.NODE_ENV }));
      this.app.use("/v1/auth", authRouter);
      this.app.use("/v1/retail", retailRouter);
      this.app.use(errorHandler);
      this.initialized = true;
      logger.info(`Kiot retail API initialized with ${entities.length} entities`);
    } catch (error) {
      logger.error("Failed to initialize Kiot retail API", error);
      process.exitCode = 1;
    }
  }

  async listen(): Promise<void> {
    while (!this.initialized && process.exitCode === undefined) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (!this.initialized) return;

    const server = createServer(this.app);
    Socket.init(server);
    server.listen(config.PORT, () => logger.info(`Kiot retail API listening on port ${config.PORT}`));
  }

  async shutdown(): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    Socket.close();
    if (DatabaseConfig.isInitialized) await DatabaseConfig.destroy();
  }
}

const app = new App();
void app.listen();

const shutdown = async () => {
  await app.shutdown();
  process.exit(0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
