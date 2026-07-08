import { createClient } from "contentful";

const space = import.meta.env.CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.CONTENTFUL_ACCESS_TOKEN;
const environment = import.meta.env.CONTENTFUL_ENVIRONMENT ?? "master";

if (!space || !accessToken) {
  throw new Error(
    "Missing Contentful environment variables: CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN are required."
  );
}

export const contentfulClient = createClient({
  space,
  accessToken,
  environment,
});
