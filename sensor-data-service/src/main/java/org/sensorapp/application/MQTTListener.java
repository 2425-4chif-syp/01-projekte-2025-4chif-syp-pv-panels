package org.sensorapp.application;

import org.eclipse.paho.client.mqttv3.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.sensorapp.infrastructure.influxdb.InfluxDBService;

import javax.net.ssl.SSLSocketFactory;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

@ApplicationScoped
public class MQTTListener {

    private static final Logger LOGGER = Logger.getLogger(MQTTListener.class.getName());

    private static final String BROKER_URL = System.getenv("MQTT_BROKER_URL");
    private static final String CLIENT_ID = System.getenv("MQTT_CLIENT_ID");
    private static final String USERNAME = System.getenv("MQTT_USERNAME");
    private static final String PASSWORD = System.getenv("MQTT_PASSWORD");

    private static final String[] TOPICS = {"ug/#"}; // Erfasse alle Stockwerke und Sensoren

    private MqttClient client;
    private final InfluxDBService influxDBService;

    public MQTTListener(InfluxDBService influxDBService) {
        this.influxDBService = influxDBService;
    }

    @PostConstruct
    public void init() {
        new Thread(this::connectMQTT).start();
    }

    private void connectMQTT() {
        while (true) {
            try {
                LOGGER.info("Attempting to connect to MQTT broker: " + BROKER_URL);
                client = new MqttClient(BROKER_URL, CLIENT_ID);

                MqttConnectOptions options = new MqttConnectOptions();
                options.setUserName(USERNAME);
                options.setPassword(PASSWORD.toCharArray());
                options.setSocketFactory(SSLSocketFactory.getDefault());
                options.setCleanSession(true);
                options.setAutomaticReconnect(true);

                client.connect(options);
                LOGGER.info("Connected to MQTT broker.");

                for (String topic : TOPICS) {
                    LOGGER.info("Subscribing to: " + topic);
                    client.subscribe(topic, this::handleMessage);
                }

                break; // Erfolgreich verbunden -> Exit-Schleife
            } catch (MqttException e) {
                LOGGER.warning("MQTT connection failed, retrying in 5 seconds: " + e.getMessage());
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException ignored) {
                }
            }
        }
    }

    private void handleMessage(String topic, MqttMessage message) {
        String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
        LOGGER.info("Received message - Topic: " + topic + ", Payload: " + payload);

        // Parsen des Topics, um Stockwerk und Sensor-Typ zu extrahieren
        String[] topicParts = topic.split("/");
        if (topicParts.length < 3) {
            LOGGER.warning("Invalid topic format, skipping: " + topic);
            return;
        }

        String floor = topicParts[1]; // Beispiel: "U08"
        String sensorType = topicParts[2]; // Beispiel: "CO2"

        try {
            double sensorValue = Double.parseDouble(payload.trim());
            influxDBService.writeSensorData(floor, sensorType, sensorValue);
        } catch (NumberFormatException e) {
            LOGGER.warning("Invalid sensor value, skipping: " + payload);
        }
    }

    @PreDestroy
    public void cleanup() {
        if (client != null && client.isConnected()) {
            try {
                client.disconnect();
                LOGGER.info("Disconnected from MQTT broker.");
            } catch (MqttException e) {
                LOGGER.warning("Error while disconnecting from MQTT: " + e.getMessage());
            }
        }
    }
}
