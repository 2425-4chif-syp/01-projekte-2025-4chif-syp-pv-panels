package org.acme;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.notNullValue;

@QuarkusTest
class WeatherServiceTest {
    @Test
    @EnabledIfEnvironmentVariable(named = "TEST_WEATHER_API", matches = "true")
    void testWeatherEndpoint() {
        given()
          .when().get("/weather")
          .then()
             .statusCode(200)
             .body("temperature", notNullValue())
             .body("humidity", notNullValue())
             .body("pressure", notNullValue())
             .body("windSpeed", notNullValue())
             .body("windDirection", notNullValue());
    }
} 