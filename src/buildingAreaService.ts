import { area, featureCollection, intersect, polygon } from "@turf/turf";
import type { BuildingAreaInput } from "./schemas";
import type {
  FeatureCollection,
  Polygon,
  GeoJsonProperties,
  MultiPolygon,
} from "geojson";
import type { Storage } from "./storage";
import { randomUUIDv7 } from "bun";
import { getErrorMessage } from "./utils";

export class BuildingAreaService {
  constructor(private storage: Storage<ProcessedAreaData>) {}

  public async deleteBuildingArea(id: string): Promise<void> {
    await this.storage.delete(id);
  }

  public async getBuildingAreaData(id: string): Promise<LoadAreaDataResult> {
    try {
      const data = await this.storage.load(id);
      return {
        success: true,
        data,
      };
    } catch (err) {
      console.log(err);

      return {
        success: false,
        errors: [getErrorMessage(err)],
      };
    }
  }

  public async processAndSaveBuildingAreaData(
    buildingAreaInput: BuildingAreaInput,
    id = randomUUIDv7()
  ): Promise<ProcessedAndStoredAreaDataResult> {
    const processedAreaDataResult = this.processAreaData(buildingAreaInput);

    if (!processedAreaDataResult.success) {
      return processedAreaDataResult;
    }

    const saveAreaDataResult = await this.saveBuildingAreaData(
      id,
      processedAreaDataResult.data
    );
    if (!saveAreaDataResult.success) {
      return saveAreaDataResult;
    }

    return {
      success: true,
      id,
      data: processedAreaDataResult.data,
    };
  }

  public processAreaData(
    buildingAreaData: BuildingAreaInput
  ): ProcessAreaDataResult {
    try {
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
    } catch (err) {
      return {
        success: false,
        errors: [getErrorMessage(err)],
      };
    }
  }

  private async saveBuildingAreaData(
    id: string,
    data: ProcessedAreaData
  ): Promise<SaveAreaDataResult> {
    try {
      await this.storage.save(id, data);
      return { success: true };
    } catch (err) {
      console.log(err);

      return {
        success: false,
        errors: [getErrorMessage(err)],
      };
    }
  }

  public validateProcessedData(data: ProcessedAreaData): string[] {
    const errors: string[] = [];

    // How much difference there can be between the building limit area and the split area before
    //   it's counted as an error
    const areaErrorMarginM2 = 5; // No idea if this is a realistic number

    const buildingLimitAreaM2 = data.buildingLimits.features
      .map((feature) => area(feature))
      .reduce((accumulator, current) => accumulator + current);

    const splitBuildingLimitsAreaM2 = data.splitBuildingLimits.features
      .map((feature) => area(feature))
      .reduce((accumulator, current) => accumulator + current);

    if (splitBuildingLimitsAreaM2 < buildingLimitAreaM2 - areaErrorMarginM2) {
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
  | FailureWithErrors;

interface FailureWithErrors {
  success: false;
  errors: string[];
}

export type SaveAreaDataResult =
  | {
      success: true;
    }
  | FailureWithErrors;

export type LoadAreaDataResult =
  | {
      success: true;
      data: ProcessedAreaData | null;
    }
  | FailureWithErrors;

export type ProcessedAndStoredAreaDataResult =
  | {
      success: true;
      id: string;
      data: ProcessedAreaData;
    }
  | FailureWithErrors;
