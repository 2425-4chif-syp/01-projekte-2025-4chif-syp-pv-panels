package at.htl.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.locationtech.jts.geom.LineString;

@Entity
public class Wall {

    @Id
    public int id;

    @ManyToOne
    @Cascade(CascadeType.ALL)
    public Floor floor;

    @Column(columnDefinition = "geometry(LineString,0)")
    public LineString geom;

}
