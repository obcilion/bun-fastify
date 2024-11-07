import { featureCollection, intersect, polygon } from "@turf/turf";
import type { BuildingAreaInput } from "./schemas";

export class BuildingAreaService {
  public processAndStoreBuildingAreaData(buildingAreaInput: BuildingAreaInput) {
    const processedAreaData = this.processAreaData(buildingAreaInput);

    // TODO: store data

    return processedAreaData;
  }

  private processAreaData(buildingAreaData: BuildingAreaInput) {
    const buildingLimits = buildingAreaData.building_limits.features.map(
      (feature) => polygon(feature.geometry.coordinates)
    );

    const heightPlateaus = buildingAreaData.height_plateaus.features.map(
      (feature) =>
        polygon(feature.geometry.coordinates, {
          elevation: feature.properties.elevation as number, // should be present and validated
        })
    );

    const splitBuildingLimits = buildingLimits.flatMap((bLim) => {
      return heightPlateaus
        .map((hPlat) => {
          const intersection = intersect(featureCollection([hPlat, bLim]));
          if (intersection) {
            intersection.properties = { elevation: hPlat.properties.elevation };
          }
          return intersection;
        })
        .filter((val) => val !== null);
    });

    return {
      buildingLimits: featureCollection(buildingLimits),
      heightPlateaus: featureCollection(heightPlateaus),
      splitBuildingLimits: featureCollection(splitBuildingLimits),
    };
  }
}
