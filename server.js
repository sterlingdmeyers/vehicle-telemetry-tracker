const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 3000;

// Serve static files (for our client-side HTML, CSS, JS)
app.use(express.static('public'));

wss.on('connection', ws => {
  console.log('Client connected');

  // Function to generate dummy telemetry data
  const generateTelemetryData = () => {
    return {
      temperature: Math.floor(Math.random() * (100 - 50 + 1)) + 50, // Example temperature between 50 and 100
      speed: Math.floor(Math.random() * 120), // Example speed up to 120
      rpm: Math.floor(Math.random() * 6000), // Example RPM up to 6000
      fuelLevel: parseFloat((Math.random() * 100).toFixed(2)), // Example fuel level with 2 decimal places
      timestamp: new Date().toISOString()
    };
  };

  // Send dummy data every second
  const interval = setInterval(() => {
    const telemetryData = generateTelemetryData();
    ws.send(JSON.stringify(telemetryData));
  }, 1000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});