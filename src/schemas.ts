import { Type, type Static } from "@sinclair/typebox";
import {
  GeoJsonFeatureCollectionSchema,
  GeoJsonFeatureSchema,
} from "./geoJson";

export const BuildingLimitsSchema = GeoJsonFeatureCollectionSchema;

export const HeightPlateauSchema = Type.Intersect([
  GeoJsonFeatureSchema,
  Type.Object({
    properties: Type.Object({
      elevation: Type.Number(),
    }),
  }),
]);

export const HeightPlateausSchema = Type.Intersect([
  GeoJsonFeatureCollectionSchema,
  Type.Object({
    features: Type.Array(HeightPlateauSchema),
  }),
]);

export type BuildingAreaInput = Static<typeof BuildingAreaSchema>;
export const BuildingAreaSchema = Type.Object({
  building_limits: BuildingLimitsSchema,
  height_plateaus: HeightPlateausSchema,
});
