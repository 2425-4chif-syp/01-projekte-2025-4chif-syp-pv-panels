package com.example.service;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.QueryParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "openmeteo.api") // Use configKey for dynamic configuration
public interface OpenMeteoClient {

    @GET
    OpenMeteoResponse getHistoricalWeather(
            @QueryParam("latitude") double latitude,
            @QueryParam("longitude") double longitude,
            @QueryParam("start_date") String startDate,
            @QueryParam("end_date") String endDate,
            @QueryParam("hourly") String hourly
    );

    class OpenMeteoResponse {
        public Hourly hourly;

        public static class Hourly {
            public String[] time; // Array of timestamps
            public double[] temperature_2m; // Array of temperatures
        }
    }
}
