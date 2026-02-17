FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --prod

COPY . .

ENV NODE_ENV=production

CMD ["node", "server.js"]
