import { featureCollection, intersect, polygon, union } from "@turf/turf";
import type { BuildingAreaInput } from "./schemas";

export class BuildingAreaService {
  public processAndStoreBuildingAreaData(buildingAreaInput: BuildingAreaInput) {
    const processedAreaData = this.processAreaData(buildingAreaInput);

    // TODO: store data

    return processedAreaData;
  }

  public processAreaData(buildingAreaData: BuildingAreaInput) {
    const buildingLimits = featureCollection(
      buildingAreaData.building_limits.features.map((feature) =>
        polygon(feature.geometry.coordinates)
      )
    );

    const heightPlateaus = featureCollection(
      buildingAreaData.height_plateaus.features.map((feature) =>
        polygon(feature.geometry.coordinates, {
          elevation: feature.properties.elevation as number, // should be present and validated
        })
      )
    );

    const splitBuildingLimits = featureCollection(
      buildingLimits.features.flatMap((bLim) => {
        return heightPlateaus.features
          .map((hPlat) => {
            const intersection = intersect(featureCollection([hPlat, bLim]));
            if (intersection) {
              intersection.properties = {
                elevation: hPlat.properties.elevation,
              };
            }
            return intersection;
          })
          .filter((val) => val !== null);
      })
    );

    return {
      buildingLimits: buildingLimits,
      heightPlateaus: heightPlateaus,
      splitBuildingLimits: splitBuildingLimits,
    };
  }
}
