import * as Minio from "minio";
import logger from "../utils/logger";
import { config } from "./env";

const minioClient = new Minio.Client({
  endPoint: config.MINIO_END_POINT,
  port: config.MINIO_PORT,
  useSSL: config.MINIO_USE_SSL,
  accessKey: config.MINIO_ACCESS_KEY,
  secretKey: config.MINIO_SECRET_KEY,
});

//? Test connection
const connect = async () => {
  try {
    const buckets = await minioClient.listBuckets();
    console.log("Buckets: ", buckets);
    logger.info("🎲 MinIO connected successfully");
  } catch (err) {
    console.log("Error occurred: ", err);
  }
};

export { minioClient, connect };
