package at.htl.repositories;

import at.htl.entities.Door;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DoorRepository implements PanacheRepository<Door> {
}
