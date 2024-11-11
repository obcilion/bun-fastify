import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { BuildingAreaSchema } from "./schemas";
import type { FastifyInstance } from "fastify";
import {
  BuildingAreaService,
  type ProcessAreaDataResult,
} from "./buildingAreaService";
import { FileStorage } from "./fileStorage";

// TODO: dependency injection
const fileStorage = new FileStorage();
const buildingAreaService = new BuildingAreaService(fileStorage);

export async function routes(fastify: FastifyInstance, _options: any) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
  server.post(
    "/building-area",
    {
      schema: {
        body: BuildingAreaSchema,
      },
    },
    async (request, reply) => {
      const processedAreaDataResult =
        await buildingAreaService.processAndStoreBuildingAreaData(request.body);

      if (!processedAreaDataResult.success) {
        return reply.status(400).send({
          errors: processedAreaDataResult.errors,
        });
      }

      const result = {
        id: processedAreaDataResult.id,
        data: processedAreaDataResult.data,
      };

      return reply.status(201).send({ result });
    }
  );
}
