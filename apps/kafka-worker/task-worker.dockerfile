FROM node:22-alpine

RUN apk add --no-cache git curl

RUN corepack enable

WORKDIR /home/app

COPY package*.json .
COPY pnpm-lock.yaml . 
COPY pnpm-workspace.yaml .

COPY packages/kafka/tsconfig.json ./packages/kafka/tsconfig.json
COPY packages/kafka/package.json ./packages/kafka/package.json
COPY packages/kafka/src ./packages/kafka/src

COPY packages/agents/tsconfig.json ./packages/agents/tsconfig.json
COPY packages/agents/package.json ./packages/agents/package.json
COPY packages/agents/src ./packages/agents/src

COPY packages/db/tsconfig.json ./packages/db/tsconfig.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/db/src ./packages/db/src
COPY packages/db/prisma.config.ts ./packages/db/prisma.config.ts
COPY packages/db/prisma ./packages/db/prisma

COPY apps/kafka-worker/tsconfig.json ./apps/kafka-worker/tsconfig.json
COPY apps/kafka-worker/package.json ./apps/kafka-worker/package.json
COPY apps/kafka-worker/src/kafka-worker.ts ./apps/kafka-worker/src/kafka-worker.ts

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @repo/kafka build
RUN pnpm --filter @repo/db build
RUN pnpm --filter @repo/agents build
RUN pnpm --filter kafka-worker build

WORKDIR /home/app/apps/kafka-worker

ENTRYPOINT ["node", "dist/kafka-worker.js"]