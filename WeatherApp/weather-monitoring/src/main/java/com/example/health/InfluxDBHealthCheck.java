package com.example.health;

import com.influxdb.client.InfluxDBClient;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;
import jakarta.inject.Inject;

@Readiness
public class InfluxDBHealthCheck implements HealthCheck {

    @Inject
    InfluxDBClient influxDBClient;

    @Override
    public HealthCheckResponse call() {
        boolean up = influxDBClient.ping();
        return HealthCheckResponse.named("influxdb")
                .status(up)
                .build();
    }
}
