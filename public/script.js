const canvas = document.getElementById('telemetryCanvas');
const ctx = canvas.getContext('2d');
const temperatureValueElement = document.getElementById('temperatureValue');
const rpmValueElement = document.getElementById('rpmValue');
const fuelLevelValueElement = document.getElementById('fuelLevelValue');
const fuelLevelBarElement = document.getElementById('fuelLevelBar');
const timestampValueElement = document.getElementById('timestampValue');
const websocket = new WebSocket('ws://localhost:3000');

websocket.onopen = () => {
    console.log('WebSocket connection established');
};

function drawSpeedometer(speed) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.75;
    const radius = Math.min(centerX, centerY) - 50;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const totalAngle = endAngle - startAngle;
    const maxSpeed = 120;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ccc';
    ctx.stroke();

    const numTicks = 10;
    for (let i = 0; i <= numTicks; i++) {
        const angle = startAngle + (i / numTicks) * totalAngle;
        const tickX = centerX + radius * Math.cos(angle);
        const tickY = centerY + radius * Math.sin(angle);
        const innerRadius = radius * 0.9;
        const innerX = centerX + innerRadius * Math.cos(angle);
        const innerY = centerY + innerRadius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(tickX, tickY);
        ctx.lineTo(innerX, innerY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#666';
        ctx.stroke();

        if (i % 2 === 0) {
            const value = Math.round((i / numTicks) * maxSpeed);
            const textX = centerX + (radius + 20) * Math.cos(angle);
            const textY = centerY + (radius + 20) * Math.sin(angle) + 5;
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.fillText(value, textX, textY);
        }
    }

    const speedRatio = speed / maxSpeed;
    const needleAngle = startAngle + speedRatio * totalAngle;
    const needleRadius = radius * 0.8;
    const needleX = centerX + needleRadius * Math.cos(needleAngle);
    const needleY = centerY + needleRadius * Math.sin(needleAngle);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(needleX, needleY);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'red';
    ctx.stroke();

    ctx.font = '24px bold sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(speed), centerX, centerY - radius * 0.2);
    ctx.font = '16px sans-serif';
    ctx.fillText('km/h', centerX, centerY - radius * 0.1);
}

websocket.onmessage = (event) => {
    const telemetryData = JSON.parse(event.data);
    const currentSpeed = telemetryData.speed;
    const currentTemperature = telemetryData.temperature;
    const currentRpm = telemetryData.rpm;
    const currentFuelLevel = telemetryData.fuelLevel;
    const currentTimestamp = telemetryData.timestamp;

    drawSpeedometer(currentSpeed);

    temperatureValueElement.textContent = Math.round(currentTemperature);
    rpmValueElement.textContent = Math.round(currentRpm);
    fuelLevelValueElement.textContent = currentFuelLevel.toFixed(1); // Show one decimal place
    fuelLevelBarElement.style.width = `${currentFuelLevel}%`;
    timestampValueElement.textContent = new Date(currentTimestamp).toLocaleTimeString(); // Show local time
};

websocket.onclose = () => {
    console.log('WebSocket connection closed');
};

websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
};