package at.htlleonding.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
public class SensorValuePojo {
    @JsonProperty("deviceName")
    public String deviceName;

    @JsonProperty("measurementId")
    private Long measurementId;
    @JsonProperty("description")
    private String description;

    @JsonProperty("unit")
    private String unit;
    @JsonProperty("timestamp")
    private long time;
    @JsonProperty("value")
    private double value;

    public SensorValuePojo() {
    }

    public SensorValuePojo(String deviceName, Long measurementId, String description, String unit, long time, double value) {
        this.deviceName = deviceName;
        this.measurementId = measurementId;
        this.description = description;
        this.unit = unit;
        this.time = time;
        this.value = value;
    }

    public Long getMeasurementId() {
        return measurementId;
    }

    public void setMeasurementId(Long measurementId) {
        this.measurementId = measurementId;
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

    public long getTime() {
        return time;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return "SensorValuePojo{" +
                "deviceName='" + deviceName + '\'' +
                ", measurementId=" + measurementId +
                ", description='" + description + '\'' +
                ", unit='" + unit + '\'' +
                ", time=" + time +
                ", value=" + value +
                '}';
    }
}
