const ModbusRTU = require("modbus-serial");
const WebSocket = require("ws");

const client = new ModbusRTU();
const wss = new WebSocket.Server({ port: 8080 });

// TCP connection parameters
const HOST = "192.168.45.160"; // Replace with your Modbus TCP server IP
const PORT = 502;             // Default Modbus TCP port
const UNIT_ID = 3;            // Modbus slave ID

try {
    client.connectTCP(HOST, { port: PORT });
    client.setID(UNIT_ID);
} catch (err){console.error("Connection error:", err)}

wss.on("connection", ws => {
    console.log("Browser connected");

ws.on("message", async message => {
    try {
        const { address, length } = JSON.parse(message);
        const data = await client.readInputRegisters(address, length);
        const value = data.buffer.readFloatBE(0);
        ws.send(JSON.stringify(value));
    
    } catch (err) {
        client.connectTCP(HOST, { port: PORT });
        client.setID(UNIT_ID);
        ws.send("Try again");
        console.log("ERROR")
    }
});
});
