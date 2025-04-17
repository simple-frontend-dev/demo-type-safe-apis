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
console.log("Products response :", productsResponse);

type GetProductInput = paths["/products/{id}"]["get"]["parameters"]["path"];
async function getProduct({ id }: GetProductInput) {
  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await client.GET("/products/{id}", {
    params: {
      path: { id },
    },
  });
  return { data, error };
}
const productResponse = await getProduct({ id: "1" });
console.log("Product response :", productResponse);

type CreateProductInput =
  paths["/products"]["post"]["requestBody"]["content"]["application/json"];
async function createProduct({ product }: { product: CreateProductInput }) {
  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await client.POST("/products", {
    body: product,
  });
  return { data, error };
}

const validProductResponse = await createProduct({
  product: {
    name: "My New Post",
    price: 123,
  },
});
console.log("Valid product response :", validProductResponse);

const invalidProductResponse = await createProduct({
  // @ts-expect-error - invalid product
  product: {
    name: "My New Post",
  },
});
console.log("Invalid product response :", invalidProductResponse);
