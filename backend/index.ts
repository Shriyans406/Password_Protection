import { Elysia } from 'elysia';
import { spawn } from 'node:child_process';
import { cors } from '@elysiajs/cors';

// 1. Structure the "Vault" data properly
interface VaultEntry {
    service: string;
    nonce: string;
    encrypted: string;
    decrypted: string;
    lastSeen: string;
}

let vaultData: VaultEntry = {
    service: "Searching...",
    nonce: "---",
    encrypted: "---",
    decrypted: "---",
    lastSeen: "Never"
};

// 2. THE POWER-PIPE
const ps = spawn('powershell', [
    '-Command',
    `$p = New-Object System.IO.Ports.SerialPort COM9, 115200, None, 8, one; 
   $p.DtrEnable = $true; 
   $p.Open(); 
   while($p.IsOpen) { 
     if($p.BytesToRead -gt 0) { Write-Host $p.ReadExisting() }
     Start-Sleep -Milliseconds 100;
   }`
]);

// 3. THE PARSER: This is the logic that cleans the garbage
ps.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    console.log(`[BOARD RAW]: ${text}`);

    // We look for specific words and "cut" the text we need
    if (text.includes("Service:")) {
        const serviceMatch = text.match(/Service:\s+(.*)/);
        if (serviceMatch) vaultData.service = serviceMatch[1].trim();
    }
    if (text.includes("Nonce:")) {
        const nonceMatch = text.match(/Nonce:\s+([a-f0-9 ]+)/);
        if (nonceMatch) vaultData.nonce = nonceMatch[1].trim();
    }
    if (text.includes("Encrypted:")) {
        const encMatch = text.match(/Encrypted:\s+([a-f0-9 ]+)/);
        if (encMatch) vaultData.encrypted = encMatch[1].trim();
    }
    if (text.includes("DECRYPTED:")) {
        // We stop reading the password at the first non-alphabetical character
        const passMatch = text.match(/DECRYPTED:\s+([A-Za-z0-9]+)/);
        if (passMatch) vaultData.decrypted = passMatch[1].trim();
        vaultData.lastSeen = new Date().toLocaleTimeString();
    }
});

// 4. THE CLEAN API
const app = new Elysia()
    .use(cors()) // Add this line
    .get('/vault', () => vaultData)
    .listen(3001); // Change this to 3001

console.log(`🦊 CLEAN API LIVE: http://localhost:3000/vault`);