FROM node:18-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/analytics-service/package.json ./apps/analytics-service/package.json
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY --from=deps /app .
COPY apps/analytics-service/ ./apps/analytics-service/
RUN pnpm --filter @mentorapredict/analytics-service build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=builder /app/apps/analytics-service/dist ./dist
COPY --from=builder /app/apps/analytics-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules
USER nestjs
ENV NODE_ENV=production
EXPOSE 3006
CMD ["node", "dist/main"]
