const mqtt = require('mqtt');
const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

// Express-Server erstellen
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Statische Dateien aus dem 'public'-Ordner servieren
app.use(express.static(path.join(__dirname, 'public')));

const mqttClient = mqtt.connect({
    host: 'mqtt.htl-leonding.ac.at',
    port: 8883,
    protocol: 'mqtts',
    username: 'leo-student',
    password: 'sTuD@w0rck',
    rejectUnauthorized: true
});

// Objekt zum Speichern der ersten empfangenen Werte für jedes Topic
const initialValues = {};

// MQTT-Verbindung und Abonnement
mqttClient.on('connect', () => {
    console.log('Verbunden mit MQTT-Broker');
    mqttClient.subscribe('#', (err) => {
        if (!err) {
            console.log('Erfolgreich alle Themen abonniert mit #');
        } else {
            console.error('Fehler beim Abonnieren von #:', err);
        }
    });
});

// Empfange MQTT-Nachrichten und speichere den ersten Wert für jedes Topic
mqttClient.on('message', (topic, message) => {
    const parsedMessage = JSON.parse(message.toString());
    console.log(`Topic: ${topic}, Message: ${message.toString()}`);

    // Speichere nur den ersten Wert für jedes Topic, falls er noch nicht vorhanden ist
    if (!(topic in initialValues)) {
        initialValues[topic] = parsedMessage;
    }

    // Sende die Nachricht an alle verbundenen WebSocket-Clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ topic, message: parsedMessage }));
        }
    });
});

// WebSocket-Verbindung
wss.on('connection', (ws) => {
    console.log('Neue WebSocket-Verbindung hergestellt');

    // Sende alle initialen Werte an den neuen Client
    for (const [topic, message] of Object.entries(initialValues)) {
        ws.send(JSON.stringify({ topic, message }));
    }

    ws.send(JSON.stringify({ message: "Verbunden mit dem Server" }));
});

// Starte den Server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
