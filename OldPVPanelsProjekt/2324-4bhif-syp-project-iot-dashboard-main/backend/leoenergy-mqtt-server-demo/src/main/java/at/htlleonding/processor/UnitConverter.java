package at.htlleonding.processor;

public class UnitConverter {
    public static double convertToKilowatt(String unit, double value) {
        double result;

        switch (unit) {
            case "W":
                result = value / 1000.0;
                break;
            case "Wh":
                result = value / 1000.0;
                break;
            case "A":
            case "Bin":
            default:
                result = 0.00;
        }

        return result;
    }
}