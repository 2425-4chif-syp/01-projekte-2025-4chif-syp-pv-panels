package com.example.service;

import com.example.model.WeatherData;
import com.influxdb.client.WriteApi;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.InfluxDBClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.time.Instant;

@ApplicationScoped
public class WeatherService {

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
        // Fetch data from Open-Meteo API
        OpenMeteoClient.OpenMeteoResponse response = openMeteoClient.getHistoricalWeather(latitude, longitude, startDate, endDate, hourly);

        // Process each hourly temperature
        if (response != null && response.hourly != null && response.hourly.temperature_2m != null) {
            for (double temperature : response.hourly.temperature_2m) {
                WeatherData data = new WeatherData();
                data.setCity("Berlin"); // Static city name
                data.setTemp(temperature);
                data.setTime(Instant.now());

                // Write data to InfluxDB
                try (WriteApi writeApi = influxDBClient.getWriteApi()) {
                    writeApi.writeMeasurement(WritePrecision.NS, data);
                }
            }
        }
    }
}
