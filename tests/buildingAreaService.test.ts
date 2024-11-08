import { expect, test, describe } from "bun:test";
import { BuildingAreaService } from "../src/buildingAreaService";
import { booleanEqual, polygon } from "@turf/turf";
import {
  getBuildingAreaInput,
  getMiddlebLimCoords,
  getLeftHPlatCoords,
  getRightHPlatCoords,
  getSmallLeftHPlatCoords,
} from "./dataGenerators";

// TODO: dependency injection
const buildingAreaService = new BuildingAreaService();

describe("BuildingAreaService", () => {
  describe("processAreaData", () => {
    test("it splits the building limit correctly", () => {
      const testData = getBuildingAreaInput(
        getMiddlebLimCoords(),
        getLeftHPlatCoords(),
        getRightHPlatCoords()
      );
      const processedAreaData = buildingAreaService.processAreaData(testData);

      const expectedSplitPolygons = [
        polygon(
          [
            [
              [2.0, 3.0],
              [3.0, 3.0],
              [3.0, 5.0],
              [2.0, 5.0],
              [2.0, 3.0],
            ],
          ],
          { elevation: 1 }
        ),
        polygon(
          [
            [
              [3.0, 3.0],
              [5.0, 3.0],
              [5.0, 5.0],
              [3.0, 5.0],
              [3.0, 3.0],
            ],
          ],
          { elevation: 2 }
        ),
      ];

      expect(processedAreaData.success).toBe(true);

      if (processedAreaData.success === false) {
        return;
      }

      expect(
        booleanEqual(
          expectedSplitPolygons[0],
          processedAreaData.data.splitBuildingLimits.features[0]
        )
      ).toBe(true);

      expect(
        booleanEqual(
          expectedSplitPolygons[1],
          processedAreaData.data.splitBuildingLimits.features[1]
        )
      ).toBe(true);
    });

    test("it returns a validation error when the plateaus does not cover the building limit", () => {
      const testData = getBuildingAreaInput(
        getMiddlebLimCoords(),
        getSmallLeftHPlatCoords(), // Does not cover the building limit
        getRightHPlatCoords()
      );
      const processedAreaData = buildingAreaService.processAreaData(testData);
      expect(processedAreaData.success).toBe(false);

      if (processedAreaData.success) {
        return;
      }

      expect(processedAreaData.errors.length).toBe(1);
    });
  });
});
