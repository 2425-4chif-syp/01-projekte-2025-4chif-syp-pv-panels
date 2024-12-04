package at.htl.leoenergy.entity;

import at.htl.leoenergy.influxdb.UnitConverter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.logging.Log;

import java.math.BigInteger;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SensorValue {

    private BigInteger id;
    private Long valueTypeId;
    private String deviceName;
    private long deviceId;
    private long time;
    private String site;
    private String unit;
    private String valueType;
    private double value;
    private String relation;

    public SensorValue() {
    }

    public SensorValue(long deviceId, long time, double value, Long measurementId, String description, String unit, String relation, String deviceName) {
        this.valueTypeId = measurementId;
        this.time = time;
        this.value = value;
        this.deviceId = deviceId;
        this.site = description;
        this.unit = unit;
        this.relation = relation;
    }

    public static SensorValue fromJson(String json) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            SensorValue sensorValue = objectMapper.readValue(json, SensorValue.class);
            UnitConverter.setTypeOfDevice(sensorValue);
            return sensorValue;
        } catch (JsonProcessingException e) {
            Log.error("Error during converting json string to SensorValue object!");
            e.printStackTrace();
            return null;
        }
    }

    public BigInteger getId() {
        return id;
    }

    public void setId(BigInteger id) {
        this.id = id;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getSite() {
        return site;
    }

    public void setSite(String site) {
        this.site = site;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getValueType() {
        return valueType;
    }

    public void setValueType(String valueType) {
        this.valueType = valueType;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(long deviceId) {
        this.deviceId = deviceId;
    }

    public String getRelation() {
        return relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }

    public Long getValueTypeId() {
        return valueTypeId;
    }

    public void setValueTypeId(Long valueTypeId) {
        this.valueTypeId = valueTypeId;
    }
}
