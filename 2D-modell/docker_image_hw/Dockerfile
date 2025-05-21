FROM maven:3-eclipse-temurin-21-jammy AS builder

WORKDIR /build

COPY ./pom.xml .
COPY ./src ./src

RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jdk-jammy

WORKDIR /opt

COPY --from=builder /build/target/*-runner.jar /opt/backend.jar/opt/backend.jar

CMD ["java", "-jar", "/opt/backend.jar"]