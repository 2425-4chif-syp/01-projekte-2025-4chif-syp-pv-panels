package at.htl.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Floor {

    @Id
    public int id;

    public String name;
}
