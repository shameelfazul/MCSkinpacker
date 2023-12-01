FROM ubuntu:20.04

RUN apt-get update && \
    apt-get install -y curl \
                       libnss3 \
                       libxss1 \
                       libasound2 && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs default-jre && \
    rm -rf /var/lib/apt/lists/*

RUN curl -o apktool https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool && chmod +x apktool
RUN curl -L -o apktool.jar https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.9.0.jar
RUN mv apktool apktool.jar /usr/local/bin/
RUN chmod +x /usr/local/bin/apktool /usr/local/bin/apktool.jar

RUN apktool --version
RUN npx playwright install-deps
RUN npx playwright install chromium

WORKDIR /usr/src/

COPY package*.json ./
RUN npm install

COPY dist ./

EXPOSE 5050

USER node

CMD ["node", "src"]
