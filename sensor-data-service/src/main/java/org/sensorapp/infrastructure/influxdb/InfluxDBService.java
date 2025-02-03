package org.sensorapp.infrastructure.influxdb;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import com.influxdb.client.WriteApi;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.util.logging.Logger;

@ApplicationScoped
public class InfluxDBService {

    private static final Logger LOGGER = Logger.getLogger(InfluxDBService.class.getName());

    private static final String INFLUXDB_URL = System.getenv("INFLUXDB_HOST");
    private static final String INFLUXDB_TOKEN = System.getenv("INFLUXDB_TOKEN");
    private static final String INFLUXDB_ORG = System.getenv("INFLUXDB_ORG");
    private static final String INFLUXDB_BUCKET = System.getenv("INFLUXDB_BUCKET");

    private final InfluxDBClient influxDBClient;

    public InfluxDBService() {
        this.influxDBClient = InfluxDBClientFactory.create(INFLUXDB_URL, INFLUXDB_TOKEN.toCharArray(), INFLUXDB_ORG, INFLUXDB_BUCKET);
    }

    public void writeSensorData(String floor, String sensorType, double value) {
        try (WriteApi writeApi = influxDBClient.getWriteApi()) {
            Point point = Point.measurement("sensor_data")
                    .addTag("floor", floor) // Stockwerk als Tag speichern
                    .addTag("sensor", sensorType) // Sensor-Typ als Tag speichern
                    .addField("value", value) // Sensorwert als Feld speichern
                    .time(Instant.now(), WritePrecision.NS);

            writeApi.writePoint(point);
            LOGGER.info("Data written to InfluxDB: Floor=" + floor + ", Sensor=" + sensorType + ", Value=" + value);
        } catch (Exception e) {
            LOGGER.warning("Error writing to InfluxDB: " + e.getMessage());
        }
    }

    public void close() {
        influxDBClient.close();
    }
}