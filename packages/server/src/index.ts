import fastify from "fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { productsRoutes } from "./routes/products.js";

const fastifyServer = fastify({ logger: true });

await fastifyServer.register(fastifyHelmet);
await fastifyServer.register(fastifySwagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Simple Frontend demo for type-safe APIs",
      description: "A demo of end-to-end type-safe APIs using open APIs spec",
      version: "0.1.0",
    },
    servers: [
      {
        url: "https://demo-type-safe-apis-production.up.railway.app/",
        description: "Production server",
      },
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
});

await fastifyServer.register(fastifySwaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
});

await fastifyServer.register(productsRoutes);

await fastifyServer.ready();

fastifyServer.listen(
  { host: "::", port: Number(process.env["PORT"]) || 3000 },
  (err) => {
    if (err) {
      fastifyServer.log.error(err);
      process.exit(1);
    }
  },
);
