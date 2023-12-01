
FROM ubuntu:bionic
FROM secsi/apktool as apktool_base

# Copy necessary files from the first stage
COPY --from=apktool_base /usr/local/bin/apktool /usr/local/bin/apktool
COPY --from=apktool_base /usr/local/bin/apktool.jar /usr/local/bin/apktool.jar

# Install any additional dependencies you need from ubuntu:bionic
RUN apktool --version

# Set the working directory
WORKDIR /app

# Copy your application code or additional files
# ...

# Set any environment variables if needed
# ...

# Define the default command to run when the container starts
CMD ["bash"]
