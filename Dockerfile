FROM node:slim

WORKDIR /usr/web/

RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

COPY . .
COPY ./healthcheck /usr/bin/healthcheck

RUN npm install -g npm@latest && npm i && npm run build && chmod +x /usr/web/dist/index.js

ENV PORT=3022
ENV HOST=127.0.0.1
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=info

EXPOSE 3022

CMD ["node", "/usr/web/dist/index.js"]
