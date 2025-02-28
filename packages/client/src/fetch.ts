import type { paths } from "./api-types.js";
import createClient from "openapi-fetch";

const client = createClient<paths>({
  baseUrl: "http://localhost:3000",
});

type GetUserInput = paths["/users/{id}"]["get"]["parameters"]["path"];
async function getUser({ id }: GetUserInput) {
  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await client.GET("/users/{id}", {
    params: {
      path: { id },
    },
  });
  return { data, error };
}

const user1 = await getUser({ id: "1" });
const user3 = await getUser({ id: "3" });

console.log(user1);
console.log(user3);

type CreateProductInput =
  paths["/products"]["post"]["requestBody"]["content"]["application/json"];

async function createProduct({ product }: { product: CreateProductInput }) {
  const { data, error } = await client.POST("/products", {
    body: product,
  });
  return { data, error };
}

const validProduct = await createProduct({
  product: {
    name: "My New Post",
    price: 123,
  },
});

console.log(validProduct);

const invalidProduct = await createProduct({
  product: {
    name: "My New Post",
  },
});

console.log(invalidProduct);
