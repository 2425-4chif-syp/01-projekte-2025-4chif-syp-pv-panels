package org.weatherapp.infrastructure.influxdb;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import com.influxdb.client.WriteApi;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;

import java.time.Instant;

public class InfluxDBService {
    private static final String INFLUXDB_URL = "http://localhost:8086"; // Falls dein InfluxDB Container läuft
    private static final String INFLUXDB_TOKEN = "jhyEdrPTQWouaWfdhRF4qUvpzyaKQYy60FKg13XpN313DnbFXlT-J2RgmOrpOCJBdANiLDeDgZiZgjC3IMxehg=="; // Dein API-Token
    private static final String INFLUXDB_ORG = "weather_org"; // Dein InfluxDB-Org-Name
    private static final String INFLUXDB_BUCKET = "weather_bucket"; // Dein Bucket-Name

    private final InfluxDBClient influxDBClient;

    public InfluxDBService() {
        this.influxDBClient = InfluxDBClientFactory.create(INFLUXDB_URL, INFLUXDB_TOKEN.toCharArray(), INFLUXDB_ORG, INFLUXDB_BUCKET);
    }

    public void writeSensorData(String topic, String value) {
        try (WriteApi writeApi = influxDBClient.getWriteApi()) {
            Point point = Point.measurement("mqtt_data")
                    .addTag("sensor", topic) // Das genaue MQTT-Topic als Tag speichern
                    .addField("value", Double.parseDouble(value.trim())) // Falls der Wert eine Zahl ist
                    .time(Instant.now(), WritePrecision.NS);

            writeApi.writePoint(point);
            System.out.println("Data written to InfluxDB: " + topic + " -> " + value);
        } catch (Exception e) {
            System.err.println("Error writing to InfluxDB: " + e.getMessage());
        }
    }

    public void close() {
        influxDBClient.close();
    }
}