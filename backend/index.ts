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

    if (text.includes("Service:")) {
        const match = text.match(/Service:\s+(.*)/);
        if (match) vaultData.service = match[1].trim();
    }

    if (text.includes("DECRYPTED:")) {
        if (text.includes("[LOCKED]")) {
            vaultData.decrypted = "LOCKED: AWAITING PHYSICAL TOUCH";
        } else {
            // New Regex: Grab everything between 'DECRYPTED: ' and the '#' symbol
            const passMatch = text.match(/DECRYPTED:\s+([^#]+)/);
            if (passMatch) vaultData.decrypted = passMatch[1].trim();
        }
        vaultData.lastSeen = new Date().toLocaleTimeString();
    }
});

// 4. THE CLEAN API
const app = new Elysia()
    .use(cors()) // Add this line
    .get('/vault', () => vaultData)
    .listen(3001); // Change this to 3001

console.log(`🦊 CLEAN API LIVE: http://localhost:3000/vault`);