import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { BuildingAreaSchema } from "./schemas";
import type { FastifyInstance } from "fastify";
import { BuildingAreaService } from "./buildingAreaService";
import { FileStorage } from "./fileStorage";

// TODO: dependency injection
const fileStorage = new FileStorage();
const buildingAreaService = new BuildingAreaService(fileStorage);

export async function routes(fastify: FastifyInstance, _options: any) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // -- Create --
  server.post(
    "/building-areas",
    {
      schema: {
        body: BuildingAreaSchema,
      },
    },
    async (request, reply) => {
      const processedAreaDataResult =
        await buildingAreaService.processAndSaveBuildingAreaData(request.body);

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

  // -- Read --
  server.get("/building-areas/:id", async (request, reply) => {
    // This works fine
    const { id } = request.params;
    const loadAreaDataResult =
      await buildingAreaService.getBuildingAreaData(id);

    if (!loadAreaDataResult.success) {
      return reply.status(400).send({
        errors: loadAreaDataResult.errors,
      });
    }

    if (loadAreaDataResult.data === null) {
      return reply.status(404).send();
    }

    return reply.status(200).send({
      result: {
        id,
        data: loadAreaDataResult.data,
      },
    });
  });

  // -- Update --
  server.put(
    "/building-areas/:id",
    {
      schema: {
        body: BuildingAreaSchema,
      },
    },
    async (request, reply) => {
      // This works fine
      const { id } = request.params;
      const processedAreaDataResult =
        await buildingAreaService.processAndSaveBuildingAreaData(
          request.body,
          id
        );

      if (!processedAreaDataResult.success) {
        return reply.status(400).send({
          errors: processedAreaDataResult.errors,
        });
      }

      const result = {
        id: processedAreaDataResult.id,
        data: processedAreaDataResult.data,
      };

      return reply.status(200).send({ result });
    }
  );

  // -- Delete --
  server.delete("/building-areas/:id", async (request, reply) => {
    // This works fine
    const { id } = request.params;
    await buildingAreaService.deleteBuildingArea(id);

    return reply.status(204).send();
  });
}
