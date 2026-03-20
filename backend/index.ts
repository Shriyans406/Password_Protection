import { Elysia } from 'elysia';
import { SerialPort } from 'serialport';

const port = new SerialPort({
    path: 'COM9',
    baudRate: 115200,
    autoOpen: false,
});

let lastVaultData = "Waiting for board...";

port.open((err) => {
    if (err) return console.log('❌ Error: ', err.message);
    console.log('✅ --- USB BRIDGE ONLINE (COM9) ---');
});

// 1. RAW DATA LISTENER (No Parser)
// This will trigger the MOMENT any byte arrives
port.on('data', (raw) => {
    const message = raw.toString();
    console.log(`[RAW DATA]: ${message}`);

    // Save the latest chunk for the web
    lastVaultData = message;
});

// 2. ERROR LISTENER
port.on('error', (err) => {
    console.log('⚠️ Serial Error: ', err.message);
});

// 3. THE WEB API
const app = new Elysia()
    .get('/', () => 'FortressKey Bridge is Alive')
    .get('/vault', () => {
        return {
            status: "Active",
            data: lastVaultData
        };
    })
    .listen(3000);

console.log(`🦊 Elysia API: http://localhost:3000/vault`);