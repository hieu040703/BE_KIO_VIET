import { injectable } from "inversify";
import { RetailProductVariant } from "@/database/models";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PRODUCTVARIANTS_RESOURCE } from "./productVariants.types";

@injectable()
export class RetailProductVariantsRepository extends BaseRepository<RetailProductVariant> {
  protected entityClass = RetailProductVariant;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PRODUCTVARIANTS_RESOURCE];
  }
}
