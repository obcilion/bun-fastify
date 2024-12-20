import { Type, type Static } from "@sinclair/typebox";

export type GeoJsonPolygon = Static<typeof GeoJsonPolygonSchema>;
export const GeoJsonPolygonSchema = Type.Object({
  type: Type.Literal("Polygon"),
  coordinates: Type.Array(
    Type.Array(
      Type.Tuple([
        Type.Number({ minimum: -180, maximum: 180 }), // Longitude
        Type.Number({ minimum: -90, maximum: 90 }), // Latitude
      ]),
      { minItems: 3 }
    )
  ),
});

export type GeoJsonFeature = Static<typeof GeoJsonFeatureSchema>;
export const GeoJsonFeatureSchema = Type.Object({
  type: Type.Literal("Feature"),
  geometry: Type.Union([
    GeoJsonPolygonSchema, // only polygon is supported for now
    // add other schemas here
  ]),
  properties: Type.Optional(Type.Any()),
});

export type GeoJsonFeatureCollection = Static<
  typeof GeoJsonFeatureCollectionSchema
>;
export const GeoJsonFeatureCollectionSchema = Type.Object({
  type: Type.Literal("FeatureCollection"),
  features: Type.Array(GeoJsonFeatureSchema, { minItems: 1 }),
});
