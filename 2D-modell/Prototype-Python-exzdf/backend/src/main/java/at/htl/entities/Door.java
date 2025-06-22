package at.htl.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.*;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.Polygon;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Door {

    @Id
    public int id;

    @ManyToOne
    @Cascade(CascadeType.ALL)
    public Floor floor;

    @Column(columnDefinition = "geometry(Polygon,0)")
    public Polygon geom;

    @Override
    public String toString() {
        return "Door{" +
                "id=" + id +
                ", floor=" + floor +
                ", geom=" + geom +
                '}';
    }
}
