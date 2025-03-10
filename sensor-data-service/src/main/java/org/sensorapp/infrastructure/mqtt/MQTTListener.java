package org.sensorapp.infrastructure.mqtt;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.quarkus.arc.Unremovable;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.paho.client.mqttv3.*;
import org.sensorapp.infrastructure.influxdb.InfluxDBWriteService;

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

    private static final String[] TOPICS = {"+/+/+/+", "+/+/+"}; // Alle Stockwerke und Sensoren abonnieren

    private MqttClient client;

    @Inject
    InfluxDBWriteService influxDBWriteService;

    public void start() {
        LOGGER.info("🚀 MQTTListener wird gestartet...");
        new Thread(this::connectMQTT).start();
    }

    private void connectMQTT() {
        while (true) {
            try {
                if (client == null || !client.isConnected()) {
                    LOGGER.info("🔌 Versuche Verbindung zum MQTT-Broker: " + BROKER_URL);
                    client = new MqttClient(BROKER_URL, CLIENT_ID, null);

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

        Map<String, Double> sensorData = new HashMap<>();

        // JSON-Parsing oder einfacher Wert
        try {
            if (payload.startsWith("{") && payload.endsWith("}")) {
                // JSON-Payload parsen
                JsonObject jsonObject = JsonParser.parseString(payload).getAsJsonObject();
                if (jsonObject.has("value")) {
                    double sensorValue = jsonObject.get("value").getAsDouble();
                    sensorData.put(sensorType, sensorValue);
                    LOGGER.info("✅ JSON-Wert für " + sensorType + " gespeichert: " + sensorValue);
                } else {
                    LOGGER.warning("⚠️ Kein 'value'-Feld im JSON-Payload gefunden: " + payload);
                }
            } else {
                // Einfache Zahl
                double sensorValue = Double.parseDouble(payload.trim());
                sensorData.put(sensorType, sensorValue);
                LOGGER.info("✅ Einfacher Wert für " + sensorType + " gespeichert: " + sensorValue);
            }

            // Daten in InfluxDB speichern
            if (!sensorData.isEmpty()) {
                influxDBWriteService.writeSensorData(floor, sensorId, sensorData);
                LOGGER.info("✅ Daten gespeichert für Floor: " + floor + ", Sensor: " + sensorId + ", Type: " + sensorType);
            } else {
                LOGGER.warning("⚠️ Keine Daten zum Speichern gefunden: " + payload);
            }
        } catch (Exception e) {
            LOGGER.warning("❌ Fehler beim Verarbeiten des Payloads: " + e.getMessage());
        }
    }
}