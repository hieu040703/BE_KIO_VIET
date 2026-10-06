import { injectable } from "inversify";
import { RetailProductImages } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PRODUCTIMAGES_RESOURCE } from "./productImages.types";

@injectable()
export class RetailProductImagesRepository extends BaseRepository<RetailProductImages> {
  protected entityClass = RetailProductImages;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PRODUCTIMAGES_RESOURCE];
  }
}
