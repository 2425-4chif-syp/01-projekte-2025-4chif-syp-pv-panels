package at.htlleonding.repository;
import at.htlleonding.entity.Device;
import at.htlleonding.entity.SensorValue;
import at.htlleonding.pojo.SensorValuePojo;

import at.htlleonding.processor.UnitConverter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import io.quarkus.logging.Log;
import io.quarkus.scheduler.Scheduled;
import io.smallrye.reactive.messaging.mqtt.MqttMessage;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.json.JsonObject;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.eclipse.paho.client.mqttv3.MqttCallback;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.*;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;

@ApplicationScoped
public class MqttRepository {
    SensorValuePojo sensorValuePojo;

    @ConfigProperty(name = "json.file-directory-all")
    private String directoryNameAll;
    @Inject
    @Channel("leonergy-demo")
    Emitter<String> emitter;
    private long fileIndex = 0;
    private final AtomicInteger counter = new AtomicInteger();
    //every 5 minutes
    @Scheduled(every = "180s")
    public void invokeSendPeriodicallySend7(){
        importJsonFiles(directoryNameAll,1,"7-");
    }
    @Scheduled(every = "300s")
    public void invokeSendPeriodically8(){
        importJsonFiles(directoryNameAll,1,"8-");
    }
    @Scheduled(every = "300s")
    public void invokeSendPeriodically9(){
        importJsonFiles(directoryNameAll,1,"9-");
    }

    @Scheduled(every = "300s")
    public void invokeSendPeriodically10(){
        importJsonFiles(directoryNameAll,1,"10-");
    }



    public void send(Map<String,String> payload,String measurementId){
        Map.Entry<String,String> entry = payload.entrySet().iterator().next();
        String topic = "leoenergy-demo/" + entry.getKey() + "/" + measurementId;
        MqttMessage<String> message = MqttMessage.of(topic,entry.getValue());
        emitter.send(message);

    }

    public Map<String,String> createPayload(SensorValue sensorValue) throws JsonProcessingException {
        Map<String,String> sensorValueDetails = new HashMap<>();
        SensorValuePojo sensorValuePojo = convertSensorValueToPojo(sensorValue);
        String json = new ObjectMapper().writeValueAsString(sensorValuePojo);
        sensorValueDetails.put(String.valueOf(sensorValue.getDevice().getId()),json);

        return sensorValueDetails;
    }

    public void importJsonFiles(String directory, int limit, String startsWithFilterString) {
        try (Stream<Path> filePathStream = Files.walk(Paths.get(directory)).onClose(() -> {})) {
            // Dateipfade filtern und in eine Liste konvertieren
            List<Path> filePaths = filePathStream
                    .filter(Files::isRegularFile)
                    .filter(f -> !f.toFile().isHidden())
                    .filter(f -> {
                        String fileName = f.getFileName().toString();
                        return fileName.startsWith(startsWithFilterString);
                    })
                    .sorted(Comparator.comparing(this::getDateFromFileName)) // Sortiere die Dateien nach dem Datum im Dateinamen
                    .toList();


            int numFiles = filePaths.size();


            // Iteration über die Dateien, beginnend beim aktuellen Index
            for (int i = 0; i < limit; i++) {
                // Index der aktuellen Datei im Kreislauf
                int currentIndex = (int) (fileIndex + i) % numFiles;

                // Pfad zur aktuellen Datei
                Path filePath = filePaths.get(currentIndex);

                try {
                    processJsonToSensorValue(filePath);
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }

            // Aktuellen Index aktualisieren, um den nächsten Startpunkt festzulegen
            fileIndex = (fileIndex + limit) % numFiles;
        } catch (IOException e) {
            System.out.println("Ordner hat keine Json-files:" + directoryNameAll);
            throw new RuntimeException(e);
        }
    }

    private String getDateFromFileName(Path filePath) {
        String fileName = filePath.getFileName().toString();
        // Extrahiere das Datumsteil aus dem Dateinamen und gib es zurück
        return fileName.split("-")[2];
    }
    long calculateNewDate(long timeOfValueInUnix) {
        LocalDateTime originalDateTime = LocalDateTime.ofEpochSecond(timeOfValueInUnix, 0, ZoneOffset.UTC);
        LocalDateTime todayMidnight = LocalDate.now().atStartOfDay();
        LocalDateTime newDateTime = todayMidnight.withHour(originalDateTime.getHour())
                .withMinute(originalDateTime.getMinute())
                .withSecond(originalDateTime.getSecond())
                .withNano(originalDateTime.getNano());
        return newDateTime.toEpochSecond(ZoneOffset.UTC);
    }

    void processJsonToSensorValue(Path filePath) throws JsonProcessingException {

        ObjectMapper om = new ObjectMapper();
        JsonNode jsonRoot = null;
        Device device = null;

        try {
            jsonRoot = om.readTree(filePath.toFile());
            device = new Device(
                    jsonRoot.at("/Device/Id").asInt(),
                    jsonRoot.at("/Device/ManufacturerId").asText(),
                    jsonRoot.at("/Device/Medium").asText(),
                    jsonRoot.at("/Device/Name").asText(),
                    jsonRoot.at("/Device/Site").asText()
            );


        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }

        ArrayNode valueArray = (ArrayNode) jsonRoot.at("/Device/ValueDescs");
        for (JsonNode jsonNode : valueArray) {


            LocalDate today = LocalDate.now();
            LocalDate night = today.atStartOfDay().toLocalDate();
            long unixTimeStamp = night.atStartOfDay().toEpochSecond(ZoneOffset.UTC);

            long timeOfValueInUnix =  jsonNode.get("Values").get(0).get("Timestamp").asLong();
            long newDate = calculateNewDate(timeOfValueInUnix);
            SensorValue sensorValue = new SensorValue(device,
                    newDate,
                    jsonNode.get("Values").get(0).get("Val").doubleValue(),
                    jsonNode.get("Id").asLong(),
                    jsonNode.get("DescriptionStr").asText(),
                    jsonNode.get("UnitStr").asText());

            if ( jsonNode.get("UnitStr").asText().equals("W") || jsonNode.get("UnitStr").asText().equals("Wh")) {
                send(createPayload(sensorValue),String.valueOf(sensorValue.getMeasurementId()));
            }
        }
    }

    public SensorValuePojo getSensorValuePojo() {
        return sensorValuePojo;
    }

    public void setSensorValuePojo(SensorValuePojo sensorValuePojo) {
        this.sensorValuePojo = sensorValuePojo;
    }

    public SensorValuePojo convertSensorValueToPojo(SensorValue sensorValue){
        return  new SensorValuePojo(sensorValue.getDevice().getName(),
                sensorValue.getMeasurementId(),
                sensorValue.getDescription(),
                sensorValue.getUnit(),
                sensorValue.getTime(),
                sensorValue.getValue()
        );
    }

}
