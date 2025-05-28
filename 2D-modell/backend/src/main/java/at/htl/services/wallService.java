package at.htl.services;

import at.htl.entities.Floor;
import at.htl.entities.Wall;
import at.htl.repositories.WallRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("wall")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WallService {

    @Inject
    WallRepository wallRepository;

    @GET
    @Path("/all")
    public String getWalls() {
        List<Wall> floorList = wallRepository.listAll();
        System.out.println(floorList.get(1));
        System.out.println(floorList.get(1).toString());
        return floorList.toString();

    }
}
