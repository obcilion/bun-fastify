# Description

Case for Autodesk Forma.  
This application offers a REST API build on [Bun](https://bun.sh/) and [Fastify](https://fastify.dev/)  
Input validation is done using [Typebox](https://github.com/sinclairzx81/typebox)  
Geospatial operations are done using [Turf.js](https://turfjs.org/)

# Local Development

1. Download Bun: `curl -fsSL https://bun.sh/install | bash` (for linux and mac, see bun webpage for windows)
1. Install dependencies: `bun install`
1. Start app: `bun run start`. The app will listen to `$PORT`, or 3000 if `$PORT` is not set.

## Tests

Tests are found in `./test`. Run them with `bun test`.

# API

The app is deployed to Heroku, and can be accessed via this url: `https://the-bunster-302b6bbb732a.herokuapp.com`

## Create a building area

Url: `POST /building-areas`  
Request body:

```JSON
{
    "building_limits": <GeoJSON>,
    "height_plateaus": <GeoJSON>,
}
```

NOTE: Only feature collections with polygon features are supported

Response body:

```JSON
{
    "result": {
        "id": <UUIDv7>,
        "buildingLimits": <GeoJSON>,
        "heightPlateaus": <GeoJSON>,
        "splitBuildingLimits": <GeoJSON>
    }
}
```

## Get a building area

Url: `GET /building-areas/:id`
Response body:

```JSON
{
    "result": {
        "id": <UUIDv7>,
        "buildingLimits": <GeoJSON>,
        "heightPlateaus": <GeoJSON>,
        "splitBuildingLimits": <GeoJSON>
    }
}
```

## Update a building area

Url: `PUT /building-areas/:id`
Request body:

```JSON
{
    "building_limits": <GeoJSON>,
    "height_plateaus": <GeoJSON>,
}
```

NOTE: This will create a new building area with the given id if it does not already exist. Only feature collections with polygon features are supported

Response body:

```JSON
{
    "result": {
        "id": <UUIDv7>,
        "buildingLimits": <GeoJSON>,
        "heightPlateaus": <GeoJSON>,
        "splitBuildingLimits": <GeoJSON>
    }
}
```

## Delete a building area

Url: `DELETE /building-areas/:id`

## Errors

There are a two different types of errors, depending on where they arrise. Unifying them to a single format would be ideal, but not viable for a small project such as this.

### Fastify validation error

Status: 400  
Body example:

```JSON
{
    "code": "FST_ERR_VALIDATION",
    "error": "Bad Request",
    "message": "body/building_limits/features/0 must have required property 'type'",
    "statusCode": 400
}
```

### Application error

Status: 400  
Body example:

```JSON
{
    "errors": [
        "First and last Position are not equivalent."
    ]
}
```

# Notes

Input data (e.g. `building_limits`) uses snake_case to fit the provided example data, while output data uses camelCase according to JSON best practice. Either can be changed easily.

## Validation

Input validation is done using a rudimentary typebox schema that supports parts of the GeoJSON spec.  
To account for inaccuracies in the input data, up to 5 m^2 of the building limit can be uncovered by the height plateaus.

## Persistence

For the sake of simplicity, all incoming data is stored locally on the server in .json files, instead of in a DB.  
This means that all data will be cleared whenever the server restarts, such as during a deploy.

Building limits, height plateaus, and split building limits are stored as a single entity. A more advanced application would store them as three separate entities, where updating the limits or plateaus would re-calculate the split building limits.

## Security

- There is no authentication or authorization at all
- IDs are not sanitized, so clever IDs may be crafted to store or delete files at arbitrary locations

## Concurrency

Files are locked during save, but there is otherwise no functionality to handle concurrency.

One solution is to implement optimistic locking using `ETags`. This is quite easy to implement for both frontend and backend, and a good fit if the chance for collision is low.

Another, more involved solution for handling concurrency is to make all the data live, so all changes in one editor are propagated to all other editors with the same project open.

## Testing

CI is enabled in GitHub, but only a minimal set of tests are provided, to make sure the "happy path" works.  
With more time the following would be implemented:

- More input data cases for the buildingAreaService, including edge cases
- Endpoint tests, with illegal and strange data to push the validation, both for request bodies, IDs, and URLs
- More error cases for the buildingAreaService
- Integration tests using the endpoints
