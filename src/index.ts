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
  const parsedPort = parseInt(process.env["PORT"] || "");
  const port = Number.isNaN(parsedPort) ? 3000 : parsedPort;
  try {
    await fastify.listen({
      port: port,
      host: "0.0.0.0",
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
