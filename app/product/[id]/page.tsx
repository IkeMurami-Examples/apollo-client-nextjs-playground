"use client";

import { gql, TypedDocumentNode } from "@apollo/client";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

const GET_PRODUCT_DETAILS: TypedDocumentNode<{
  product: {
    id: string;
    title: string;
    description: string;
    mediaUrl: string;
    averageRating?: number;
    reviews?: {
      content: string;
      rating: number;
    }[];
  };
}> = gql`
  fragment ProductFragment on Product {
    averageRating
    reviews {
      content
      rating
    }
  }

  query GetProductDetails($productId: ID!) {
    product(id: $productId) {
      id
      title
      description
      mediaUrl
      ...ProductFragment @defer
    }
  }
`;

export default function Product({
  params: { id },
}: {
  params: { id: string };
}) {
  const { data, error } = useSuspenseQuery(GET_PRODUCT_DETAILS, {
    variables: { productId: decodeURIComponent(id) },
    // if the cache data from SSR is only partial, this will still trigger a network request
    fetchPolicy: "cache-first",
  });
  if (error) {
    // we want not only the initial error to throw towards a suspense boundary,
    // but also errors coming in later to trigger the same boundary
    throw error;
  }

  const { title, description } = data.product;

  return (
    <article>
        <h1>{title}</h1>
        <p>{description}</p>
    </article>
  );
}
