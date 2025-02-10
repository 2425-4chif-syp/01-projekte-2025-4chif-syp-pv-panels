package org.sensorapp.controller;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.sensorapp.infrastructure.influxdb.InfluxDBQueryService;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

/**
 * REST API Controller zur Verwaltung von Sensordaten.
 * Stellt Endpunkte zur Verfügung, um Informationen über Stockwerke, Sensoren und deren Messwerte abzurufen.
 */
@Path("/sensors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class SensorController {

    @Inject
    InfluxDBQueryService influxDBQueryService;

    private static final Logger LOGGER = Logger.getLogger(SensorController.class.getName());

    /**
     * Gibt eine Liste aller vorhandenen Stockwerke zurück.
     *
     * @param timeRange (optional) Der Zeitbereich für die Abfrage, z. B. "-30d" für die letzten 30 Tage.
     * @return Eine Liste von Stockwerksnamen.
     */
    @GET
    @Path("/floors")
    public Response getAllFloors(@QueryParam("timeRange") String timeRange) {
        List<String> floors = influxDBQueryService.getAllFloors(timeRange);
        return Response.ok(floors).build();
    }

    /**
     * Gibt eine Liste aller Sensoren in einem bestimmten Stockwerk zurück.
     *
     * @param floor Das Stockwerk, für das die Sensoren abgerufen werden sollen.
     * @param timeRange (optional) Der Zeitbereich für die Abfrage.
     * @return Eine Liste von Sensor-IDs.
     */
    @GET
    @Path("/{floor}")
    public Response getSensorsByFloor(@PathParam("floor") String floor, @QueryParam("timeRange") String timeRange) {
        List<String> sensors = influxDBQueryService.getSensorsByFloor(floor, timeRange);
        return Response.ok(sensors).build();
    }

    /**
     * Gibt die Messwerte eines bestimmten Sensors zurück.
     *
     * @param floor Das Stockwerk, in dem sich der Sensor befindet.
     * @param sensorId Die ID des Sensors.
     * @param timeRange (optional) Der Zeitbereich für die Abfrage.
     * @return Eine Map mit den Sensormesswerten, bei der der Schlüssel der Sensortyp ist und der Wert der gemessene Wert.
     */
    @GET
    @Path("/{floor}/{sensorId}")
    public Response getSensorData(@PathParam("floor") String floor, @PathParam("sensorId") String sensorId, @QueryParam("timeRange") String timeRange) {
        Set<String> sensorData = influxDBQueryService.getSensorFields(floor, sensorId, timeRange);
        return Response.ok(sensorData).build();
    }

    /**
     * Gibt einen spezifischen Sensormesswert zurück.
     *
     * @param floor Das Stockwerk, in dem sich der Sensor befindet.
     * @param sensorId Die ID des Sensors.
     * @param sensorType Der gewünschte Sensortyp (z. B. "CO2", "Temperatur").
     * @param timeRange (optional) Der Zeitbereich für die Abfrage.
     * @return Der letzte gemessene Wert des Sensors für den angegebenen Sensortyp.
     */
    @GET
    @Path("/{floor}/{sensorId}/{sensorType}")
    public Response getSpecificSensorValue(@PathParam("floor") String floor, @PathParam("sensorId") String sensorId, @PathParam("sensorType") String sensorType, @QueryParam("timeRange") String timeRange) {
        Double value = influxDBQueryService.getSpecificSensorValue(floor, sensorId, sensorType, timeRange);
        if (value == null) {
            return Response.status(Response.Status.NOT_FOUND).entity("Sensorwert nicht gefunden").build();
        }
        return Response.ok(value).build();
    }
}
