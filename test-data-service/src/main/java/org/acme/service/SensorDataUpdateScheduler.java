package org.acme.service;

import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.logging.Logger;

@ApplicationScoped
public class SensorDataUpdateScheduler {

    private static final Logger LOGGER = Logger.getLogger(SensorDataUpdateScheduler.class.getName());

    @Inject
    TestSensorDataService sensorDataService;
    
    /**
     * Updates sensor data values every 2 minutes to simulate changing sensor readings
     */
    @Scheduled(every = "2m")
    void updateSensorData() {
        LOGGER.info("Running scheduled sensor data update");
        sensorDataService.updateSensorValues();
    }
}