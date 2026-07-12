FROM node:22-alpine AS deps
WORKDIR /app
ENV NODE_OPTIONS="--max-http-header-size=16000 --max-old-space-size=4096" \
    NPM_CONFIG_FETCH_TIMEOUT=300000 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=30000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=300000 \
    PNPM_HOME="/root/.pnpm"
RUN corepack enable
COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared-logger/package.json ./packages/shared-logger/package.json
COPY services/auth-service/package.json ./services/auth-service/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS prod-deps
RUN CI=true pnpm install --prod --frozen-lockfile

FROM deps AS builder
WORKDIR /app
ENV CI=true \
    PNPM_CONFIG_CONFIRM_MODULES_PURGE=false \
    PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false
COPY packages/shared-logger ./packages/shared-logger
COPY services/auth-service ./services/auth-service
RUN pnpm --filter @mentorapredict/shared-logger build \
    && pnpm --filter @mentorapredict/auth-service build

FROM prod-deps AS runner
WORKDIR /app/services/auth-service
COPY --from=builder /app/packages/shared-logger/dist /app/packages/shared-logger/dist
COPY --from=builder /app/packages/shared-logger/package.json /app/packages/shared-logger/package.json
COPY --from=builder /app/services/auth-service/dist ./dist
COPY --from=builder /app/services/auth-service/package.json ./
USER node
ENV NODE_ENV=production
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main"]
