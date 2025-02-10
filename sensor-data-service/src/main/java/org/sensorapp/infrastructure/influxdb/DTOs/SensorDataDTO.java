package org.sensorapp.infrastructure.influxdb.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SensorDataDTO {
    private String time; // Zeitstempel
    private Double temperature; // Temperaturwert (oder anderes Feld, je nach Bedarf)

    @Override
    public String toString() {
        return "SensorDataDTO{" +
                "time='" + time + '\'' +
                ", temperature=" + temperature +
                '}';
    }
}

