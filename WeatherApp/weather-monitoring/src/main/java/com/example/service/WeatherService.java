package com.example.service;

import com.example.model.WeatherData;
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.WriteApi;
import com.influxdb.client.domain.WritePrecision;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.logging.Level;
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

    @PostConstruct
    void logConfiguration() {
        LOGGER.info("Configured Open-Meteo API Parameters:");
        LOGGER.info("Latitude: " + latitude + ", Longitude: " + longitude);
        LOGGER.info("Start Date: " + startDate + ", End Date: " + endDate);
        LOGGER.info("Hourly Metrics: " + hourly);
    }

    public void fetchAndStoreWeatherData() {
        LOGGER.info("Starting to fetch historical weather data...");

        try {
            // Fetch data from Open-Meteo API
            OpenMeteoClient.OpenMeteoResponse response = openMeteoClient.getHistoricalWeather(
                    latitude, longitude, startDate, endDate, hourly
            );

            if (response != null && response.hourly != null
                    && response.hourly.temperature_2m != null
                    && response.hourly.time != null) {

                int dataPoints = Math.min(response.hourly.temperature_2m.length, response.hourly.time.length);
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

                for (int i = 0; i < dataPoints; i++) {
                    WeatherData data = new WeatherData();
                    data.setCity("Berlin");
                    data.setTemp(response.hourly.temperature_2m[i]);

                    // Parse the time string as LocalDateTime and convert to Instant
                    String timeStr = response.hourly.time[i];
                    LocalDateTime localDateTime = LocalDateTime.parse(timeStr, formatter);
                    Instant instant = localDateTime.atZone(ZoneId.systemDefault()).toInstant();
                    data.setTime(instant);

                    try (WriteApi writeApi = influxDBClient.getWriteApi()) {
                        writeApi.writeMeasurement(WritePrecision.NS, data);
                    }
                }
                LOGGER.info("Successfully wrote weather data to InfluxDB.");
            } else {
                LOGGER.warning("No hourly weather data found in the response or invalid response structure.");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error while fetching or storing weather data: " + e.getMessage(), e);
        }
    }
}
