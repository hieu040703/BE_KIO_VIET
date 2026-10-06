import { FindOptionsSelect } from "typeorm";
import { RetailBaseEntity } from "@/database/models/retail/RetailBaseEntity";

/** Dynamic retail resources are selected from the SQL whitelist in retail.types.ts. */
export const RetailSelect: FindOptionsSelect<RetailBaseEntity> = { id: true };
