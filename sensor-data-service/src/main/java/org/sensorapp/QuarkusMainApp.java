package org.sensorapp;

import io.quarkus.runtime.Quarkus;
import io.quarkus.runtime.QuarkusApplication;
import io.quarkus.runtime.annotations.QuarkusMain;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.spi.CDI;
import org.jboss.logging.Logger;
import org.sensorapp.service.SensorDataService;
import org.sensorapp.infrastructure.mqtt.MQTTListener;

@QuarkusMain
public class QuarkusMainApp {
    private static final Logger LOGGER = Logger.getLogger(QuarkusMainApp.class);

    public static void main(String... args) {
        LOGGER.info("🚀 Starte Quarkus Main!");
        Quarkus.run(MainApp.class, args);
    }

    @ApplicationScoped
    public static class MainApp implements QuarkusApplication {
        @Override
        public int run(String... args) {
            LOGGER.info("✅ Quarkus Main-App gestartet!");

            // Beans manuell abrufen und testen
            SensorDataService sensorService = CDI.current().select(SensorDataService.class).get();
            MQTTListener mqttListener = CDI.current().select(MQTTListener.class).get();

            if (sensorService != null) {
                LOGGER.info("✅ SensorDataService erfolgreich geladen!");
            } else {
                LOGGER.error("❌ SensorDataService konnte NICHT geladen werden!");
            }

            if (mqttListener != null) {
                LOGGER.info("✅ MQTTListener erfolgreich geladen!");
            } else {
                LOGGER.error("❌ MQTTListener konnte NICHT geladen werden!");
            }

            // Quarkus laufen lassen
            Quarkus.waitForExit();
            return 0;
        }
    }
}
