FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/landing/package.json ./apps/landing/package.json
RUN pnpm install --frozen-lockfile --filter @mentorapredict/landing

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable

ARG CONTENTFUL_SPACE_ID
ARG CONTENTFUL_ACCESS_TOKEN
ARG CONTENTFUL_ENVIRONMENT=master
ARG PUBLIC_WEB_APP_URL

ENV CONTENTFUL_SPACE_ID=$CONTENTFUL_SPACE_ID
ENV CONTENTFUL_ACCESS_TOKEN=$CONTENTFUL_ACCESS_TOKEN
ENV CONTENTFUL_ENVIRONMENT=$CONTENTFUL_ENVIRONMENT
ENV PUBLIC_WEB_APP_URL=$PUBLIC_WEB_APP_URL

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/landing/node_modules ./apps/landing/node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY apps/landing/ ./apps/landing/
RUN pnpm --filter @mentorapredict/landing build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/landing/dist /usr/share/nginx/html
COPY apps/landing/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
