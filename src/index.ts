import Fastify from "fastify";
import { routes } from "./routes";

const fastify = Fastify({
  logger: true,
});

fastify.register(routes);

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
