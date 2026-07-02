FROM node:22-alpine AS deps
WORKDIR /app
ENV NODE_OPTIONS="--max-http-header-size=16000 --max-old-space-size=4096" \
    NPM_CONFIG_FETCH_TIMEOUT=300000 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=30000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=300000 \
    PNPM_HOME="/root/.pnpm"
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/auth-service/package.json ./services/auth-service/package.json
COPY services/user-service/package.json ./services/user-service/package.json
COPY services/academic-service/package.json ./services/academic-service/package.json
COPY services/analytics-service/package.json ./services/analytics-service/package.json
COPY services/prediction-service/package.json ./services/prediction-service/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/hooks/package.json ./packages/hooks/package.json
COPY packages/services/package.json ./packages/services/package.json
COPY packages/shared-config/package.json ./packages/shared-config/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
COPY packages/shared-utils/package.json ./packages/shared-utils/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS prod-deps
RUN CI=true pnpm install --prod --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app .
COPY services/analytics-service ./services/analytics-service
COPY packages ./packages
RUN pnpm --filter @mentorapredict/analytics-service build

FROM node:22-alpine AS runner
WORKDIR /app/services/analytics-service
COPY --from=builder /app/services/analytics-service/dist ./dist
COPY --from=builder /app/services/analytics-service/package.json ./
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/services/analytics-service/node_modules ./node_modules
USER node
ENV NODE_ENV=production
EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3004/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main"]
