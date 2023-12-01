FROM node:14-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends snapd \
    && snap install apktool --classic \
    && npx playwright install-deps \
    && npx playwright install chromium \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/

COPY package*.json ./
RUN npm install

COPY dist ./

EXPOSE 5050

USER node

CMD ["node", "src"]