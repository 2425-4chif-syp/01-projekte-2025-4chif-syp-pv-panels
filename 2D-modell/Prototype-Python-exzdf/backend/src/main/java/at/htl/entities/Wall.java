package at.htl.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.locationtech.jts.geom.LineString;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Wall {

    @Id
    public int id;

    @ManyToOne
    @Cascade(CascadeType.ALL)
    public Floor floor;

    @Column(columnDefinition = "geometry(LineString,0)")
    public LineString geom;

    @Override
    public String toString() {
        return "Wall{" +
                "id=" + id +
                ", floor=" + floor +
                ", geom=" + geom +
                '}';
    }
}
