package at.htl.leoenergy.entity;

import at.htl.leoenergy.influxdb.UnitConverter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;

public class Co2Value {

    private String roomName;
    private int value;
    private long time;

    public Co2Value(String roomName, int value, long time) {
        this.roomName = roomName;
        this.value = value;
        this.time = time;
    }

    public static Co2Value fromJson(String json) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Co2Value co2Value = objectMapper.readValue(json, Co2Value.class);

            return co2Value;
        } catch (JsonProcessingException e) {
            Log.error("Error during converting json string to Co2 object!");
            e.printStackTrace();
            return null;
        }
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }
}
