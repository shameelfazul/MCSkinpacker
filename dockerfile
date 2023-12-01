FROM ubuntu:20.04


RUN RUN apt-get update && apt-get install -y curl
# Download the Linux wrapper script for Apktool and save it as apktool
RUN curl -o apktool https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool && \
    chmod +x apktool

# Download the latest version of Apktool and rename the JAR file
RUN curl -Lo apktool.jar https://bitbucket.org/iBotPeaches/apktool/downloads/$(curl -s https://api.bitbucket.org/2.0/repositories/iBotPeaches/apktool/downloads | jq -r '.values[0].links.self.href' | awk -F'/' '{print $NF}')

# Move both apktool.jar and the wrapper script to /usr/local/bin
RUN mv apktool apktool.jar /usr/local/bin/

# Make both files executable
RUN chmod +x /usr/local/bin/apktool /usr/local/bin/apktool.jar

# RUN apt-get update && apt-get install -y curl && \
#     curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
#     apt-get install -y nodejs



# RUN apt-get install -y libnss3 \
#                        libxss1 \
#                        libasound2 \
#                        snapd

# RUN systemctl start snapd
# RUN snap install hello-world
# RUN npx playwright install-deps
# RUN npx playwright install chromium

WORKDIR /usr/src/

COPY package*.json ./
RUN npm install

COPY dist ./

EXPOSE 5050

USER node

CMD ["node", "src"]
