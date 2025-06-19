FROM maven:3.8.4-openjdk-17-slim AS builder
WORKDIR /app
COPY . /app
RUN --mount=type=cache,target=/root/.m2,rw mvn clean package -DskipTests

FROM openjdk
EXPOSE 8000/tcp
COPY --from=builder /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]