# Stage 1: Build
FROM node:20.18-alpine AS build-stage

ARG NEXT_PUBLIC_REST_IPFS_GATEWAY='ipfs.io/ipfs/'
ENV NEXT_PUBLIC_REST_IPFS_GATEWAY=$NEXT_PUBLIC_REST_IPFS_GATEWAY

WORKDIR /app

# Install deps with cache optimization
COPY package*.json ./
RUN apk add --no-cache python3 make g++ && npm ci --silent

# Copy source code
COPY . .

# Build app
RUN npm run build && npm prune --production


# Stage 2: Slim production image
FROM node:20.18-alpine

WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build-stage /app/package*.json ./
COPY --from=build-stage /app/.next ./.next
COPY --from=build-stage /app/public ./public
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/next.config.mjs ./

# Expose Next.js port
EXPOSE 3000

ENV NODE_ENV=production