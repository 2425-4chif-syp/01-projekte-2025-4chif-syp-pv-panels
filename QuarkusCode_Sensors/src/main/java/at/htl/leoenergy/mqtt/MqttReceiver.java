package at.htl.leoenergy.mqtt;

import io.quarkus.logging.Log;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Message;
import jakarta.enterprise.event.Event;
import jakarta.inject.Inject;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.smallrye.reactive.messaging.mqtt.MqttMessage;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class MqttReceiver {

    @Inject
    Event<String> messageEvent;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Incoming("mqtt-messages")
    public Uni<Void> receiveMqttMessage(Message<byte[]> message) {
        return Uni.createFrom().item(() -> {
            try {
                String topic = "";
                if (message instanceof MqttMessage) {
                    topic = ((MqttMessage<byte[]>) message).getTopic();
                }

                String rawMessage = new String(message.getPayload());
                Log.info("Received MQTT message on topic " + topic + ": " + rawMessage);

                // Erstelle ein JSON-Objekt mit topic und message
                ObjectNode messageNode = objectMapper.createObjectNode();
                messageNode.put("topic", topic);
                messageNode.set("message", parseMessage(rawMessage));

                String formattedMessage = objectMapper.writeValueAsString(messageNode);
                messageEvent.fire(formattedMessage);
            } catch (Exception e) {
                Log.error("Error processing MQTT message", e);
            }
            return null;
        }).replaceWithVoid();
    }

    private ObjectNode parseMessage(String rawMessage) {
        try {
            // Versuche die Nachricht als JSON zu parsen
            return (ObjectNode) objectMapper.readTree(rawMessage);
        } catch (Exception e) {
            // Wenn es kein JSON ist, erstelle ein einfaches Wert-Objekt
            ObjectNode valueNode = objectMapper.createObjectNode();
            try {
                // Versuche den Wert als Zahl zu parsen
                double numericValue = Double.parseDouble(rawMessage.trim());
                valueNode.put("value", numericValue);
            } catch (NumberFormatException nfe) {
                // Wenn es keine Zahl ist, speichere es als String
                valueNode.put("value", rawMessage.trim());
            }
            return valueNode;
        }
    }
}


