package org.acme.service;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.WriteApiBlocking;
import com.influxdb.client.domain.WritePrecision;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.acme.model.WeatherData;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.time.Instant;

@Path("/weather")
@ApplicationScoped
public class WeatherService {

    @Inject
    InfluxDBClient influxDBClient;

    @ConfigProperty(name = "influxdb.org")
    String organization;

    @ConfigProperty(name = "influxdb.bucket")
    String bucket;

    @RegisterRestClient(baseUri = "https://api.open-meteo.com/v1")
    public interface OpenMeteoService {
        @GET
        @Path("/forecast")
        @Produces(MediaType.APPLICATION_JSON)
        WeatherResponse getCurrentWeather(
            @jakarta.ws.rs.QueryParam("latitude") double latitude,
            @jakarta.ws.rs.QueryParam("longitude") double longitude,
            @jakarta.ws.rs.QueryParam("current") String current
        );
    }

    public static class WeatherResponse {
        public Current current;
        
        public static class Current {
            public double temperature_2m;
            public double relative_humidity_2m;
            public double pressure_msl;
            public double wind_speed_10m;
            public double wind_direction_10m;
            public String time;
        }
    }

    @Inject
    @RestClient
    OpenMeteoService weatherService;

    @Scheduled(every = "5m")
    void fetchAndStoreWeatherData() {
        try {
            // Coordinates for Vienna
            double latitude = 48.2082;
            double longitude = 16.3738;
            
            WeatherResponse response = weatherService.getCurrentWeather(
                latitude, 
                longitude,
                "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m"
            );

            WeatherData weatherData = new WeatherData();
            weatherData.setTemperature(response.current.temperature_2m);
            weatherData.setHumidity(response.current.relative_humidity_2m);
            weatherData.setPressure(response.current.pressure_msl);
            weatherData.setWindSpeed(response.current.wind_speed_10m);
            weatherData.setWindDirection(response.current.wind_direction_10m);
            weatherData.setTime(Instant.now());

            WriteApiBlocking writeApi = influxDBClient.getWriteApiBlocking();
            writeApi.writeMeasurement(organization, bucket, WritePrecision.NS, weatherData);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public WeatherData getCurrentWeather() {
        // Coordinates for Vienna
        double latitude = 48.2082;
        double longitude = 16.3738;
        
        WeatherResponse response = weatherService.getCurrentWeather(
            latitude, 
            longitude,
            "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m"
        );

        WeatherData weatherData = new WeatherData();
        weatherData.setTemperature(response.current.temperature_2m);
        weatherData.setHumidity(response.current.relative_humidity_2m);
        weatherData.setPressure(response.current.pressure_msl);
        weatherData.setWindSpeed(response.current.wind_speed_10m);
        weatherData.setWindDirection(response.current.wind_direction_10m);
        weatherData.setTime(Instant.now());
        
        return weatherData;
    }
} 