import { expect, test, describe } from "bun:test";
import type { BuildingAreaInput } from "../src/schemas";
import { BuildingAreaService } from "../src/buildingAreaService";
import { booleanEqual, polygon } from "@turf/turf";

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

function getMiddlebLimCoords() {
  return [
    [
      [2.0, 3.0],
      [5.0, 3.0],
      [5.0, 5.0],
      [2.0, 5.0],
      [2.0, 3.0],
    ],
  ];
}

function getLeftHPlatCoords() {
  return [
    [
      [1.0, 1.0],
      [3.0, 1.0],
      [3.0, 6.0],
      [1.0, 6.0],
      [1.0, 1.0],
    ],
  ];
}

function getSmallLeftHPlatCoords() {
  return [
    [
      [1.0, 4.0],
      [3.0, 4.0],
      [3.0, 6.0],
      [1.0, 6.0],
      [1.0, 4.0],
    ],
  ];
}

function getRightHPlatCoords() {
  return [
    [
      [3.0, 1.0],
      [6.0, 1.0],
      [6.0, 6.0],
      [3.0, 6.0],
      [3.0, 1.0],
    ],
  ];
}

function getBuildingAreaInput(
  bLimCoords: number[][][],
  hPlat1Coords: number[][][],
  hPlat2Coords: number[][][]
): BuildingAreaInput {
  return {
    building_limits: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: bLimCoords,
          },
        },
      ],
    },
    height_plateaus: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: hPlat1Coords,
          },
          properties: {
            elevation: 1,
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: hPlat2Coords,
          },
          properties: {
            elevation: 2,
          },
        },
      ],
    },
  } as BuildingAreaInput;
}
