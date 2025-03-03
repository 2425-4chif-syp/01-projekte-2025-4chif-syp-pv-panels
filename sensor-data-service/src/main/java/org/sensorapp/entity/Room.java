package org.sensorapp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name = "room")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "RoomId")
    int roomId;

    @Column(name = "RoomLabel", nullable = true)
    String roomLabel;

    @Column(name = "RoomName")
    String RoomName;

    @Column(name = "RoomType")
    String roomType;

    @ManyToOne
    @JoinColumn(name = "Corridor", referencedColumnName = "RoomId", nullable = true)
    private Room corridor; // Der Korridor dieses Raums

    @ManyToOne
    @JoinColumn(name = "NeighbourInside", referencedColumnName = "RoomId", nullable = true)
    private Room neighbourInside; // Raum, der sich auf der Innenseite befindet

    @ManyToOne
    @JoinColumn(name = "NeighbourOutside", referencedColumnName = "RoomId", nullable = true)
    private Room neighbourOutside; // Raum, der sich auf der Außenseite befindet

    @Column(name = "Direction", nullable = true)
    String direction;
}
