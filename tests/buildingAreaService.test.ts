import { expect, test, describe } from "bun:test";
import type { BuildingAreaInput } from "../src/schemas";
import { BuildingAreaService } from "../src/buildingAreaService";
import { booleanEqual, polygon } from "@turf/turf";

// TODO: dependency injection
const buildingAreaService = new BuildingAreaService();

describe("BuildingAreaService", () => {
  describe("processAreaData", () => {
    test("it splits the building limit correctly", () => {
      const testData = getDefaultBuildingAreaInput();
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

      expect(
        booleanEqual(
          expectedSplitPolygons[0],
          processedAreaData.splitBuildingLimits.features[0]
        )
      ).toBe(true);

      expect(
        booleanEqual(
          expectedSplitPolygons[1],
          processedAreaData.splitBuildingLimits.features[1]
        )
      ).toBe(true);
    });
  });
});

function getDefaultBuildingAreaInput(): BuildingAreaInput {
  const bLimCoords = [
    [
      [2.0, 3.0],
      [5.0, 3.0],
      [5.0, 5.0],
      [2.0, 5.0],
      [2.0, 3.0],
    ],
  ];

  const hPlat1Coords = [
    [
      [1.0, 1.0],
      [3.0, 1.0],
      [3.0, 6.0],
      [1.0, 6.0],
      [1.0, 1.0],
    ],
  ];
  const hPlat2Coords = [
    [
      [3.0, 1.0],
      [6.0, 1.0],
      [6.0, 6.0],
      [3.0, 6.0],
      [3.0, 1.0],
    ],
  ];

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
