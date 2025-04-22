package at.htl.leoenergy.mqtt;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Message;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.quarkus.logging.Log;
import io.smallrye.reactive.messaging.mqtt.MqttMessage;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

@ApplicationScoped
public class MqttReceiver {

    @Inject
    Event<String> messageEvent;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Incoming("mqtt-eg")
    public CompletionStage<Void> receiveEgMessage(MqttMessage<byte[]> message) {
        return processMessage(message);
    }

    @Incoming("mqtt-ug")
    public CompletionStage<Void> receiveUgMessage(MqttMessage<byte[]> message) {
        return processMessage(message);
    }

    private CompletionStage<Void> processMessage(MqttMessage<byte[]> message) {
        return CompletableFuture.runAsync(() -> {
            try {
                String topic = message.getTopic();
                String payload = new String(message.getPayload());

                Log.info("Received MQTT message - Topic: " + topic + ", Payload: " + payload);

                // Parse the topic
                String[] topicParts = topic.split("/");
                if (topicParts.length < 3) {
                    Log.warn("Invalid topic format: " + topic);
                    return;
                }

                // Extract topic parts
                String floor = topicParts[0];     // eg or ug
                String room = topicParts[1];      // already contains e72 or u86
                String sensorType = topicParts[2]; // co2, temperature, etc.

                // Create the formatted topic - using parts as they are
                String formattedTopic = String.format("%s/%s/%s", floor, room, sensorType);

                try {
                    // Try to parse the payload
                    double value;
                    try {
                        JsonNode jsonNode = objectMapper.readTree(payload);
                        if (jsonNode.has("value")) {
                            value = jsonNode.get("value").asDouble();
                        } else if (jsonNode.has("timestamp") && jsonNode.has("value")) {
                            value = jsonNode.get("value").asDouble();
                        } else {
                            value = Double.parseDouble(payload);
                        }
                    } catch (Exception e) {
                        value = Double.parseDouble(payload);
                    }

                    // Create the message for the frontend
                    ObjectNode messageNode = objectMapper.createObjectNode();
                    messageNode.put("topic", formattedTopic);
                    
                    ObjectNode valueNode = objectMapper.createObjectNode();
                    valueNode.put("value", value);
                    messageNode.set("message", valueNode);

                    String jsonMessage = messageNode.toString();
                    Log.info("Sending to WebSocket: " + jsonMessage);
                    messageEvent.fire(jsonMessage);

                } catch (Exception e) {
                    Log.error("Error processing message payload", e);
                }

            } catch (Exception e) {
                Log.error("Error processing MQTT message", e);
            }
        }).thenAccept(unused -> message.ack());
    }
}


