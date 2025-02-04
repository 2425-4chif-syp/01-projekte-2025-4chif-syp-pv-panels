class WebSocketHandler {
    constructor() {
        if (WebSocketHandler.instance) {
            return WebSocketHandler.instance;
        }

        WebSocketHandler.instance = this;
        this.callbacks = new Set();
        this.isConnected = false;
        
        this.connect();
    }

    connect() {
        if (this.isConnected || this.ws?.readyState === WebSocket.CONNECTING) {
            return;
        }

        this.ws = new WebSocket('ws://localhost:8080/mqtt-ws');
        
        this.ws.onopen = () => {
            console.log('Verbunden mit Quarkus WebSocket');
            this.isConnected = true;
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Empfangene Daten:', data);
            this.callbacks.forEach(callback => callback(data));
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket Fehler:', error);
            this.isConnected = false;
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket Verbindung geschlossen');
            this.isConnected = false;
            // Versuche nach 5 Sekunden neu zu verbinden
            setTimeout(() => this.connect(), 5000);
        };
    }

    subscribe(callback) {
        console.log('Callback wird registriert');
        this.callbacks.add(callback);
        
        // Wenn die Verbindung geschlossen ist, versuche neu zu verbinden
        if (!this.isConnected) {
            this.connect();
        }
    }

    unsubscribe(callback) {
        console.log('Callback wird entfernt');
        this.callbacks.delete(callback);
    }
}

// Erstelle eine einzelne Instanz des WebSocket-Handlers
const wsHandler = new WebSocketHandler(); 