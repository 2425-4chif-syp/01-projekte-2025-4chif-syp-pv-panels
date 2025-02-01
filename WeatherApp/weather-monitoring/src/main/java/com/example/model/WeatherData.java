package com.example.model;

import com.influxdb.annotations.Measurement;
import com.influxdb.annotations.Column;

import java.time.Instant;

@Measurement(name = "weather")
public class WeatherData {

    @Column(tag = true)
    private String city;

    @Column
    private double temp;

    @Column(timestamp = true)
    private Instant time;

    // Getters and Setters
    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public double getTemp() {
        return temp;
    }

    public void setTemp(double temp) {
        this.temp = temp;
    }

    public Instant getTime() {
        return time;
    }

    public void setTime(Instant time) {
        this.time = time;
    }
}
