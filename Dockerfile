ARG VERSION=0.0.12
FROM node:slim AS builder

COPY package.json \
     package-lock.json \
     /usr/web/

WORKDIR /usr/web/

RUN npm install -g npm@latest && npm ci
COPY . .

RUN npm run build

FROM node:slim AS production
ARG VERSION

RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/web/

RUN rm -rf ./*

COPY --from=builder /usr/web .
COPY --from=builder /usr/web/healthcheck /usr/bin/healthcheck

ENV VERSION=${VERSION}
ENV PORT=3022
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=info

EXPOSE $PORT

CMD ["node", "/usr/web/dist/index.js"]
