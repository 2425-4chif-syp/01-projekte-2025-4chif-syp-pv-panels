package at.htl.repositories;

import at.htl.entities.Floor;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class FloorRepository implements PanacheRepository<Floor> {
}
