FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/metrics-service/package.json ./services/metrics-service/package.json
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY --from=deps /app .
COPY services/metrics-service/ ./services/metrics-service/
RUN pnpm --filter @mentorapredict/metrics-service build

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=builder /app/services/metrics-service/dist ./dist
COPY --from=builder /app/services/metrics-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules
USER nestjs
ENV NODE_ENV=production
EXPOSE 3004
CMD ["node", "dist/main"]
