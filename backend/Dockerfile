FROM maven:3.8.4-openjdk-17-slim AS builder
WORKDIR /app
COPY . /app
RUN --mount=type=cache,target=/root/.m2,rw mvn clean package -DskipTests

# Base image for Python setup
FROM openjdk:17-slim AS python-base
# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create requirements file approach OR install directly
RUN pip3 install --no-cache-dir --target /opt/python-packages \
    pandas \
    ortools

# Development stage
FROM openjdk:17-slim AS dev
EXPOSE 8000/tcp

# Install Python runtime
RUN apt-get update && apt-get install -y \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages
COPY --from=python-base /opt/python-packages /opt/python-packages

# Copy application files
COPY --from=builder /app/target/*.jar app.jar
COPY --from=builder "/app/algo(table).py" "algo(table).py"
COPY --from=builder "/app/algo(seat).py" "algo(seat).py"

USER 65532

# Set Python path to include our packages
ENV PYTHONPATH="/opt/python-packages:$PYTHONPATH"

ENTRYPOINT ["java","-jar","/app.jar"]

# Production stage
FROM openjdk:17-slim AS prod
EXPOSE 8000/tcp

# Install Python runtime
RUN apt-get update && apt-get install -y \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages
COPY --from=python-base /opt/python-packages /opt/python-packages

# Copy application files
COPY --from=builder /app/target/*.jar app.jar
COPY --from=builder "/app/algo(table).py" "algo(table).py"
COPY --from=builder "/app/algo(seat).py" "algo(seat).py"

USER 65532

# Set Python path to include our packages
ENV PYTHONPATH="/opt/python-packages:$PYTHONPATH"

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "/app.jar"]