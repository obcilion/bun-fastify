import type { BuildingAreaInput } from "../src/schemas";

export function getMiddlebLimCoords() {
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
export function getLeftHPlatCoords() {
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
export function getSmallLeftHPlatCoords() {
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
export function getRightHPlatCoords() {
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
export function getBuildingAreaInput(
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
