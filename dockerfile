
FROM ubuntu:bionic
FROM secsi/apktool


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
