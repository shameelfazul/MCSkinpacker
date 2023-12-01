FROM ubuntu:20.04



RUN apt update && apt install -y snapd
RUN sudo apt-get update && sudo apt-get install -yqq daemonize dbus-user-session fontconfig
RUN sudo daemonize /usr/bin/unshare --fork --pid --mount-proc /lib/systemd/systemd --system-unit=basic.target
RUN exec sudo nsenter -t $(pidof systemd) -a su - $LOGNAME
# RUN snap install apktool
RUN snap --version

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
