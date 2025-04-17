import fastify from "fastify";
import fastifyHelmet from "@fastify/helmet";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

const fastifyServer = fastify({ logger: true });

await fastifyServer.register(fastifyHelmet);
await fastifyServer.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Simple Frontend demo for type-safe APIs",
      description: "A demo of end-to-end type-safe APIs using open APIs spec",
      version: "0.1.0",
    },
    servers: [
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

type User = {
  id: string;
  name: string;
};

const users: User[] = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Doe" },
];

fastifyServer.get<{
  Params: { id: string };
  Reply: User | { message: string };
}>(
  "/users/:id",
  {
    schema: {
      description: "get user by id",
      params: {
        type: "object",
        properties: {
          id: { type: "string", description: "user id" },
        },
      },
      response: {
        200: {
          type: "object",
          description:
            "response and schema description for successful response",
          required: ["id", "name"],
          properties: {
            id: { type: "string" },
            name: { type: "string" },
          },
        },
        404: {
          type: "object",
          description: "response and schema description for error response",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },
  async (request, reply) => {
    const user = users.find((user) => user.id === request.params.id);
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }
    return reply.send(user);
  },
);

type Product = {
  id: string;
  name: string;
  price: number;
};

let id = 0;

fastifyServer.post<{
  Body: Omit<Product, "id">;
  Reply: Product | { message: string };
}>(
  "/products",
  {
    schema: {
      description: "create product",
      body: {
        type: "object",
        required: ["name", "price"],
        properties: {
          name: { type: "string", description: "product name" },
          price: { type: "number", description: "product price" },
        },
      },
      response: {
        201: {
          type: "object",
          description:
            "response and schema description for successful response",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            price: { type: "number" },
          },
        },
        400: {
          type: "object",
          description: "response and schema description for error response",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },
  async (request, reply) => {
    if (!request.body.name || !request.body.price) {
      return reply.status(400).send({ message: "Name and price are required" });
    }
    const product = {
      id: id.toString(),
      name: request.body.name,
      price: request.body.price,
    };
    id++;
    return reply.status(201).send(product);
  },
);

await fastifyServer.ready();

fastifyServer.listen(
  { port: parseInt(<string>process.env["PORT"], 10) ?? 3000 },
  (err) => {
    if (err) {
      fastifyServer.log.error(err);
      process.exit(1);
    }
  },
);
