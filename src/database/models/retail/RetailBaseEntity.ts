import { PrimaryColumn } from "typeorm";

/** Base entity for the Kiot retail schema. The SQL schema uses snake_case columns. */
export abstract class RetailBaseEntity {
  @PrimaryColumn({ name: "id", type: "uuid", default: () => "gen_random_uuid()" })
  id!: string;
}
