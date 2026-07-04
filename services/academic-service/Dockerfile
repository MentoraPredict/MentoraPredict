FROM node:22-alpine AS deps
WORKDIR /app
ENV NODE_OPTIONS="--max-http-header-size=16000 --max-old-space-size=4096" \
    NPM_CONFIG_FETCH_TIMEOUT=300000 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=30000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=300000 \
    PNPM_HOME="/root/.pnpm"
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/academic-service/package.json ./services/academic-service/package.json
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app .
COPY services/academic-service ./services/academic-service
RUN pnpm --filter @mentorapredict/academic-service build

FROM node:22-alpine AS runner
WORKDIR /app/services/academic-service
COPY --from=builder /app/services/academic-service/dist ./dist
COPY --from=builder /app/services/academic-service/package.json ./
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/services/academic-service/node_modules ./node_modules
RUN pnpm prune --prod
USER node
ENV NODE_ENV=production
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3003/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/main"]
