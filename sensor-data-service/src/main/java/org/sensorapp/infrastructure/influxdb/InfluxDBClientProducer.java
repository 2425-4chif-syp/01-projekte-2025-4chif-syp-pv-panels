package org.sensorapp.infrastructure.influxdb;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Singleton;

@ApplicationScoped
public class InfluxDBClientProducer {

    private static final String INFLUXDB_URL = "http://127.0.0.1:8086";
    private static final String INFLUXDB_TOKEN = "Nr6fRfvDbW6sBMfL5R3Uuqpc1ckqkLNezsFF1QMpquWXf4r2Uf1iJRp3C-PlthVWRMWF0NHdaiIdKxx30240nA==";
    private static final String INFLUXDB_ORG = "sensor_org";
    private static final String INFLUXDB_BUCKET = "sensor_bucket";

    @Produces
    @Singleton
    public InfluxDBClient createInfluxDBClient() {
        return InfluxDBClientFactory.create(INFLUXDB_URL, INFLUXDB_TOKEN.toCharArray(), INFLUXDB_ORG, INFLUXDB_BUCKET);
    }
}

