FROM node:22-alpine

RUN corepack enable

WORKDIR home/app

COPY package.json ./package.json
COPY pnpm-workspace.yamml ./pnpm-workspace.yaml
COPY pnpm-lock.yaml ./pnpm-lock.yaml

COPY packages/kafka/package.json ./packages/kafka/package.json
COPY packages/kafka/tsconfig.json ./packages/kafka/tsconfig.json
COPY packages/kafka/src ./packages/kafka/src

COPY packages/db/package.json ./packages/db/package.json
COPY packages/db/tsconfig.json ./packages/db/tsconfig.json
COPY packages/db/prisma.config.ts ./packages/db/prisma.config.ts
COPY packages/db/src ./packages/db/src
COPY packages/db/prisma ./packages/db/prisma

COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/backend/tsconfig.json ./apps/backend/tsconfig.json
COPY apps/backend/src/ ./apps/backend/src

RUN pnpm install --frozen-lockfile
RUN pnpm --filter backend build
RUN pnpm --filter @repo/kafka build
RUN pnpm --filter @repo/db build

ENTRYPOINT ["node", "./apps/backend/dist/index.js"]