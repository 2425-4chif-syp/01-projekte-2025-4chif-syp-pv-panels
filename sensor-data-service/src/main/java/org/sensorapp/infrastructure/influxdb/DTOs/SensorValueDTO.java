package org.sensorapp.infrastructure.influxdb.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SensorValue {
    private Instant timestamp;
    private double value;
}
