package at.htlleonding.entity;



public class Device {

    private int Id;
    private String manufacturerId;

    private String medium;
    private String name;
    private String site;

    //region constructors
    public Device() {
    }

    public Device(int deviceId, String manufacturerId, String medium, String name, String site) {
        this.Id = deviceId;
        this.manufacturerId = manufacturerId;
        this.medium = medium;
        this.name = name;
        this.site = site;
    }
    //endregion

    //region getter and setter

    public int getId() {
        return Id;
    }

    public void setId(int deviceId) {
        this.Id = deviceId;
    }

    public String getManufacturerId() {
        return manufacturerId;
    }

    public void setManufacturerId(String manufacturerId) {
        this.manufacturerId = manufacturerId;
    }

    public String getMedium() {
        return medium;
    }

    public void setMedium(String medium) {
        this.medium = medium;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSite() {
        return site;
    }

    public void setSite(String site) {
        this.site = site;
    }
    //endregion

    @Override
    public String toString() {
        return String.format("%s", name);
    }
}