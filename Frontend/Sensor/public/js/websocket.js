class WebSocketHandler {
    constructor() {
        // Prüfe ob bereits eine Instanz im sessionStorage existiert
        const existingInstance = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('wsHandlerExists');
        
        if (existingInstance === 'true' && WebSocketHandler.instance) {
            return WebSocketHandler.instance;
        }

        WebSocketHandler.instance = this;
        this.callbacks = new Set();
        this.isConnected = false;
        
        // Markiere dass eine Instanz existiert
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('wsHandlerExists', 'true');
        }
        
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

    // Methode zum sauberen Aufräumen beim Beenden der Anwendung
    cleanup() {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('wsHandlerExists');
        }
        this.callbacks.clear();
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Erstelle eine einzelne Instanz des WebSocket-Handlers
const wsHandler = WebSocketHandler.instance || new WebSocketHandler(); 