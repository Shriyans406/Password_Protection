import { createSignal, onMount, onCleanup, For } from 'solid-js';

function App() {
  // 1. Create a reactive box to hold the vault data
  const [data, setData] = createSignal({
    service: "Scanning...",
    nonce: "---",
    encrypted: "---",
    decrypted: "---",
    lastSeen: "---"
  });

  // 2. The Fetcher: Asks the Bun Bridge for data
  const updateVault = async () => {
    try {
      const response = await fetch('http://localhost:3001/vault');
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error("Bridge not responding...");
    }
  };

  // 3. The Heartbeat: Refresh every 2 seconds
  onMount(() => {
    const interval = setInterval(updateVault, 2000);
    onCleanup(() => clearInterval(interval));
  });

  return (
    <div class="min-h-screen p-8 flex flex-col items-center">
      <header class="mb-12 text-center">
        <h1 class="text-4xl font-bold text-neon tracking-widest mb-2">FORTRESS KEY</h1>
        <p class="text-gray-400 text-sm">Digital Forensic Logic Vault | Active Session</p>
      </header>

      <main class="w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-lg overflow-hidden shadow-2xl">
        <div class="bg-slate-800 p-4 border-b border-slate-700 flex justify-between">
          <span class="text-neon uppercase text-xs font-bold">Encrypted Data Stream</span>
          <span class="text-gray-500 text-xs italic">Last Sync: {data().lastSeen}</span>
        </div>

        <table class="w-full text-left">
          <thead class="bg-slate-900 text-gray-500 text-xs uppercase">
            <tr>
              <th class="p-4">Service</th>
              <th class="p-4">Hardware Nonce</th>
              <th class="p-4">Encrypted Hash</th>
              <th class="p-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr class="hover:bg-slate-800/50 transition-colors">
              <td class="p-4 font-bold text-white">{data().service}</td>
              <td class="p-4 text-xs text-blue-400">{data().nonce}</td>
              <td class="p-4 text-xs text-red-400">{data().encrypted}</td>
              <td class="p-4">
                <span class="bg-neon/10 text-neon px-2 py-1 rounded text-[10px] font-bold uppercase">Locked</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* The Reveal Section */}
        <div class="p-8 bg-slate-950/50 border-t border-slate-800">
          <h3 class="text-xs text-gray-500 uppercase mb-4">Decrypted Output</h3>
          <div class="bg-black p-6 rounded border border-neon/30 text-2xl text-center text-neon shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            {data().decrypted}
          </div>
        </div>
      </main>

      <footer class="mt-8 text-gray-600 text-[10px] uppercase tracking-tighter">
        HP Forensic Environment | Hardware-Linked Session via COM9
      </footer>
    </div>
  );
}

export default App;