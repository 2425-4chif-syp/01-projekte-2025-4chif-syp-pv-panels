package org.acme.service;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.WriteApi;
import com.influxdb.client.domain.WritePrecision;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.acme.model.WeatherData;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class WeatherDataService {

    @ConfigProperty(name = "zamg.data.url")
    String zamgDataUrl;

    @Inject
    InfluxDBClient influxDBClient;

    @ConfigProperty(name = "influxdb.bucket")
    String bucket;

    public void importData() {
        try {
            URL url = new URL(zamgDataUrl);
            try (InputStreamReader reader = new InputStreamReader(url.openStream());
                 CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

                List<WeatherData> weatherDataList = new ArrayList<>();
                for (CSVRecord record : csvParser) {
                    WeatherData data = parseRecord(record);
                    if (data != null) {
                        weatherDataList.add(data);
                    }
                }

                saveToInfluxDB(weatherDataList);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private WeatherData parseRecord(CSVRecord record) {
        try {
            WeatherData data = new WeatherData();
            data.setStation(record.get("STATION"));
            
            // Parse date (assuming format YYYY-MM-DD)
            LocalDate date = LocalDate.parse(record.get("DATE"), DateTimeFormatter.ISO_DATE);
            data.setTime(date.atStartOfDay().toInstant(ZoneOffset.UTC));
            
            // Parse numeric values, handling potential missing or invalid data
            try {
                data.setTemperature(Double.parseDouble(record.get("TEMP")));
            } catch (NumberFormatException e) {
                data.setTemperature(null);
            }
            
            try {
                data.setPrecipitation(Double.parseDouble(record.get("PREC")));
            } catch (NumberFormatException e) {
                data.setPrecipitation(null);
            }
            
            try {
                data.setPressure(Double.parseDouble(record.get("PRES")));
            } catch (NumberFormatException e) {
                data.setPressure(null);
            }

            return data;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private void saveToInfluxDB(List<WeatherData> weatherDataList) {
        try (WriteApi writeApi = influxDBClient.getWriteApi()) {
            writeApi.writeMeasurements(WritePrecision.NS, weatherDataList);
        }
    }

    public List<WeatherData> queryData(String station, Instant startTime, Instant endTime) {
        String query = String.format("""
            from(bucket: "%s")
              |> range(start: %s, stop: %s)
              |> filter(fn: (r) => r["station"] == "%s")
              |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            """, 
            bucket,
            startTime.toString(),
            endTime.toString(),
            station
        );

        return influxDBClient.getQueryApi()
            .query(query, WeatherData.class);
    }
} 