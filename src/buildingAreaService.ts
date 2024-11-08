import { area, featureCollection, intersect, polygon } from "@turf/turf";
import type { BuildingAreaInput } from "./schemas";
import type {
  FeatureCollection,
  Polygon,
  GeoJsonProperties,
  MultiPolygon,
} from "geojson";

export class BuildingAreaService {
  public processAndStoreBuildingAreaData(buildingAreaInput: BuildingAreaInput) {
    const processedAreaData = this.processAreaData(buildingAreaInput);

    // TODO: store data

    return processedAreaData;
  }

  public processAreaData(
    buildingAreaData: BuildingAreaInput
  ): ProcessAreaDataResult {
    const { buildingLimits, heightPlateaus } =
      this.formatAreaData(buildingAreaData);

    const splitBuildingLimits = this.getSplitBuildingLimits(
      buildingLimits,
      heightPlateaus
    );

    const processedAreaData: ProcessedAreaData = {
      buildingLimits: buildingLimits,
      heightPlateaus: heightPlateaus,
      splitBuildingLimits: splitBuildingLimits,
    };

    const validationErrors = this.validateProcessedData(processedAreaData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors,
      };
    }

    return {
      success: true,
      data: processedAreaData,
    };
  }

  public validateProcessedData(data: ProcessedAreaData): string[] {
    const errors: string[] = [];

    // How much difference there can be between the building limit area and the split area before
    //   it's counted as an error
    const areaErrorMarginM2 = 5; // No idea if this is a realistic number

    const buildingLimitArea = data.buildingLimits.features
      .map((feature) => area(feature))
      .reduce((accumulator, current) => accumulator + current);

    const splitBuildingLimitsArea = data.splitBuildingLimits.features
      .map((feature) => area(feature))
      .reduce((accumulator, current) => accumulator + current);

    if (splitBuildingLimitsArea < buildingLimitArea - areaErrorMarginM2) {
      errors.push(
        "The height plateaus does not sufficiently cover the building limit"
      );
    }

    return errors;
  }

  private formatAreaData(buildingAreaData: BuildingAreaInput) {
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

    return {
      buildingLimits,
      heightPlateaus,
    };
  }

  private getSplitBuildingLimits(
    buildingLimits: FeatureCollection<Polygon, GeoJsonProperties>,
    heightPlateaus: FeatureCollection<Polygon, { elevation: number }>
  ) {
    return featureCollection(
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
  }
}

export interface ProcessedAreaData {
  buildingLimits: FeatureCollection<Polygon, GeoJsonProperties>;
  heightPlateaus: FeatureCollection<
    Polygon,
    {
      elevation: number;
    }
  >;
  splitBuildingLimits: FeatureCollection<
    Polygon | MultiPolygon,
    GeoJsonProperties
  >;
}

export type ProcessAreaDataResult =
  | {
      success: true;
      data: ProcessedAreaData;
    }
  | {
      success: false;
      errors: string[];
    };
