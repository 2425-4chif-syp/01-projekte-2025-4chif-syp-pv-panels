package at.htl.services;

import at.htl.repositories.RoomRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/room")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RoomService {

    @Inject
    RoomRepository roomRepository;

    @GET
    @Path("/all")
    public String getRooms() {
        return roomRepository.listAll().toString();
    }
}
