import { IAddress } from "../common/common.validator";
import { PlaceChildrenResponseDto, PlaceDetailQueryDto } from "./goongMap.validator";

export class GoongMapUtils {
  static transformPlaceDetailToAddress(placeDetail: PlaceChildrenResponseDto): IAddress {
    return {
      country: "Việt Nam",
      state: placeDetail.compound.province,
      ward: placeDetail.compound.commune,
      detail: placeDetail.formatted_address,
      latitude: placeDetail.geometry.location.lat,
      longitude: placeDetail.geometry.location.lng,
    };
  }
}
