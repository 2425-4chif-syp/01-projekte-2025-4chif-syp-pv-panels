package org.weatherapp;

import org.weatherapp.application.MQTTListener;

public class Main {
    public static void main(String[] args) {
        System.out.println("Starting MQTT Listener Test...");

        MQTTListener mqttListener = new MQTTListener();

        mqttListener.init();

        System.out.println("MQTT Listener Test completed.");
    }
}
