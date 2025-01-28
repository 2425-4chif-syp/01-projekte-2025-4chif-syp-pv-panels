package com.example.service;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(baseUri = "${openmeteo.api.url}")
public interface OpenMeteoClient {

    @GET
    @Path("/v1/archive")
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
            public String[] time; // Timestamps
            public double[] temperature_2m; // Hourly temperatures
        }
    }
}
