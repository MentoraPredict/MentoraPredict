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
COPY --from=deps /app .
RUN pnpm --filter @mentorapredict/recommendation-service build

FROM node:22-alpine AS runner
WORKDIR /app/services/recommendation-service
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=builder /app/services/recommendation-service/dist ./dist
COPY --from=builder /app/services/recommendation-service/package.json ./
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/services/recommendation-service/node_modules ./node_modules
USER nestjs
ENV NODE_ENV=production
EXPOSE 3005
CMD ["node", "dist/main"]
