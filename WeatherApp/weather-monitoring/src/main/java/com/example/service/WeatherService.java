package com.example.service;

import com.example.model.WeatherData;
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.WriteApi;
import com.influxdb.client.domain.WritePrecision;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.logging.Logger;

@ApplicationScoped
public class WeatherService {

    private static final Logger LOGGER = Logger.getLogger(WeatherService.class.getName());

    @Inject
    InfluxDBClient influxDBClient;

    @Inject
    @RestClient
    OpenMeteoClient openMeteoClient;

    @ConfigProperty(name = "openmeteo.api.latitude")
    double latitude;

    @ConfigProperty(name = "openmeteo.api.longitude")
    double longitude;

    @ConfigProperty(name = "openmeteo.api.start_date")
    String startDate;

    @ConfigProperty(name = "openmeteo.api.end_date")
    String endDate;

    @ConfigProperty(name = "openmeteo.api.hourly")
    String hourly;

    public void fetchAndStoreWeatherData() {
        try {
            // Fetch data from Open-Meteo API
            OpenMeteoClient.OpenMeteoResponse response = openMeteoClient.getHistoricalWeather(
                    latitude, longitude, startDate, endDate, hourly);

            if (response != null && response.hourly != null) {
                String[] times = response.hourly.time;
                double[] temperatures = response.hourly.temperature_2m;

                // Write data to InfluxDB
                if (times != null && temperatures != null && times.length == temperatures.length) {
                    try (WriteApi writeApi = influxDBClient.getWriteApi()) {
                        for (int i = 0; i < times.length; i++) {
                            WeatherData data = new WeatherData();
                            data.setCity("Berlin");
                            data.setTemp(temperatures[i]);
                            data.setTime(Instant.parse(times[i])); // Parse ISO 8601 time

                            writeApi.writeMeasurement(WritePrecision.NS, data);
                        }
                    }
                }
            }
        } catch (Exception e) {
            LOGGER.severe("Error while fetching and storing weather data: " + e.getMessage());
        }
    }
}
