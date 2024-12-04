package at.htl.leoenergy.mqtt;

import io.quarkus.logging.Log;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

@ApplicationScoped
public class InitBean {
    @Inject
    MqttReceiver mqttReceiver;

    void init(@Observes StartupEvent event) {
        Log.info("It works");
    }
}
