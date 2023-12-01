FROM ubuntu:20.04

RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

RUN apt-get install -y libnss3 \
                       libxss1 \
                       libasound2 \
                       snapd

RUN apt-get update && \
    apt-get install -y default-jre default-jdk wget

RUN wget https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool -O /usr/local/bin/apktool && \
    wget https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.5.2.jar -O /usr/local/bin/apktool.jar && \
    chmod +x /usr/local/bin/apktool

RUN npx playwright install-deps
RUN npx playwright install chromium

WORKDIR /usr/src/

COPY package*.json ./
RUN npm install

COPY dist ./

EXPOSE 5050

USER node

CMD ["node", "src"]
