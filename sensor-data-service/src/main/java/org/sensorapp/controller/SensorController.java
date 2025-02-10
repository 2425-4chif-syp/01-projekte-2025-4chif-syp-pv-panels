package org.sensorapp.service;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.sensorapp.infrastructure.influxdb.InfluxDBQueryService;

import java.util.List;
import java.util.Map;

@Path("/sensors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SensorController {

    @Inject
    InfluxDBQueryService influxDBQueryService;

    @GET
    @Path("/floors")
    public Response getAllFloors(@QueryParam("timeRange") String timeRange) {
        List<String> floors = influxDBQueryService.getAllFloors(timeRange);
        return Response.ok(floors).build();
    }

    @GET
    @Path("/floors/{floor}")
    public Response getSensorsByFloor(@PathParam("floor") String floor, @QueryParam("timeRange") String timeRange) {
        List<String> sensors = influxDBQueryService.getSensorsByFloor(floor, timeRange);
        return Response.ok(sensors).build();
    }

    @GET
    @Path("/floors/{floor}/sensors/{sensorId}")
    public Response getSensorData(@PathParam("floor") String floor, @PathParam("sensorId") String sensorId, @QueryParam("timeRange") String timeRange) {
        Map<String, Double> sensorData = influxDBQueryService.getSensorData(floor, sensorId, timeRange);
        return Response.ok(sensorData).build();
    }

    @GET
    @Path("/floors/{floor}/sensors/{sensorId}/value/{sensorType}")
    public Response getSpecificSensorValue(@PathParam("floor") String floor, @PathParam("sensorId") String sensorId, @PathParam("sensorType") String sensorType, @QueryParam("timeRange") String timeRange) {
        Double value = influxDBQueryService.getSpecificSensorValue(floor, sensorId, sensorType, timeRange);
        if (value == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Sensorwert nicht gefunden").build();
        }
        return Response.ok(value).build();
    }
}
