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

type GetProductsResponse = {
  data?: {
    id: string;
    name: string;
    price: number;
  }[];
};

const productsResponse = (await getProducts()) satisfies GetProductsResponse;
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

type GetProductResponse = {
  data?: {
    id: string;
    name: string;
    price: number;
  };
  error?: { message: string };
};

const validProductResponse = (await addProduct({
  product: {
    name: "My New Post",
    price: 123,
  },
})) satisfies GetProductResponse;
console.log("Valid product response :", validProductResponse);

const invalidProductResponse = (await addProduct({
  // @ts-expect-error - invalid product
  product: {
    name: "My New Post",
  },
})) satisfies GetProductResponse;
console.log("Invalid product response :", invalidProductResponse);
