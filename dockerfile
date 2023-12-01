# Stage 1: Use secsi/apktool as the base image
FROM secsi/apktool as apktool_base

# Stage 2: Extend with additional dependencies from ubuntu:bionic
FROM ubuntu:bionic

# Copy necessary files from the first stage
COPY --from=apktool_base /usr/local/bin/apktool /usr/local/bin/apktool
COPY --from=apktool_base /usr/local/bin/apktool.jar /usr/local/bin/apktool.jar

# Install any additional dependencies you need from ubuntu:bionic
RUN apt-get update && \
    apt-get install -y <package1> <package2> && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy your application code or additional files
# ...

# Set any environment variables if needed
# ...

# Define the default command to run when the container starts
CMD ["bash"]
