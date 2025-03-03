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
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "RoomId")
    int roomId;

    @Column(name = "RoomLabel")
    String roomLabel;

    @Column(name = "RoomName")
    String RoomName;

    @Column(name = "RoomType")
    String roomType;

    @OneToOne
    @JoinColumn(name = "Corridor", referencedColumnName = "RoomId", nullable = true)
    private Room corridor; // Der Korridor dieses Raums

    @OneToOne
    @JoinColumn(name = "NeighboursInside", referencedColumnName = "RoomId", nullable = true)
    private Room neighbourInside; // Raum, der sich auf der Innenseite befindet

    @OneToOne
    @JoinColumn(name = "NeighbourOutside", referencedColumnName = "RoomId", nullable = true)
    private Room neighbourOutside; // Raum, der sich auf der Außenseite befindet

    @Column(name = "Direction")
    String direction;
}
