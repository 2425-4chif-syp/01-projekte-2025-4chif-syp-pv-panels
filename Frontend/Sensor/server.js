const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
