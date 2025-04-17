import { FastifyInstance } from "fastify";

type Product = {
  id: string;
  name: string;
  price: number;
};

const products: Product[] = [
  { id: "1", name: "Fancy t-shirt", price: 40 },
  { id: "2", name: "Christmas sweater", price: 100 },
  { id: "3", name: "Beach shorts", price: 20 },
];

let id = "4";

export async function productsRoutes(fastify: FastifyInstance) {
  fastify.addSchema({
    $id: "Product",
    type: "object",
    required: ["id", "name", "price"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      price: { type: "number" },
    },
  });

  fastify.addSchema({
    $id: "ProductInput",
    type: "object",
    required: ["name", "price"],
    properties: {
      name: { type: "string" },
      price: { type: "number" },
    },
  });

  fastify.get<{
    Reply: Product[];
  }>(
    "/products",
    {
      schema: {
        description: "get the list of products",
        response: {
          200: {
            description: "the list of products",
            type: "array",
            items: {
              $ref: "Product",
            },
          },
        },
      },
    },
    async (_request, reply) => {
      return reply.send(products);
    },
  );

  fastify.get<{
    Params: { id: string };
    Reply: Product | { message: string };
  }>(
    "/products/:id",
    {
      schema: {
        description: "get a product by id",
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "product id" },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "The product matching params id",
            $ref: "Product",
          },
          404: {
            description: "product not found response",
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
          },
        },
      },
    },
    async (request, reply) => {
      const product = products.find((product) => product.id === request.params.id);
      if (!product) {
        return reply.status(404).send({ message: "Product not found" });
      }
      return reply.send(product);
    },
  );

  fastify.post<{
    Body: Omit<Product, "id">;
    Reply: Product | { message: string };
  }>(
    "/products",
    {
      schema: {
        description: "add a product",
        body: {
          $ref: "ProductInput",
          required: ["name", "price"],
        },
        response: {
          201: {
            description: "the added product",
            $ref: "Product",
          },
          400: {
            description: "invalid product input response",
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
          },
        },
      },
    },
    async (request, reply) => {
      const { name, price } = request.body;
      if (!name || !price) {
        return reply.status(400).send({ message: "Name and price are required" });
      }
      const product = {
        id: id.toString(),
        name: request.body.name,
        price: request.body.price,
      };
      products.push(product);
      id = (Number(id) + 1).toString();
      return reply.status(201).send(product);
    },
  );
}
