package at.htlleonding.entity;


import java.math.BigInteger;
import java.time.Instant;

public class SensorValue {

    private BigInteger id;

    Device device;
    private Long measurementId;
    private String description;

    private String unit;
    private long time;

    private double value;

    Instant timeInstance;



    public SensorValue() {
    }


    public SensorValue(Device device, long time, double value, Long measurementId, String description,String unit)  {
        this.measurementId = measurementId;
        this.time = time;
        this.value = value;
       this.device = device;
        this.description = description;
        this.unit = unit;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Instant getTimeInstance() {
        return timeInstance;
    }

    public void setTimeInstance(Instant timeInstance) {
        this.timeInstance = timeInstance;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public BigInteger getId() {
        return id;
    }

    public Long getMeasurementId() {
        return measurementId;
    }

    public void setMeasurementId(Long measurementId) {
        this.measurementId = measurementId;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public void setId(BigInteger id) {
        this.id = id;
    }
}