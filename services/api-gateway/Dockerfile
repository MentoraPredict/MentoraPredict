FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services ./services
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app ./
RUN pnpm --filter @mentorapredict/api-gateway build

FROM node:22-alpine AS runner
WORKDIR /app/services/api-gateway
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=builder /app/services/api-gateway/dist ./dist
COPY --from=builder /app/services/api-gateway/package.json ./
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/services/api-gateway/node_modules ./node_modules
USER nestjs
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]
