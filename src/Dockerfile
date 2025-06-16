FROM node:20.18-slim AS build-stage
WORKDIR /app

COPY package*.json ./

RUN npm install --silent

COPY . .

RUN npm run build


FROM node:20.18-slim
ARG NEXT_PUBLIC_REST_IPFS_GATEWAY='ipfs.io/ipfs/,gateway.pinata.cloud/ipfs/,w3s.link/ipfs/'
ENV NEXT_PUBLIC_REST_IPFS_GATEWAY=${NEXT_PUBLIC_REST_IPFS_GATEWAY}
WORKDIR /app
COPY --from=build-stage /app ./
EXPOSE 3000