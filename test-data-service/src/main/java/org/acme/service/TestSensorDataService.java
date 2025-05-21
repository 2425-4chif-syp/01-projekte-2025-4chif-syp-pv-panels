package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.acme.model.SensorDataDTO;
import org.acme.model.SensorValueDTO;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@ApplicationScoped
public class TestSensorDataService {
    private static final Logger LOGGER = Logger.getLogger(TestSensorDataService.class.getName());
    
    // Maps to store the current sensor values for each type
    private final Map<String, Map<String, Map<String, Double>>> currentValues = new ConcurrentHashMap<>();
    
    // Define available floors, sensor types and test sensor IDs
    private final List<String> floors = Arrays.asList("eg", "1og", "2og", "ug");
    private final List<String> sensorTypes = Arrays.asList("temperature", "humidity", "co2");
    
    // Sensor min/max values and adjustment ranges
    private final double MIN_TEMP = 18.0;
    private final double MAX_TEMP = 26.0;
    private final double TEMP_ADJUST = 0.5;
    
    private final double MIN_HUMIDITY = 30.0;
    private final double MAX_HUMIDITY = 70.0;
    private final double HUMIDITY_ADJUST = 2.0;
    
    private final double MIN_CO2 = 400.0;
    private final double MAX_CO2 = 1500.0;
    private final double CO2_ADJUST = 30.0;
    
    // Random for generating fluctuations
    private final Random random = new Random();

    public TestSensorDataService() {
        // Initialize with some test sensors and starting values
        initializeTestSensors();
    }

    private void initializeTestSensors() {
        // Create 3-4 sensors per floor with initial values
        for (String floor : floors) {
            Map<String, Map<String, Double>> floorSensors = new HashMap<>();
            
            // Number of sensors per floor varies between 3-5
            int numSensors = 3 + random.nextInt(3);
            
            for (int i = 1; i <= numSensors; i++) {
                String sensorId = "test_sensor_" + floor + "_" + i;
                
                Map<String, Double> sensorValues = new HashMap<>();
                sensorValues.put("temperature", getRandomInRange(MIN_TEMP, MAX_TEMP));
                sensorValues.put("humidity", getRandomInRange(MIN_HUMIDITY, MAX_HUMIDITY));
                sensorValues.put("co2", getRandomInRange(MIN_CO2, MAX_CO2));
                
                floorSensors.put(sensorId, sensorValues);
                LOGGER.info("Created test sensor: " + sensorId + " for floor: " + floor);
            }
            
            currentValues.put(floor, floorSensors);
        }
    }

    /**
     * Updates all sensor values with small random changes to simulate real-world fluctuations.
     * Should be called periodically to keep values changing.
     */
    public void updateSensorValues() {
        for (String floor : floors) {
            Map<String, Map<String, Double>> floorSensors = currentValues.get(floor);
            if (floorSensors != null) {
                for (Map.Entry<String, Map<String, Double>> sensor : floorSensors.entrySet()) {
                    Map<String, Double> values = sensor.getValue();
                    
                    // Update temperature with small fluctuations
                    double currentTemp = values.get("temperature");
                    double newTemp = adjustValue(currentTemp, TEMP_ADJUST, MIN_TEMP, MAX_TEMP);
                    values.put("temperature", newTemp);
                    
                    // Update humidity with small fluctuations
                    double currentHumidity = values.get("humidity");
                    double newHumidity = adjustValue(currentHumidity, HUMIDITY_ADJUST, MIN_HUMIDITY, MAX_HUMIDITY);
                    values.put("humidity", newHumidity);
                    
                    // Update CO2 with small fluctuations
                    double currentCO2 = values.get("co2");
                    double newCO2 = adjustValue(currentCO2, CO2_ADJUST, MIN_CO2, MAX_CO2);
                    values.put("co2", newCO2);
                }
            }
        }
        
        LOGGER.info("Updated all sensor values");
    }
    
    private double adjustValue(double currentValue, double adjustRange, double min, double max) {
        // Generate a random adjustment: could be positive or negative
        double adjustment = (random.nextDouble() * 2 - 1) * adjustRange;
        
        // Apply adjustment and keep within range
        double newValue = currentValue + adjustment;
        if (newValue < min) {
            newValue = min + random.nextDouble() * adjustRange;
        } else if (newValue > max) {
            newValue = max - random.nextDouble() * adjustRange;
        }
        
        // Round to 2 decimal places for temperatures and humidity
        return Math.round(newValue * 100.0) / 100.0;
    }
    
    private double getRandomInRange(double min, double max) {
        return min + (max - min) * random.nextDouble();
    }
    
    // API Methods to access sensor data
    
    public List<String> getAllFloors() {
        return floors;
    }
    
    public List<String> getSensorsByFloor(String floor) {
        Map<String, Map<String, Double>> floorSensors = currentValues.get(floor);
        if (floorSensors != null) {
            return new ArrayList<>(floorSensors.keySet());
        }
        return Collections.emptyList();
    }
    
    public Set<String> getSensorFields(String floor, String sensorId) {
        Map<String, Map<String, Double>> floorSensors = currentValues.get(floor);
        if (floorSensors != null) {
            Map<String, Double> sensorValues = floorSensors.get(sensorId);
            if (sensorValues != null) {
                return new HashSet<>(sensorValues.keySet());
            }
        }
        return Collections.emptySet();
    }
    
    public List<SensorValueDTO> getSpecificSensorValues(String floor, String sensorId, String sensorType) {
        Map<String, Map<String, Double>> floorSensors = currentValues.get(floor);
        if (floorSensors != null) {
            Map<String, Double> sensorValues = floorSensors.get(sensorId);
            if (sensorValues != null && sensorValues.containsKey(sensorType)) {
                List<SensorValueDTO> result = new ArrayList<>();
                // Return current value
                result.add(new SensorValueDTO(Instant.now(), sensorValues.get(sensorType)));
                return result;
            }
        }
        return Collections.emptyList();
    }
    
    public List<SensorDataDTO> getAllSensorValues(String floor, String sensorId) {
        Map<String, Map<String, Double>> floorSensors = currentValues.get(floor);
        if (floorSensors != null) {
            Map<String, Double> sensorValues = floorSensors.get(sensorId);
            if (sensorValues != null) {
                List<SensorDataDTO> result = new ArrayList<>();
                Instant now = Instant.now();
                
                for (Map.Entry<String, Double> entry : sensorValues.entrySet()) {
                    result.add(new SensorDataDTO(now, entry.getKey(), entry.getValue()));
                }
                
                return result;
            }
        }
        return Collections.emptyList();
    }
}