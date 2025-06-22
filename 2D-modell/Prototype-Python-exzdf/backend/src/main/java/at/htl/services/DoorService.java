package at.htl.services;

import at.htl.repositories.DoorRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/door")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DoorService {

    @Inject
    DoorRepository doorRepository;

    @GET()
    @Path("/all")
    public String getDoors() {
        return doorRepository.listAll().toString();
    }
}
