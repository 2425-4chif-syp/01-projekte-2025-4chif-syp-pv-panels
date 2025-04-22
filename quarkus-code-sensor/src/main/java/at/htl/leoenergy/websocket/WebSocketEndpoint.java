package at.htl.leoenergy.websocket;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpoint;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import io.quarkus.logging.Log;

@ServerEndpoint("/mqtt-ws")
@ApplicationScoped
public class WebSocketEndpoint {
    
    private Map<String, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session) {
        Log.info("WebSocket session opened: " + session.getId());
        sessions.put(session.getId(), session);
    }

    @OnClose
    public void onClose(Session session) {
        Log.info("WebSocket session closed: " + session.getId());
        sessions.remove(session.getId());
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        Log.error("WebSocket error for session " + session.getId(), throwable);
        sessions.remove(session.getId());
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        Log.info("Received message from client: " + message);
    }

    public void onMqttMessage(@Observes String mqttMessage) {
        sessions.values().forEach(session -> {
            session.getAsyncRemote().sendText(mqttMessage);
        });
    }
}