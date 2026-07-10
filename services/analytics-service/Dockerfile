FROM node:22-alpine AS deps
WORKDIR /app
ENV NODE_OPTIONS="--max-http-header-size=16000 --max-old-space-size=4096" \
    NPM_CONFIG_FETCH_TIMEOUT=300000 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=30000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=300000 \
    PNPM_HOME="/root/.pnpm"
RUN corepack enable
COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/analytics-service/package.json ./services/analytics-service/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS prod-deps
RUN CI=true pnpm install --prod --frozen-lockfile

FROM deps AS builder
WORKDIR /app
ENV CI=true \
    PNPM_CONFIG_CONFIRM_MODULES_PURGE=false \
    PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false
COPY services/analytics-service ./services/analytics-service
RUN pnpm --filter @mentorapredict/analytics-service build

FROM prod-deps AS runner
WORKDIR /app/services/analytics-service
COPY --from=builder /app/services/analytics-service/dist ./dist
COPY --from=builder /app/services/analytics-service/package.json ./
USER node
ENV NODE_ENV=production
EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3004/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main"]
