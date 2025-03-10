package org.sensorapp.controller;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.sensorapp.entity.Room;
import org.sensorapp.infrastructure.postgres.RoomRepository;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
@Path("/room")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RoomController {

    @Inject
    RoomRepository roomRepository;

    private static final Logger LOGGER = Logger.getLogger(RoomController.class.getName());

    /**
     * Ruft alle gespeicherten Räume aus der Datenbank ab.
     *
     * @return Eine Liste aller Räume oder eine Fehlermeldung, falls keine Räume vorhanden sind.
     *
     * Response:
     * - 200 OK: Gibt die Liste der Räume zurück.
     * - 404 Not Found: Falls keine Räume gefunden wurden.
     * - 500 Internal Server Error: Falls ein Fehler beim Abrufen der Räume auftritt.
     */
    @GET
    @Path("/all")
    public Response getAllRooms() {
        try {
            List<Room> rooms = roomRepository.getRooms();
            if (rooms.isEmpty()) {
                return Response.status(Response.Status.NOT_FOUND).entity("Keine Räume gefunden.").build();
            }
            return Response.ok(rooms).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Fehler beim Abrufen der Räume", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Fehler beim Abrufen der Räume.").build();
        }
    }

    /**
     * Ruft einen bestimmten Raum anhand seiner ID ab.
     *
     * @param id Die eindeutige ID des Raums.
     * @return Der angeforderte Raum als JSON oder eine Fehlermeldung.
     *
     * Response:
     * - 200 OK: Gibt den gefundenen Raum zurück.
     * - 404 Not Found: Falls kein Raum mit der angegebenen ID existiert.
     * - 500 Internal Server Error: Falls ein Fehler beim Abrufen des Raums auftritt.
     */
    @GET
    @Path("/{id}")
    public Response getRoomById(@PathParam("id") int id) {
        try {
            Room room = roomRepository.getRoom(id);
            if (room == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("Kein Raum mit dieser ID gefunden.").build();
            }
            return Response.ok(room).build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Fehler beim Abrufen des Raumes nach ID", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Fehler beim Abrufen des Raumes nach ID").build();
        }
    }
}
