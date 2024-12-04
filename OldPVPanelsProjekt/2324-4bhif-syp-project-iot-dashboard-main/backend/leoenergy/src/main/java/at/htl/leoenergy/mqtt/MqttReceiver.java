package at.htl.leoenergy.mqtt;

import at.htl.leoenergy.entity.Co2Value;
import at.htl.leoenergy.entity.SensorValue;
import at.htl.leoenergy.influxdb.InfluxDbRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

@ApplicationScoped
public class MqttReceiver {
   @Inject
    InfluxDbRepository influxDbRepository;
    @Inject
    Logger log;
   public void insertMeasurement(SensorValue sensorValue){
       influxDbRepository.insertMeasurementFromJSON(sensorValue);
   }

    public void insertCo2Measurement(Co2Value co2Value){
        influxDbRepository.insertCo2MeasurementFromJSON(co2Value);
    }




   @Incoming("Co2")
   public void recieveCo2(byte[] byteArray){
       log.infof("Received measurement from Co2 mqtt: %s", byteArray.length);

       String msg = new String(byteArray);
       try{
           Co2Value co2Value = Co2Value.fromJson(msg);
           insertCo2Measurement(co2Value);

       }
       catch(Exception e){
           e.printStackTrace();
       }
   }


    @Incoming("leoenergy")
    public void receive(byte[] byteArray) {
       log.infof("Received measurement from leoenergy topic mqtt: %s", byteArray.length);

        String msg = new String(byteArray);
        try {
            SensorValue sensorValue = SensorValue.fromJson(msg);
            insertMeasurement(sensorValue);
        }
        catch (NullPointerException e){
            e.printStackTrace();
        }

    }

}
