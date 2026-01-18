# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Base image with pnpm
# ============================================
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN apk add --no-cache libc6-compat

# ============================================
# Stage 2: Install dependencies
# ============================================
FROM base AS deps
WORKDIR /app

# Copy workspace configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package.json for launch-checklist
COPY apps/launch-checklist/package.json ./apps/launch-checklist/

# Install dependencies with shamefully-hoist
# Use --ignore-scripts to skip native module builds (canvas, etc)
RUN pnpm install --frozen-lockfile --ignore-scripts --shamefully-hoist

# ============================================
# Stage 3: Build the application
# ============================================
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/launch-checklist/node_modules ./apps/launch-checklist/node_modules

# Copy source code
COPY apps/launch-checklist ./apps/launch-checklist
COPY package.json pnpm-workspace.yaml ./

# Build the app
WORKDIR /app/apps/launch-checklist

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm build

# ============================================
# Stage 4: Production runner
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone build
COPY --from=builder --chown=nextjs:nodejs /app/apps/launch-checklist/.next/standalone ./

# Copy static files to BOTH possible locations
COPY --from=builder --chown=nextjs:nodejs /app/apps/launch-checklist/.next/static ./apps/launch-checklist/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/launch-checklist/.next/static ./.next/static

# Copy public folder if it exists
COPY --from=builder --chown=nextjs:nodejs /app/apps/launch-checklist/public ./apps/launch-checklist/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/launch-checklist/public ./public

# Copy full node_modules to ensure all dependencies are available
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 8080

# Start Next.js using ENTRYPOINT (cannot be overridden by Azure startup command)
ENTRYPOINT ["node", "/app/server.js"]
