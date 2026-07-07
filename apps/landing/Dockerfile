FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/landing/package.json ./apps/landing/package.json
RUN pnpm install --frozen-lockfile --filter @mentorapredict/landing

FROM deps AS builder
WORKDIR /app
ENV CI=true \
    PNPM_CONFIG_CONFIRM_MODULES_PURGE=false \
    PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false
COPY apps/landing/ ./apps/landing/
RUN pnpm --filter @mentorapredict/landing build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/landing/dist /usr/share/nginx/html
COPY apps/landing/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
