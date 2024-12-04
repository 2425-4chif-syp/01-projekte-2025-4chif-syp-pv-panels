FROM eclipse-temurin:17-jre

RUN mkdir -p /opt/application
COPY target/*-runner.jar /opt/application/leoenergy.jar
WORKDIR /opt/application
CMD ["java", "-jar", "leoenergy.jar"]
