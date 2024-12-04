package at.htl.leoenergy.mqtt;/*package at.htl.leoenergy.mqtt;

import at.htl.leoenergy.entity.Co2Value;
import at.htl.leoenergy.entity.SensorValue;
import at.htl.leoenergy.influxdb.InfluxDbRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

@ApplicationScoped
public class MqttReceiver {
   @Inject
    InfluxDbRepository influxDbRepository;
    @Inject
    Logger log;
   public void insertMeasurement(SensorValue sensorValue){
       influxDbRepository.insertMeasurementFromJSON(sensorValue);
   }

    public void insertCo2Measurement(Co2Value co2Value){
        influxDbRepository.insertCo2MeasurementFromJSON(co2Value);
    }




   @Incoming("Co2")
   public void recieveCo2(byte[] byteArray){
       log.infof("Received measurement from Co2 mqtt: %s", byteArray.length);

       String msg = new String(byteArray);
       try{
           Co2Value co2Value = Co2Value.fromJson(msg);
           insertCo2Measurement(co2Value);

       }
       catch(Exception e){
           e.printStackTrace();
       }
   }


    @Incoming("leoenergy")
    public void receive(byte[] byteArray) {
       log.infof("Received measurement from leoenergy topic mqtt: %s", byteArray.length);

        String msg = new String(byteArray);
        try {
            SensorValue sensorValue = SensorValue.fromJson(msg);
            insertMeasurement(sensorValue);
        }
        catch (NullPointerException e){
            e.printStackTrace();
        }

    }

}*

package at.htl.leoenergy.mqtt;

import io.quarkus.logging.Log;
import io.smallrye.reactive.messaging.annotations.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Incoming;

@ApplicationScoped
public class MqttReceiver {

    @Incoming("leoenergy")
    @Blocking
    public void receive(String msg) {
        Log.infof("Received message on 'leoenergy' topic: %s", msg);
    }

    @Incoming("co2")
    @Blocking
    public void receiveco2(String msg) {
        Log.infof("Received message on 'co2' topic: %s", msg);
    }
}*/

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;
import io.quarkus.scheduler.Scheduled;
import io.smallrye.reactive.messaging.annotations.Channel;
import io.smallrye.reactive.messaging.annotations.Emitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Singleton;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class MqttReceiver {


    // Map zur Speicherung des ersten empfangenen Wertes für jedes Topic
//    private final Map<String, JsonNode> initialValues = new ConcurrentHashMap<>();
//    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Empfängt Nachrichten vom MQTT-Broker und loggt sie in die Konsole.
     */
//    @Incoming("mqtt-messages")
//    public void receiveMqttMessage(String message, @Channel("mqtt-messages") Emitter<String> emitter) {
//        Log.info("Try to receive message: " + message);
//
////        try {
////            // JSON-Nachricht in ein JsonNode-Objekt parsen
////            JsonNode jsonNode = objectMapper.readTree(message);
////            String topic = jsonNode.get("topic").asText();
////            JsonNode payload = jsonNode.get("payload");
////
////            // Logge die empfangene Nachricht in der Konsole
////            LOG.infof("Topic: %s, Message: %s", topic, payload);
////
////            // Speichert den ersten Wert pro Topic, falls noch nicht vorhanden
////            initialValues.putIfAbsent(topic, payload);
////
////            // Zeigt den initialen Wert in der Konsole an, falls es der erste Eintrag ist
////            if (!initialValues.containsKey(topic)) {
////                LOG.infof("Initialer Wert für Topic %s: %s", topic, payload);
////            }
////
////        } catch (Exception e) {
////            LOG.error("Fehler beim Verarbeiten der MQTT-Nachricht", e);
////        }
//    }

    @Incoming("mqtt-messages")
    //@Scheduled(every = "10s")
    public void receiveMqttMessage(byte[] raw) {
        Log.info("Try to receive message: " + new String(raw));
    }
}


