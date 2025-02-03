package org.sensorapp.infrastructure.influxdb;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import com.influxdb.client.WriteApi;
import com.influxdb.client.domain.Bucket;
import com.influxdb.client.domain.Organization;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.Instant;
import java.util.Map;
import java.util.logging.Logger;

@ApplicationScoped
public class InfluxDBService {

    private static final Logger LOGGER = Logger.getLogger(InfluxDBService.class.getName());

    // Statische Werte für InfluxDB-Konfiguration
    private static final String INFLUXDB_URL = "http://127.0.0.1:8086";  // Statische URL
    private static final String INFLUXDB_TOKEN = "Nr6fRfvDbW6sBMfL5R3Uuqpc1ckqkLNezsFF1QMpquWXf4r2Uf1iJRp3C-PlthVWRMWF0NHdaiIdKxx30240nA==";  // Statischer Token
    private static final String INFLUXDB_ORG = "sensor_org";  // Statisches Organisatons-Name
    private static final String INFLUXDB_BUCKET = "sensor_bucket";  // Statisches Bucket-Name

    private final InfluxDBClient influxDBClient;

    // Konstruktor
    public InfluxDBService() {
        System.out.println("🔍 InfluxDBService Konstruktor wurde aufgerufen!");

        // Erstelle den InfluxDBClient
        this.influxDBClient = InfluxDBClientFactory.create(INFLUXDB_URL, INFLUXDB_TOKEN.toCharArray(), INFLUXDB_ORG, INFLUXDB_BUCKET);

        // Stelle sicher, dass der Bucket existiert, falls nicht, erstelle ihn
        ensureBucketExists();
    }

    /**
     * Sicherstellen, dass der Bucket existiert, falls nicht, erstelle ihn
     */
    private void ensureBucketExists() {
        try {
            // Hole das Org-Objekt, indem du alle Organisationen abfragst
            Organization org = influxDBClient.getOrganizationsApi().findOrganizations().stream()
                    .filter(o -> INFLUXDB_ORG.equals(o.getName()))
                    .findFirst()
                    .orElse(null);

            if (org == null) {
                throw new RuntimeException("❌ Organisation " + INFLUXDB_ORG + " wurde nicht gefunden!");
            }

            // Verwende das vollständige Organisation-Objekt, nicht nur die ID
            // Überprüfe, ob der Bucket existiert
            Bucket bucket = influxDBClient.getBucketsApi().findBucketsByOrg(org).stream()
                    .filter(b -> b.getName().equals(INFLUXDB_BUCKET))
                    .findFirst()
                    .orElse(null);

            // Falls der Bucket nicht existiert, erstelle ihn
            if (bucket == null) {
                LOGGER.info("Bucket " + INFLUXDB_BUCKET + " existiert nicht, erstelle neuen Bucket...");
                influxDBClient.getBucketsApi().createBucket(INFLUXDB_BUCKET, org.getId());
                LOGGER.info("Bucket " + INFLUXDB_BUCKET + " wurde erstellt!");
            } else {
                LOGGER.info("Bucket " + INFLUXDB_BUCKET + " existiert bereits.");
            }
        } catch (Exception e) {
            LOGGER.severe("Fehler beim Überprüfen oder Erstellen des Buckets: " + e.getMessage());
        }
    }

    /**
     * Dynamische Methode zum Schreiben von Sensordaten
     * @param floor - Stockwerk (z.B. "eg", "ug", "og")
     * @param sensorId - Sensor ID (z.B. "U08", "U90", "e72")
     * @param sensorData - Map mit Sensor-Typen (z.B. CO2, TEMP, HUM) und deren Werten
     */
    public void writeSensorData(String floor, String sensorId, Map<String, Double> sensorData) {
        try (WriteApi writeApi = influxDBClient.getWriteApi()) {

            for (Map.Entry<String, Double> entry : sensorData.entrySet()) {
                String sensorType = entry.getKey();
                double value = entry.getValue();

                // Dynamische Erstellung des "sensor_data" Points
                Point point = Point.measurement("sensor_data")
                        .addTag("floor", floor)  // Stockwerk als Tag speichern
                        .addTag("sensor", sensorId)  // Sensor ID als Tag speichern
                        .addField(sensorType, value)  // Sensorwert (z.B. CO2, TEMP, HUM) als Feld speichern
                        .time(Instant.now(), WritePrecision.NS); // Zeitstempel in Nanosekunden

                // Schreibe die Sensordaten in die InfluxDB
                writeApi.writePoint(point);
            }
            LOGGER.info("Multiple sensor data written to InfluxDB for Floor: " + floor + ", Sensor: " + sensorId);
        } catch (Exception e) {
            LOGGER.warning("Error writing sensor data to InfluxDB: " + e.getMessage());
        }
    }

    /**
     * Methode zum Schließen des Clients
     */
    public void close() {
        influxDBClient.close();
    }
}
