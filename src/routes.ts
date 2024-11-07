import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { BuildingAreaSchema } from "./schemas";
import type { FastifyInstance } from "fastify";
import { BuildingAreaService } from "./buildingAreaService";

// TODO: dependency injection
const buildingAreaService = new BuildingAreaService();

export async function routes(fastify: FastifyInstance, _options: any) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
  server.post(
    "/building-area",
    {
      schema: {
        body: BuildingAreaSchema,
      },
    },
    (request, reply) => {
      const processedAreaData =
        buildingAreaService.processAndStoreBuildingAreaData(request.body);

      return reply.status(201).send({ result: processedAreaData });
    }
  );
}
