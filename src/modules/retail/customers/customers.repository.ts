import { injectable } from "inversify";
import { RetailCustomer } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERS_RESOURCE } from "./customers.types";

@injectable()
export class RetailCustomersRepository extends BaseRepository<RetailCustomer> {
  protected entityClass = RetailCustomer;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERS_RESOURCE];
  }
}
