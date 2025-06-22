package at.htl.services;

import at.htl.repositories.FloorRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("floor")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FloorService {

    @Inject
    FloorRepository floorRepository;

    @GET()
    @Path("/all")
    public String getFloors() {
        return floorRepository.listAll().toString();
    }
}
