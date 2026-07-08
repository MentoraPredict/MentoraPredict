import { createClient, type ContentfulClientApi } from "contentful";

const space = import.meta.env.CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.CONTENTFUL_ACCESS_TOKEN;
const environment = import.meta.env.CONTENTFUL_ENVIRONMENT || "master";

export const contentfulClient: ContentfulClientApi<undefined> | null =
  space && accessToken
    ? createClient({ space, accessToken, environment })
    : null;
