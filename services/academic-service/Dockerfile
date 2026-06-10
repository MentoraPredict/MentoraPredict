FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/academic-service/package.json ./services/academic-service/package.json
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY --from=deps /app .
RUN pnpm --filter @mentorapredict/academic-service build

FROM node:22-alpine AS runner
WORKDIR /app/services/academic-service
RUN apk add --no-cache wget && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=builder /app/services/academic-service/dist ./dist
COPY --from=builder /app/services/academic-service/package.json ./
COPY --from=builder /app/node_modules /app/node_modules
USER nestjs
ENV NODE_ENV=production
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3003/health || exit 1
CMD ["node", "dist/main"]
