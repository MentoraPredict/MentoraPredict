FROM node:22-alpine AS deps
WORKDIR /app
ENV NODE_OPTIONS="--max-http-header-size=16000 --max-old-space-size=4096" \
    NPM_CONFIG_FETCH_TIMEOUT=300000 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=30000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=300000 \
    PNPM_HOME="/root/.pnpm"
RUN npm install -g pnpm@11.0.0
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services ./services
COPY packages ./packages
RUN pnpm install

FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@11.0.0
COPY --from=deps /app .
RUN pnpm --filter @mentorapredict/analytics-service build

FROM node:22-alpine AS runner
WORKDIR /app/services/analytics-service
RUN apk add --no-cache wget && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=builder /app/services/analytics-service/dist ./dist
COPY --from=builder /app/services/analytics-service/package.json ./
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/services/analytics-service/node_modules ./node_modules
USER nestjs
ENV NODE_ENV=production
EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3004/health || exit 1
CMD ["node", "dist/main"]
