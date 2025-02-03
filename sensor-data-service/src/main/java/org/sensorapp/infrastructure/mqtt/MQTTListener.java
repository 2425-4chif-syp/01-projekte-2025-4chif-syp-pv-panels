package org.sensorapp.infrastructure.mqtt;

import io.quarkus.arc.Unremovable;
import jakarta.inject.Inject;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.paho.client.mqttv3.*;
import org.sensorapp.infrastructure.influxdb.InfluxDBService;

import javax.net.ssl.SSLSocketFactory;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;
import java.util.HashMap;
import java.util.Map;

@Unremovable
@ApplicationScoped
public class MQTTListener {

    private static final Logger LOGGER = Logger.getLogger(MQTTListener.class.getName());

    private static final String BROKER_URL = "ssl://mqtt.htl-leonding.ac.at:8883";
    private static final String CLIENT_ID = "quarkus-sensor-client1";
    private static final String USERNAME = "leo-student";
    private static final String PASSWORD = "sTuD@w0rck";

    // Abonniert alle Themen im Format 'floor/sensor/type' (Dynamisch für Stockwerke, Sensoren und Typen)
    private static final String[] TOPICS = {"+/+/+"}; // Alle Stockwerke und Sensoren abonnieren

    private MqttClient client;

    @Inject
    InfluxDBService influxDBService;

    public MQTTListener() {
        System.out.println("🔍 MQTTListener Konstruktor wurde aufgerufen!");
    }

    public void start() {
        LOGGER.info("🚀 MQTTListener wird gestartet...");
        new Thread(this::connectMQTT).start();
    }

    private void connectMQTT() {
        while (true) {
            try {
                LOGGER.info("🔌 Versuche Verbindung zum MQTT-Broker: " + BROKER_URL);
                client = new MqttClient(BROKER_URL, CLIENT_ID);

                MqttConnectOptions options = new MqttConnectOptions();
                options.setUserName(USERNAME);
                options.setPassword(PASSWORD.toCharArray());
                options.setSocketFactory(SSLSocketFactory.getDefault());
                options.setCleanSession(true);
                options.setAutomaticReconnect(true);

                client.connect(options);
                LOGGER.info("✅ Erfolgreich mit MQTT verbunden.");

                // Themen abonnieren
                for (String topic : TOPICS) {
                    LOGGER.info("📡 Abonniere Topic: " + topic);
                    client.subscribe(topic, this::handleMessage);
                }

                break;
            } catch (MqttException e) {
                LOGGER.warning("❌ MQTT-Verbindung fehlgeschlagen, erneuter Versuch in 5 Sekunden: " + e.getMessage());
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException ignored) {}
            }
        }
    }

    private void handleMessage(String topic, MqttMessage message) {
        String payload = new String(message.getPayload(), StandardCharsets.UTF_8);
        LOGGER.info("📩 MQTT Nachricht empfangen - Topic: " + topic + ", Payload: " + payload);

        // Das Topic in Teile zerlegen (Stockwerk, Sensor ID und Sensortyp)
        String[] topicParts = topic.split("/");
        if (topicParts.length < 3) {
            LOGGER.warning("⚠️ Ungültiges Topic-Format: " + topic);
            return;
        }

        String floor = topicParts[0];  // Stockwerk (z.B. eg, ug)
        String sensorId = topicParts[1]; // Sensor ID (z.B. U08, U90)
        String sensorType = topicParts[2]; // Sensor-Typ (z.B. CO2, HUM, TEMP)

        // Prüfen, ob für das Stockwerk Daten vorhanden sind
        LOGGER.info("📡 Stockwerk: " + floor + ", Sensor: " + sensorId + ", Typ: " + sensorType);

        // Erstelle eine Map für die Sensordaten
        Map<String, Double> sensorData = new HashMap<>();

        // Versuche den Wert als Double zu parsen und in die Map hinzuzufügen
        try {
            double sensorValue = Double.parseDouble(payload.trim());
            sensorData.put(sensorType, sensorValue);  // Wert für den Sensor-Typ speichern

            // Logge, was gespeichert wurde
            LOGGER.info("✅ Sensorwert gespeichert: " + sensorValue + " für " + sensorType);

            // Schreibe die Sensordaten in die InfluxDB (dynamisch)
            influxDBService.writeSensorData(floor, sensorId, sensorData);

        } catch (NumberFormatException e) {
            LOGGER.warning("❌ Ungültiger Sensorwert: " + payload);
        }
    }
}
