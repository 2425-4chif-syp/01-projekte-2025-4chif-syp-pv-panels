package org.acme.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.influxdb.annotations.Column;
import com.influxdb.annotations.Measurement;
import java.time.Instant;

@Measurement(name = "weather")
public class WeatherData {
    @Column
    @JsonProperty("temperature_2m")
    private double temperature;
    
    @Column
    @JsonProperty("relative_humidity_2m")
    private double humidity;
    
    @Column
    @JsonProperty("pressure_msl")
    private double pressure;
    
    @Column
    @JsonProperty("wind_speed_10m")
    private double windSpeed;
    
    @Column
    @JsonProperty("wind_direction_10m")
    private double windDirection;

    @Column(tag = true)
    private String station = "Vienna"; // Default station

    @Column(timestamp = true)
    private Instant time;

    // Getters and setters
    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public double getHumidity() { return humidity; }
    public void setHumidity(double humidity) { this.humidity = humidity; }

    public double getPressure() { return pressure; }
    public void setPressure(double pressure) { this.pressure = pressure; }

    public double getWindSpeed() { return windSpeed; }
    public void setWindSpeed(double windSpeed) { this.windSpeed = windSpeed; }

    public double getWindDirection() { return windDirection; }
    public void setWindDirection(double windDirection) { this.windDirection = windDirection; }

    public String getStation() { return station; }
    public void setStation(String station) { this.station = station; }

    public Instant getTime() { return time; }
    public void setTime(Instant time) { this.time = time; }

    @Override
    public String toString() {
        return String.format("WeatherData{station='%s', time=%s, temperature=%.1f, humidity=%.1f, pressure=%.1f, windSpeed=%.1f, windDirection=%.1f}",
            station, time, temperature, humidity, pressure, windSpeed, windDirection);
    }
} 