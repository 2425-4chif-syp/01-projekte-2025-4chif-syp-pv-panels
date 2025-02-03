package com.example.scheduler;

import com.example.service.WeatherService;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class WeatherScheduler {

    @Inject
    WeatherService weatherService;

    @Scheduled(every = "1h") // Adjust the interval as needed
    void fetchWeather() {
        weatherService.fetchAndStoreWeatherData();
    }
}
