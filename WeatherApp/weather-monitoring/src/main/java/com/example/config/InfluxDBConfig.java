package com.example.config;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class InfluxDBConfig {

    @ConfigProperty(name = "quarkus.influxdb.url")
    String url;

    @ConfigProperty(name = "quarkus.influxdb.token")
    String token;

    @ConfigProperty(name = "quarkus.influxdb.org")
    String org;

    @ConfigProperty(name = "quarkus.influxdb.bucket")
    String bucket;

    @Produces
    public InfluxDBClient influxDBClient() {
        return InfluxDBClientFactory.create(url, token.toCharArray(), org, bucket);
    }
}
