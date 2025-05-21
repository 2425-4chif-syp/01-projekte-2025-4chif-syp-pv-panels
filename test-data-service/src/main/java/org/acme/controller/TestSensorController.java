package org.acme.controller;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.service.TestSensorDataService;

import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
@Path("/sensors")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TestSensorController {
    
    private static final Logger LOGGER = Logger.getLogger(TestSensorController.class.getName());
    
    @Inject
    TestSensorDataService sensorDataService;
    
    @GET
    @Path("/floors")
    public Response getAllFloors() {
        try {
            var floors = sensorDataService.getAllFloors();
            if (floors.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND).entity("No floors found").build();
            }
            return Response.ok(floors).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting floors", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error retrieving floors").build();
        }
    }
    
    @GET
    @Path("/{floor}")
    public Response getSensorsByFloor(@PathParam("floor") String floor) {
        try {
            var sensors = sensorDataService.getSensorsByFloor(floor);
            if (sensors.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND).entity("No sensors found for floor: " + floor).build();
            }
            return Response.ok(sensors).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting sensors for floor: " + floor, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error retrieving sensors").build();
        }
    }
    
    @GET
    @Path("/{floor}/{sensorId}")
    public Response getSensorFields(
            @PathParam("floor") String floor,
            @PathParam("sensorId") String sensorId) {
        try {
            var fields = sensorDataService.getSensorFields(floor, sensorId);
            if (fields.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("No data found for sensor: " + sensorId + " on floor: " + floor)
                        .build();
            }
            return Response.ok(fields).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting sensor fields for sensorId: " + sensorId + " on floor: " + floor, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error retrieving sensor fields").build();
        }
    }
    
    @GET
    @Path("/{floor}/{sensorId}/{sensorType}")
    public Response getSpecificSensorValues(
            @PathParam("floor") String floor,
            @PathParam("sensorId") String sensorId,
            @PathParam("sensorType") String sensorType) {
        try {
            var values = sensorDataService.getSpecificSensorValues(floor, sensorId, sensorType);
            if (values.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("No data found for sensor: " + sensorId + ", type: " + sensorType + " on floor: " + floor)
                        .build();
            }
            return Response.ok(values).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting values for sensor: " + sensorId + ", type: " + sensorType, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error retrieving sensor values").build();
        }
    }
    
    @GET
    @Path("/{floor}/{sensorId}/values")
    public Response getAllSensorValues(
            @PathParam("floor") String floor,
            @PathParam("sensorId") String sensorId) {
        try {
            var values = sensorDataService.getAllSensorValues(floor, sensorId);
            if (values.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("No values found for sensor: " + sensorId + " on floor: " + floor)
                        .build();
            }
            return Response.ok(values).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting all values for sensor: " + sensorId, e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity("Error retrieving sensor values").build();
        }
    }
}