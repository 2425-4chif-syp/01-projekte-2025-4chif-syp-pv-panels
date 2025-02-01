const mqtt = require('mqtt');
const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

const mqttClient = mqtt.connect({
    host: 'mqtt.htl-leonding.ac.at',
    port: 8883,
    protocol: 'mqtts',
    username: 'leo-student',
    password: 'sTuD@w0rck',
    rejectUnauthorized: true
});

const initialValues = {};

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

mqttClient.on('message', (topic, message) => {
    const parsedMessage = JSON.parse(message.toString());
    console.log(`Topic: ${topic}, Message: ${message.toString()}`);

    if (!(topic in initialValues)) {
        initialValues[topic] = parsedMessage;
    }

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ topic, message: parsedMessage }));
        }
    });
});

wss.on('connection', (ws) => {
    console.log('Neue WebSocket-Verbindung hergestellt');

    for (const [topic, message] of Object.entries(initialValues)) {
        ws.send(JSON.stringify({ topic, message }));
    }

    ws.send(JSON.stringify({ message: "Verbunden mit dem Server" }));
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
