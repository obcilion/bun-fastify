import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { BuildingAreaSchema } from "./schemas";
import type { FastifyInstance } from "fastify";

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
      return request.body;
    }
  );
}
