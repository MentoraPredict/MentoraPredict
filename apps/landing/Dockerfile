FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/landing/package.json ./apps/landing/package.json
RUN pnpm install --frozen-lockfile --filter @mentorapredict/landing

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app .
COPY apps/landing/ ./apps/landing/
RUN pnpm --filter @mentorapredict/landing build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/landing/dist /usr/share/nginx/html
COPY apps/landing/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
