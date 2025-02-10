package org.sensorapp.infrastructure.influxdb;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.QueryApi;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.sensorapp.infrastructure.influxdb.DTOs.SensorDataDTO;

import java.util.*;
import java.util.logging.Logger;

@ApplicationScoped
public class InfluxDBQueryService {

    private static final Logger LOGGER = Logger.getLogger(InfluxDBQueryService.class.getName());

    @Inject
    private InfluxDBClient influxDBClient;

    /**
     * Gibt alle Stockwerke zurück
     */
    public List<String> getAllFloors(String timeRange) {
        if (timeRange == null || timeRange.isEmpty()) {
            timeRange = "-30d"; // Standardwert setzen
        }

        QueryApi queryApi = influxDBClient.getQueryApi();

        String query = String.format(
                "from(bucket: \"sensor_bucket\") " +
                        "|> range(start: %s) " +
                        "|> filter(fn: (r) => exists r.floor) " +
                        "|> keep(columns: [\"floor\"]) " +
                        "|> distinct(column: \"floor\")",
                timeRange
        );

        try {
            String rawResponse = queryApi.queryRaw(query);

            if (rawResponse.isEmpty()) {
                return Collections.emptyList();
            }

            return Arrays.stream(rawResponse.split("\n"))
                    .skip(1)
                    .map(line -> {
                        String[] columns = line.split(",");
                        return columns.length >= 4 ? columns[3].trim() : "";
                    })
                    .filter(floor -> !floor.isEmpty())
                    .toList();

        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * Gibt alle Sensoren eines Stockwerks zurück
     */
    public List<String> getSensorsByFloor(String floor, String timeRange) {
        timeRange = (timeRange == null || timeRange.isEmpty()) ? "-30d" : timeRange;

        QueryApi queryApi = influxDBClient.getQueryApi();
        String query = String.format(
                "from(bucket: \"sensor_bucket\") " +
                        "|> range(start: %s) " +
                        "|> filter(fn: (r) => r[\"floor\"] == \"%s\") " + // Filter für 'floor'
                        "|> keep(columns: [\"sensor\"]) " + // Nur die Spalte '_value' behalten
                        "|> distinct(column: \"sensor\")", // Eindeutige Werte der Spalte '_value'
                timeRange, floor
        );

        System.out.println("Executing Query: " + query);

        try {
            // Abrufen der Rohdaten
            String rawResponse = queryApi.queryRaw(query);
            // Überprüfen, ob die Antwort leere oder unerwartete Daten enthält
            if (rawResponse.isEmpty()) {
                return Collections.emptyList();
            }
            // Debug: Rohdaten zeilenweise ausgeben
            String[] lines = rawResponse.split("\n");
            // Verarbeitung der Rohdaten: Überspringe Header und extrahiere den _value-Wert (sensorwert)
            List<String> sensors = Arrays.stream(lines)
                    .skip(1) // Überspringe Header-Zeile
                    .map(line -> {
                        String[] columns = line.split(",");
                        if (columns.length > 3) { // Überprüfe, ob es genügend Spalten gibt
                            return columns[3].trim(); // Holen Sie sich den Wert aus der Spalte '_value'
                        }
                        return "";
                    })
                    .filter(sensor -> !sensor.isEmpty()) // Leere Werte entfernen
                    .toList();

            return sensors;

        } catch (Exception e) {
            System.err.println("Error while fetching sensors for floor: " + floor);
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * Gibt alle Daten eines Sensors zurück
     */
    public Set<String> getSensorFields(String floor, String sensorId, String timeRange) {
        // Setze das Standard-Zeitintervall auf die letzten 30 Tage, wenn kein Zeitbereich angegeben wird
        timeRange = (timeRange == null || timeRange.isEmpty()) ? "-30d" : timeRange;

        QueryApi queryApi = influxDBClient.getQueryApi();
        // Abfrage: Hole das neueste Feld
        String query = String.format(
                "from(bucket: \"sensor_bucket\") |> range(start: %s) |> filter(fn: (r) => r[\"_measurement\"] == \"sensor_data\") |> filter(fn: (r) => r[\"floor\"] == \"%s\") |> filter(fn: (r) => r[\"sensor\"] == \"%s\") |> last()",
                timeRange, floor, sensorId
        );

        System.out.println("Executing Query: " + query);

        try {
            // Abrufen der Rohdaten
            String rawResponse = queryApi.queryRaw(query);

            if (rawResponse == null || rawResponse.isEmpty()) {
                System.err.println("No data found for floor: " + floor + " and sensorId: " + sensorId);
                return Collections.emptySet();
            }

            System.out.println("Raw Response: " + rawResponse);

            // Set für die Felder
            Set<String> fields = new HashSet<>();

            // Verarbeite die Rückgabe
            String[] lines = rawResponse.split("\n");
            for (String line : lines) {
                // Trenne die Zeile in Spalten
                String[] columns = line.split(",");

                // Füge den Feldnamen hinzu (hier wird angenommen, dass der Feldname in der ersten Spalte steht)
                if (columns.length > 0) {
                    String fieldName = columns[0].trim();
                    if (!fieldName.isEmpty()) {
                        fields.add(fieldName);
                    }
                }
            }

            return fields;

        } catch (Exception e) {
            System.err.println("Error while fetching sensor data for floor: " + floor + " and sensorId: " + sensorId);
            e.printStackTrace();
            return Collections.emptySet();
        }
    }

    /**
     * Gibt einen spezifischen Wert eines Sensors zurück
     */
    public Double getSpecificSensorValue(String floor, String sensorId, String sensorType, String timeRange) {
        timeRange = (timeRange == null || timeRange.isEmpty()) ? "-30d" : timeRange;
        QueryApi queryApi = influxDBClient.getQueryApi();
        String query = String.format("from(bucket: \"sensor_bucket\") |> range(start: %s) |> filter(fn: (r) => r.floor == \"%s\" and r.sensorId == \"%s\" and r._field == \"%s\") |> last()", timeRange, floor, sensorId, sensorType);
        List<Double> results = queryApi.query(query, Double.class);
        return results.isEmpty() ? null : results.get(0);
    }
}