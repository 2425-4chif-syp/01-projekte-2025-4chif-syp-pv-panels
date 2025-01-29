package org.weatherapp.application;

import org.eclipse.paho.client.mqttv3.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.annotation.PostConstruct;
import org.weatherapp.infrastructure.influxdb.InfluxDBService;

import javax.net.ssl.SSLSocketFactory;

@ApplicationScoped
public class MQTTListener {

    private static final String BROKER_URL = "ssl://mqtt.htl-leonding.ac.at:8883";
    private static final String CLIENT_ID = "quarkus-weather-client";
    private static final String USERNAME = "leo-student";
    private static final String PASSWORD = "sTuD@w0rck";
    private static final String[] TOPICS = {"ug/U90/#", "ug/U08/#"}; // Abonniere alle Unter-Topics

    private MqttClient client;
    private static final InfluxDBService influxDBService = new InfluxDBService();


    @PostConstruct
    public void init() {
        System.out.println("MQTT listener started");

        try {
            MqttClient client = new MqttClient(BROKER_URL, CLIENT_ID);

            MqttConnectOptions options = new MqttConnectOptions();
            options.setUserName(USERNAME);
            options.setPassword(PASSWORD.toCharArray());
            options.setSocketFactory(SSLSocketFactory.getDefault());
            options.setCleanSession(true);

            client.connect(options);
            System.out.println("Connected to MQTT broker.");

            // Abonniere die relevanten Topics
            for (String topic : TOPICS) {
                System.out.println("Subscribing to: " + topic);
                client.subscribe(topic, (receivedTopic, message) -> {
                    String payload = new String(message.getPayload());
                    System.out.println("Received message:");
                    System.out.println("  Topic: " + receivedTopic);
                    System.out.println("  Payload: " + payload);

                    // Speichere die Daten in InfluxDB
                    influxDBService.writeSensorData(receivedTopic, payload);
                });
            }
        } catch (MqttException e) {
            System.err.println("MQTT Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
