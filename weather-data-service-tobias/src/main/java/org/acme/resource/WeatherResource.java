package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.model.WeatherData;
import org.acme.service.WeatherDataService;
import io.quarkus.scheduler.Scheduled;

import java.time.Instant;
import java.util.List;

@Path("/api/weather")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WeatherResource {

    @Inject
    WeatherDataService weatherDataService;

    @POST
    @Path("/import")
    public Response importData() {
        try {
            weatherDataService.importData();
            return Response.ok().build();
        } catch (Exception e) {
            return Response.serverError().entity(e.getMessage()).build();
        }
    }

    @GET
    @Path("/{station}")
    public Response getWeatherData(
            @PathParam("station") String station,
            @QueryParam("from") String from,
            @QueryParam("to") String to) {
        try {
            Instant fromTime = from != null ? Instant.parse(from) : Instant.now().minusSeconds(86400); // Default to last 24 hours
            Instant toTime = to != null ? Instant.parse(to) : Instant.now();

            List<WeatherData> data = weatherDataService.queryData(station, fromTime, toTime);
            return Response.ok(data).build();
        } catch (Exception e) {
            return Response.serverError().entity(e.getMessage()).build();
        }
    }

    // Scheduled task to import data daily
    @Scheduled(cron = "0 0 0 * * ?") // Run at midnight every day
    void scheduledImport() {
        weatherDataService.importData();
    }
} 