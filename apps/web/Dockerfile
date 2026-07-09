FROM node:22-alpine as builder

RUN corepack enable

WORKDIR /home/app

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm --filter web build

FROM node:22-alpine

RUN corepack enable

WORKDIR /home/app

COPY --from=builder /home/app/apps/web/.next/standalone ./
COPY --from=builder /home/app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /home/app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"] 