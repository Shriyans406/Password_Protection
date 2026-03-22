import { createSignal, onMount, onCleanup } from 'solid-js';

function App() {
  // 1. Reactive state
  const [data, setData] = createSignal({
    service: "Scanning...",
    nonce: "---",
    encrypted: "---",
    decrypted: "---",
    lastSeen: "---"
  });

  // 2. Data Fetcher
  const updateVault = async () => {
    try {
      const response = await fetch('http://localhost:3001/vault');
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error("Bridge not responding...");
    }
  };

  // 3. Heartbeat
  onMount(() => {
    const interval = setInterval(updateVault, 2000);
    onCleanup(() => clearInterval(interval));
  });

  return (
    <div class="min-h-screen p-4 md:p-12 flex flex-col items-center">
      {/* Cinematic Header */}
      <header class="mb-16 text-center relative">
        <div class="flex items-center justify-center gap-4 mb-4">
          <div class="w-3 h-3 bg-neon rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
          <span class="text-neon text-[10px] uppercase tracking-[0.3em] font-bold">System Online</span>
        </div>
        <h1 class="text-5xl md:text-7xl font-bold text-white tracking-wide mb-2 opacity-90">
          FORTRESS <span class="text-neon">KEY</span>
        </h1>
        <p class="text-slate-500 text-xs uppercase tracking-[0.5em] font-light">Digital Forensic Logic Vault v5.0</p>
      </header>

      {/* Main Security Panel */}
      <main class="w-full max-w-5xl glass-panel rounded-2xl overflow-hidden relative group">
        <div class="scanning-line opacity-20 pointer-events-none"></div>
        
        {/* Top Info Bar */}
        <div class="bg-slate-950/60 p-5 px-8 border-b border-slate-700/50 flex justify-between items-center">
          <div class="flex flex-col">
            <span class="text-neon uppercase text-[10px] font-bold tracking-widest">Live Data Stream</span>
            <span class="text-slate-500 text-[10px] font-mono uppercase tracking-tighter">Encrypted Hardware Session via COM9</span>
          </div>
          <div class="text-right">
             <span class="text-slate-400 text-[10px] font-mono">Last Sync: {data().lastSeen}</span>
          </div>
        </div>

        {/* Data Grid Section */}
        <div class="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-700/30">
          <div class="flex flex-col gap-2">
            <label class="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Active Service</label>
            <div class="text-2xl font-bold text-white tracking-tight">{data().service}</div>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Hardware Nonce</label>
            <div class="text-sm font-mono text-blue-400 bg-blue-500/5 p-2 rounded border border-blue-500/20">{data().nonce}</div>
          </div>

          <div class="flex flex-col gap-2 overflow-hidden">
            <label class="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Encryption Hash</label>
            <div class="text-sm font-mono text-red-400 bg-red-500/5 p-2 rounded border border-red-500/20 truncate">{data().encrypted}</div>
          </div>
        </div>

        {/* The Reveal Section */}
        <div class="p-10 bg-slate-950/40 relative">
          <div class="flex items-center justify-between mb-6">
             <h3 class="text-xs text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2">
               <span class="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
               Decrypted Output Buffer
             </h3>
             <span class={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all duration-500 ${data().decrypted.includes("LOCKED")
                ? "bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                : "bg-neon/10 text-neon border-neon/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
             }`}>
               {data().decrypted.includes("LOCKED") ? "Secure Locked" : "Credential Verified"}
             </span>
          </div>

          <div class={`min-h-[120px] flex items-center justify-center rounded-xl border-2 transition-all duration-700 ${data().decrypted.includes("LOCKED")
            ? "bg-red-950/10 border-red-500/20 text-red-500/40"
            : "bg-green-950/20 border-neon/50 text-neon shadow-[0_0_30px_rgba(34,197,94,0.15)] scale-[1.02]"
            }`}>
            <div class={`text-4xl md:text-5xl font-bold tracking-widest transition-all duration-500 ${data().decrypted.includes("LOCKED") ? "blur-[2px] opacity-40" : "blur-0 opacity-100"}`}>
               {data().decrypted}
            </div>
          </div>
          
          <div class="mt-6 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase">
             <span>Authorization Level: Restricted</span>
             <span>Hardware Key Detected: Shrike Lite</span>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer class="mt-12 flex flex-col items-center gap-2">
        <div class="h-[1px] w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-4"></div>
        <p class="text-slate-600 text-[10px] uppercase font-bold tracking-[0.4em]">HP Forensic Technology</p>
        <p class="text-slate-700 text-[9px] font-light">PROPRIETARY SECURE ENVIRONMENT // DO NOT EXPOSE</p>
      </footer>
    </div>
  );
}

export default App;