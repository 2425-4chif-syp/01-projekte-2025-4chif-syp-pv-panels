FROM eclipse-temurin:17-jre

RUN mkdir -p /opt/application
COPY *-runner.jar /opt/application/mqtt-server.jar
WORKDIR /opt/application
ENV DATA_DIR=/data
VOLUME $DATA_DIR

CMD [ "java", "-jar", "mqtt-server.jar" ]