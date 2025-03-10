package org.sensorapp.infrastructure.postgres.DTOs;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class RoomDTO {
    private int roomId;
    private String roomLabel;
    private String roomName;
    private String roomType;
    private Integer corridorId;
    private Integer neighbourInsideId;
    private Integer neighbourOutsideId;
    private String direction;

    // **Füge diesen Konstruktor hinzu**
    public RoomDTO(int roomId, String roomLabel, String roomName, String roomType,
                   Integer corridorId, Integer neighbourInsideId, Integer neighbourOutsideId, String direction) {
        this.roomId = roomId;
        this.roomLabel = roomLabel;
        this.roomName = roomName;
        this.roomType = roomType;
        this.corridorId = corridorId;
        this.neighbourInsideId = neighbourInsideId;
        this.neighbourOutsideId = neighbourOutsideId;
        this.direction = direction;
    }


    // Getter & Setter
    public int getRoomId() {
        return roomId;
    }

    public void setRoomId(int roomId) {
        this.roomId = roomId;
    }

    public String getRoomLabel() {
        return roomLabel;
    }

    public void setRoomLabel(String roomLabel) {
        this.roomLabel = roomLabel;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public Integer getCorridorId() {
        return corridorId;
    }

    public void setCorridorId(Integer corridorId) {
        this.corridorId = corridorId;
    }

    public Integer getNeighbourInsideId() {
        return neighbourInsideId;
    }

    public void setNeighbourInsideId(Integer neighbourInsideId) {
        this.neighbourInsideId = neighbourInsideId;
    }

    public Integer getNeighbourOutsideId() {
        return neighbourOutsideId;
    }

    public void setNeighbourOutsideId(Integer neighbourOutsideId) {
        this.neighbourOutsideId = neighbourOutsideId;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }
}
