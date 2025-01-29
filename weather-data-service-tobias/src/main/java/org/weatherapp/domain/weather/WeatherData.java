package org.weatherapp.domain.weather;

import jakarta.persistence.*;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class WeatherData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String location;
    @Column(nullable = false)
    private double temperature;
    @Column(nullable = false)
    private double humidity;
    @Column(nullable = false)
    private String timestamp;
}
