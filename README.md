# Demo of an end-to-end type safe API

## Server API is using [fastify-swagger](https://github.com/fastify/fastify-swagger/) and [fastify-swagger-ui](https://github.com/fastify/fastify-swagger-ui) to generate an OpenAPI compliant schema from your route declarations

```typescript
import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

const fastifyServer = fastify({ logger: true });

await fastifyServer.register(fastifySwagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Simple Frontend demo for type-safe APIs",
      description: "A demo of end-to-end type-safe APIs using open APIs spec",
      version: "0.1.0",
    },
  },
});

await fastifyServer.register(fastifySwaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
});
```

And inside one of your routes:

```typescript
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
```

This will generate a [swagger UI](https://demo-type-safe-apis-production.up.railway.app/docs) as well as an OpenAPI compliant [schema](https://demo-type-safe-apis-production.up.railway.app/docs/json)

## Client Side is generating a type safe SDK using [OpenAPI fetch from OpenAPI TypeScript](https://openapi-ts.dev/openapi-fetch/)

There is no need for extra client types to have type safety with the API contract as we can automatically generate them:

1. Example to get the list of products for this [published API spec](https://demo-type-safe-apis-production.up.railway.app/docs)

```typescript
import type { paths } from "./api-types.js";
import createClient from "openapi-fetch";

const client = createClient<paths>({
  baseUrl: "https://demo-type-safe-apis-production.up.railway.app/",
});

export async function getProducts() {
  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await client.GET("/products");
  return { data, error };
}

const productsResponse = await getProducts();
```

productsResponse is fully typed as

```typescript
type GetProductsResponse = {
  data?: {
    id: string;
    name: string;
    price: number;
  }[];
};
```

2. Example to add a new product to this [published API spec](https://demo-type-safe-apis-production.up.railway.app/docs)

```typescript
import type { paths } from "./api-types.js";
import createClient from "openapi-fetch";

const client = createClient<paths>({
  baseUrl: "https://demo-type-safe-apis-production.up.railway.app/",
});

type AddProductInput = paths["/products"]["post"]["requestBody"]["content"]["application/json"];

async function addProduct({ product }: { product: AddProductInput }) {
  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await client.POST("/products", {
    body: product,
  });
  return { data, error };
}

const validProductResponse = await addProduct({
  product: {
    name: "My New Post",
    price: 123,
  },
});
//

// if you try to query and invalid product you will get a typescript error
const invalidProductResponse = await addProduct({
  // @ts-expect-error - invalid product
  product: {
    name: "My New Post",
  },
});
```

You do not need to declare types for AddProductInput and you are guaranteed to be in sync with your API server.

TypeScript will also prevent you from being able to call addProduct without price property like above and both responses are fully typed as

```typescript
type GetProductResponse = {
  data?: {
    id: string;
    name: string;
    price: number;
  };
  error?: { message: string };
};
```
