FROM oven/bun:latest AS builder
WORKDIR /usr/src/app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

FROM oven/bun:latest AS release
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules

COPY . .

USER bun
EXPOSE 3000/tcp

ENTRYPOINT [ "bun", "run", "src/index.ts" ]