FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @mentorapredict/web

FROM deps AS builder
WORKDIR /app
ENV CI=true \
    PNPM_CONFIG_CONFIRM_MODULES_PURGE=false \
    PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false

COPY apps/web/ ./apps/web/
RUN pnpm --filter @mentorapredict/web build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
