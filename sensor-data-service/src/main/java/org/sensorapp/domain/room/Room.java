package org.sensorapp.domain.room;

import jakarta.persistence.*;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Room {
    @Id
    private int roomId; // Formatierte Room-ID mit führenden Nullen

    private String roomLabel; // Label des Raums
    private String roomName; // Name des Raums
    private String roomType; // Typ des Raums (z. B. Office, Corridor)

    @ManyToOne // Beziehung zu einem "Korridor"-Raum
    @JoinColumn(name = "corridor")
    private Room corridor; // Verweis auf einen anderen Raum als Korridor

    @ManyToOne // Beziehung zu einem Nachbarn innerhalb des Gebäudes
    @JoinColumn(name = "neighbourInside")
    private Room neighbourInside; // Nachbar innerhalb des Gebäudes

    @ManyToOne // Beziehung zu einem Nachbarn außerhalb des Gebäudes
    @JoinColumn(name = "neighbourOutside")
    private Room neighbourOutside; // Nachbar außerhalb des Gebäudes
}
