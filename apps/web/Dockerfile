FROM node:22-alpine as builder

RUN corepack enable

WORKDIR /home/app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .

RUN pnpm install --frozen-lockfile

RUN test -n "$NEXT_PUBLIC_API_URL" || \
    (echo "NEXT_PUBLIC_API_URL is required" && exit 1)

RUN pnpm --filter web build

FROM node:22-alpine

RUN corepack enable

WORKDIR /home/app

COPY --from=builder /home/app/apps/web/.next/standalone ./
COPY --from=builder /home/app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /home/app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"] 