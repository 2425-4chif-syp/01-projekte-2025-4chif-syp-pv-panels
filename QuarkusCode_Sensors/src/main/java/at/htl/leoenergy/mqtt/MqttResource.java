package at.htl.leoenergy.mqtt;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpoint;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/sensors")
@ApplicationScoped
public class MqttResource {
    private Map<Session, Session> sessions = new ConcurrentHashMap<>();
    private ObjectMapper mapper = new ObjectMapper();

    @OnOpen
    public void onOpen(Session session) {
        sessions.put(session, session);
        System.out.println("WebSocket session opened: " + session.getId());
    }

    @OnClose
    public void onClose(Session session) {
        sessions.remove(session);
        System.out.println("WebSocket session closed: " + session.getId());
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        sessions.remove(session);
        System.out.println("WebSocket error in session " + session.getId() + ": " + throwable.getMessage());
    }

    public void onMessage(@Observes String message) {
        try {
            // Annahme: Die MQTT-Nachricht kommt im Format "topic:payload"
            String[] parts = message.split(":", 2);
            if (parts.length == 2) {
                String topic = parts[0].trim();
                String payload = parts[1].trim();

                // Erstelle ein sauberes JSON-Objekt
                ObjectNode messageNode = mapper.createObjectNode();
                messageNode.put("topic", topic);

                // Versuche das Payload als JSON zu parsen
                try {
                    ObjectNode payloadNode = (ObjectNode) mapper.readTree(payload);
                    messageNode.set("message", payloadNode);
                } catch (Exception e) {
                    // Wenn das Payload kein JSON ist, sende es als String
                    messageNode.put("message", payload);
                }

                String formattedMessage = mapper.writeValueAsString(messageNode);
                System.out.println("Broadcasting message: " + formattedMessage);
                broadcast(formattedMessage);
            }
        } catch (Exception e) {
            System.err.println("Error processing message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void broadcast(String message) {
        sessions.values().forEach(session -> {
            try {
                session.getAsyncRemote().sendText(message);
            } catch (Exception e) {
                System.err.println("Error sending message to session: " + e.getMessage());
            }
        });
    }
} 