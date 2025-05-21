package org.acme.model;

import jakarta.json.bind.annotation.JsonbProperty;
import java.time.Instant;

public class SensorDataDTO {
    @JsonbProperty("timestamp")
    private Instant timestamp;

    @JsonbProperty("sensorType")
    private String sensorType;

    @JsonbProperty("value")
    private double value;

    public SensorDataDTO() {
    }

    public SensorDataDTO(Instant timestamp, String sensorType, double value) {
        this.timestamp = timestamp;
        this.sensorType = sensorType;
        this.value = value;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getSensorType() {
        return sensorType;
    }

    public void setSensorType(String sensorType) {
        this.sensorType = sensorType;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }
}