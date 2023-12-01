FROM ubuntu:20.04

RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

RUN apt-get install -y libnss3 \
                       libxss1 \
                       libasound2 \
                       snapd

# Fetch the latest Apktool version
ARG APKTOOL_VERSION=$(curl -s "https://api.github.com/repos/iBotPeaches/Apktool/releases/latest" | grep -Po '"tag_name": "v\K[0-9.]+')

# Download Apktool files
RUN curl -Lo /apktool.jar "https://github.com/iBotPeaches/Apktool/releases/latest/download/apktool_${APKTOOL_VERSION}.jar"
RUN curl -o /apktool "https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool"
RUN chmod +x /apktool.jar /apktool

# Stage 2: Final stage
FROM openjdk:8-jre-slim

# Copy Apktool files from the builder stage
COPY --from=builder /apktool.jar /usr/local/bin/apktool.jar
COPY --from=builder /apktool /usr/local/bin/apktool

# Set execute permissions
RUN chmod +x /usr/local/bin/apktool.jar /usr/local/bin/apktool


RUN npx playwright install-deps
RUN npx playwright install chromium

WORKDIR /usr/src/

COPY package*.json ./
RUN npm install

COPY dist ./

EXPOSE 5050

USER node

CMD ["node", "src"]
