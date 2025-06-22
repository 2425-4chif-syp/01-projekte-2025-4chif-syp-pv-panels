package at.htl.repositories;

import at.htl.entities.Wall;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.Access;

@ApplicationScoped
public class WallRepository implements PanacheRepository<Wall> {
}
