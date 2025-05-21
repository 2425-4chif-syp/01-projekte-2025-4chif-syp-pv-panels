package org.acme.model;

import jakarta.json.bind.annotation.JsonbProperty;
import java.time.Instant;

public class SensorValueDTO {
    @JsonbProperty("timestamp")
    private Instant timestamp;

    @JsonbProperty("value")
    private Double value;

    public SensorValueDTO() {
    }

    public SensorValueDTO(Instant timestamp, Double value) {
        this.timestamp = timestamp;
        this.value = value;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }
}