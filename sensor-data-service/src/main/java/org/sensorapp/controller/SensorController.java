package org.sensorapp.controller;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.sensorapp.infrastructure.influxdb.DTOs.SensorDataDTO;
import org.sensorapp.infrastructure.influxdb.DTOs.SensorValueDTO;
import org.sensorapp.infrastructure.influxdb.InfluxDBQueryService;

import java.util.List;
import java.util.Set;
import java.util.logging.Level;
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
     * @return Eine Liste von Stockwerksnamen oder eine Fehlerantwort bei Problemen.
     */
    @GET
    @Path("/floors")
    public Response getAllFloors(@QueryParam("timeRange") String timeRange) {
        try {
            List<String> floors = influxDBQueryService.getAllFloors(timeRange);
            if (floors.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND).entity("Keine Stockwerke gefunden.").build();
            }
            return Response.ok(floors).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Fehler beim Abrufen der Stockwerke", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Fehler beim Abrufen der Stockwerke.").build();
        }
    }

    /**
     * Gibt eine Liste aller Sensoren in einem bestimmten Stockwerk zurück.
     *
     * @param floor     Das Stockwerk, für das die Sensoren abgerufen werden sollen.
     * @param timeRange (optional) Der Zeitbereich für die Abfrage.
     * @return Eine Liste von Sensor-IDs oder eine Fehlerantwort.
     */
    @GET
    @Path("/{floor}")
    public Response getSensorsByFloor(@PathParam("floor") String floor, @QueryParam("timeRange") String timeRange) {
        try {
            List<String> sensors = influxDBQueryService.getSensorsByFloor(floor, timeRange);
            if (sensors.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND).entity("Keine Sensoren für Stockwerk '" + floor + "' gefunden.").build();
            }
            return Response.ok(sensors).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Fehler beim Abrufen der Sensoren für Stockwerk: " + floor, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Fehler beim Abrufen der Sensoren für Stockwerk '" + floor + "'.").build();
        }
    }

    /**
     * Gibt alle verfügbaren Messarten (Felder) eines Sensors zurück.
     *
     * @param floor     Das Stockwerk, in dem sich der Sensor befindet.
     * @param sensorId  Die ID des Sensors.
     * @param timeRange (optional) Der Zeitbereich für die Abfrage.
     * @return Eine Liste von Messarten oder eine Fehlerantwort.
     */
    @GET
    @Path("/{floor}/{sensorId}")
    public Response getSensorData(@PathParam("floor") String floor, @PathParam("sensorId") String sensorId, @QueryParam("timeRange") String timeRange) {
        try {
            Set<String> sensorData = influxDBQueryService.getSensorFields(floor, sensorId, timeRange);
            if (sensorData.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND).entity("Keine Messdaten für Sensor '" + sensorId + "' im Stockwerk '" + floor + "' gefunden.").build();
            }
            return Response.ok(sensorData).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Fehler beim Abrufen der Sensordaten für Sensor: " + sensorId + " im Stockwerk: " + floor, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Fehler beim Abrufen der Sensordaten für Sensor '" + sensorId + "'.").build();
        }
    }

    /**
     * Gibt die letzten gemessenen Werte eines bestimmten Sensors für einen bestimmten Sensortyp zurück.
     *
     * @param floor      Das Stockwerk, in dem sich der Sensor befindet.
     * @param sensorId   Die ID des Sensors.
     * @param sensorType Der gewünschte Sensortyp (z. B. "CO2", "Temperatur").
     * @param timeRange  (optional) Der Zeitbereich für die Abfrage.
     * @return Eine Liste der gemessenen Werte als DTO oder eine Fehlerantwort.
     */
    @GET
    @Path("/{floor}/{sensorId}/{sensorType}")
    public Response getSpecificSensorValues(
            @PathParam("floor") String floor,
            @PathParam("sensorId") String sensorId,
            @PathParam("sensorType") String sensorType,
            @QueryParam("timeRange") String timeRange) {
        try {
            List<SensorValueDTO> values = influxDBQueryService.getSpecificSensorValues(floor, sensorId, sensorType, timeRange);
            if (values.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Keine Messwerte für Sensor '" + sensorId + "' mit Typ '" + sensorType + "' gefunden.")
                        .build();
            }
            return Response.ok(values).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Fehler beim Abrufen der Messwerte für Sensor: " + sensorId + " mit Typ: " + sensorType, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Fehler beim Abrufen der Messwerte für Sensor '" + sensorId + "'.")
                    .build();
        }
    }

    /**
     * Gibt alle Werte eines Sensors mit Zeitstempel, Sensortyp und Wert zurück.
     *
     * @param floor     Das Stockwerk, in dem sich der Sensor befindet.
     * @param sensorId  Die ID des Sensors.
     * @param timeRange (optional) Der Zeitbereich für die Abfrage.
     * @return Eine Liste der formatierten Werte als DTO oder eine Fehlerantwort.
     */
    @GET
    @Path("/{floor}/{sensorId}/values")
    public Response getAllSensorValues(
            @PathParam("floor") String floor,
            @PathParam("sensorId") String sensorId,
            @QueryParam("timeRange") String timeRange) {
        try {
            List<SensorDataDTO> sensorData = influxDBQueryService.getAllSensorValues(floor, sensorId, timeRange);
            if (sensorData.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Keine formatierten Werte für Sensor '" + sensorId + "' gefunden.")
                        .build();
            }
            return Response.ok(sensorData).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Fehler beim Abrufen der formatierten Werte für Sensor: " + sensorId, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Fehler beim Abrufen der formatierten Werte für Sensor '" + sensorId + "'.")
                    .build();
        }
    }
}