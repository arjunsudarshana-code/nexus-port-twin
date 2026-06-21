'use client';

import { useEffect, useState } from 'react';

interface HUDProps {
  isNightMode: boolean;
  onToggleNightMode: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedContainer: any; 
  onClearSelection: () => void; 
  isHeatmapMode: boolean; // 🚀 [NEW]
  onToggleHeatmap: () => void; // 🚀 [NEW]
}

export default function HUD({ 
  isNightMode, 
  onToggleNightMode, 
  searchQuery, 
  onSearchChange,
  selectedContainer,
  onClearSelection,
  isHeatmapMode,
  onToggleHeatmap
}: HUDProps) {
  const [teuPerHour, setTeuPerHour] = useState(42.5);
  const [yardDensity, setYardDensity] = useState(68);
  const [agvBattery, setAgvBattery] = useState(94);
  const [energyUsage, setEnergyUsage] = useState(94.2);
  const [operationalAlert, setOperationalAlert] = useState('SYSTEMS OPERATIONAL');
  const [sensorBars, setSensorBars] = useState([40, 70, 45, 90, 30, 85, 60, 75, 50, 95, 40, 65, 55, 80]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTeuPerHour((prev) => +(prev + (Math.random() * 2 - 1)).toFixed(1));
      setEnergyUsage((prev) => +(prev + (Math.random() * 1.5 - 0.75)).toFixed(1));
      setAgvBattery((prev) => (prev > 15 ? prev - 1 : 100));
      
      setYardDensity((prev) => {
        const next = prev + (Math.random() > 0.5 ? 1 : -1);
        return next > 100 ? 100 : next < 0 ? 0 : next;
      });

      const randomTrigger = Math.random();
      if (randomTrigger > 0.85) {
        setOperationalAlert('CRANE ALPHA: HANDLING HEAVY TEU');
      } else if (randomTrigger > 0.70) {
        setOperationalAlert('AGV FLEET: OPTIMIZING ROUTE LANES');
      } else if (randomTrigger < 0.15) {
        setOperationalAlert('SYSTEMS OPERATIONAL');
      }
    }, 3000);

    const animationInterval = setInterval(() => {
      setSensorBars((prevBars) => 
        prevBars.map((h) => {
          const fluctuation = Math.floor(Math.random() * 30) - 15; 
          let nextHeight = h + fluctuation;
          if (nextHeight > 100) nextHeight = 90;
          if (nextHeight < 15) nextHeight = 25;
          return nextHeight;
        })
      );
    }, 200);

    return () => {
      clearInterval(interval);
      clearInterval(animationInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-40 font-mono flex flex-col justify-between p-6">
      
      {/* 🔝 TOP PANEL */}
      <div className="flex justify-between items-start w-full">
        {/* Left Column Stack */}
        <div className="flex flex-col gap-3">
          {/* Active Operational Log */}
          <div className="backdrop-blur-md bg-slate-950/75 px-4 py-2 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col gap-1 w-72">
            <div className="flex items-center gap-2 border-b border-white/10 pb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-xs text-white/50 tracking-wider">LIVE TELEMETRY LOG</span>
            </div>
            <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${operationalAlert.includes('OPERATIONAL') ? 'text-emerald-400' : 'text-amber-400'}`}>
              ⚡ {operationalAlert}
            </span>
          </div>

          {/* CONTAINER LOCATOR SYSTEM */}
          <div className="backdrop-blur-md bg-slate-950/80 p-4 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col gap-2 w-72 pointer-events-auto">
            <span className="text-[10px] font-extrabold text-cyan-400 tracking-widest uppercase">🔍 CONTAINER LOCATOR SYSTEM</span>
            <div className="relative flex items-center">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ENTER CONTAINER ID..."
                className="w-full bg-slate-900/90 border border-cyan-500/40 focus:border-cyan-400 rounded-lg px-3 py-2 text-white placeholder-white/30 text-[10px] tracking-widest outline-none transition-all duration-300 font-bold"
              />
              {searchQuery && (
                <button onClick={() => onSearchChange('')} className="absolute right-2 text-xs text-white/40 hover:text-rose-400 transition-colors cursor-pointer">✕</button>
              )}
            </div>
          </div>

          {/* ENGINE RENDER METRICS CARD */}
          <div className="backdrop-blur-md bg-slate-950/60 text-left px-4 py-2 rounded-xl border border-white/10 text-[10px] text-white/40 flex flex-col gap-0.5 w-72">
            <div>LIVE RENDERING ENGINE: <span className="text-emerald-400 font-sans font-bold">60 FPS</span></div>
            <div>SERVER LATENCY: <span className="text-cyan-400 font-sans font-bold">12ms // DELTA_STREAM</span></div>
          </div>

          {/* ENVIRONMENT DAY/NIGHT TOGGLE BUTTON */}
          <button 
            onClick={onToggleNightMode}
            className="pointer-events-auto cursor-pointer backdrop-blur-md bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 text-[10px] text-white font-bold px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center justify-between gap-3 w-72 transition-all duration-300 active:scale-95 group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs group-hover:animate-spin">{isNightMode ? '🌙' : '☀️'}</span>
              <span className="tracking-widest uppercase">ENVIRONMENT VIEW</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${isNightMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40' : 'bg-amber-500/20 text-amber-400 border border-amber-400/40'}`}>
              {isNightMode ? 'NIGHT MODE' : 'DAY MODE'}
            </span>
          </button>

          {/* ========================================================================= */}
          {/* 🔥 🚀 [NEW] Real-Time 3D Operational Heatmap Toggle Action Button 🚀 🔥 */}
          {/* ========================================================================= */}
          <button 
            onClick={onToggleHeatmap}
            className={`pointer-events-auto cursor-pointer backdrop-blur-md text-[10px] text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 w-72 transition-all duration-300 active:scale-95 shadow-[0_0_25px_rgba(239,68,68,0.15)] border group ${
              isHeatmapMode 
                ? 'bg-rose-950/90 border-rose-500 text-rose-200' 
                : 'bg-slate-950/80 hover:bg-slate-900 border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isHeatmapMode ? 'animate-pulse' : 'group-hover:animate-bounce'}`}>🔥</span>
              <span className="tracking-widest uppercase">YARD CAPACITY HEATMAP</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all duration-300 ${
              isHeatmapMode 
                ? 'bg-rose-500/30 text-rose-400 border border-rose-400/50 animate-pulse' 
                : 'bg-slate-800 text-white/50 border border-white/10'
            }`}>
              {isHeatmapMode ? 'ACTIVE // 3D' : 'DISABLED'}
            </span>
          </button>
        </div>

        <div></div>
      </div>

      {/* 📊 MAIN HUD BODY LAYER */}
      <div className="flex justify-between items-end w-full my-auto h-[55%]">
        <div className="flex flex-col gap-3 pointer-events-auto">
          {/* PERFORMANCE CORE CARD */}
          <div className="backdrop-blur-lg bg-slate-950/80 p-4 rounded-2xl border border-white/10 w-72 flex flex-col gap-3 shadow-2xl">
            <span className="text-xs font-extrabold text-white border-b border-white/10 pb-1.5 tracking-widest">⚙️ PERFORMANCE CORE</span>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-white/50 uppercase">Throughput Rate</span>
                <span className="text-cyan-400 font-bold font-sans text-xs">{teuPerHour} TEU/h</span>
              </div>
              <svg viewBox="0 0 100 20" className="w-full h-8 text-cyan-400 stroke-current fill-none mt-1">
                <path strokeWidth="1.5" strokeLinecap="round" d="M0,15 Q15,5 30,12 T60,4 T90,14 T100,8" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-white/50 uppercase">Yard Capacity Density</span>
                <span className="text-amber-400 font-bold font-sans text-xs">{yardDensity}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${yardDensity}%` }}></div>
              </div>
            </div>
          </div>

          {/* FLEET ANALYTICS CARD */}
          <div className="backdrop-blur-lg bg-slate-950/80 p-4 rounded-2xl border border-white/10 w-72 flex flex-col gap-3 shadow-2xl">
            <span className="text-xs font-extrabold text-white border-b border-white/10 pb-1.5 tracking-widest">🤖 FLEET ANALYTICS</span>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-white/50 uppercase">AGV Fleet Battery Avg</span>
                <span className="text-emerald-400 font-bold font-sans text-xs">{agvBattery}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${agvBattery}%` }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-white/50 uppercase">Routing Congestion Risk</span>
                <span className="text-rose-400 font-bold font-sans text-xs">LOW // 0.04%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-72"></div>
      </div>

      {/* ⬇️ BOTTOM PANEL */}
      <div className="flex justify-between items-center w-full backdrop-blur-md bg-slate-950/50 border border-white/10 px-4 py-2 rounded-xl text-[10px]">
        <div className="text-white/50">SYSTEM ID: <span className="text-white font-bold">NEXUS-TWIN-v1.0</span></div>
        <div className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span>⚡ GRID ENERGY CONSUMPTION:</span>
          <span className="text-white font-sans font-extrabold text-xs">{energyUsage} kw/h</span>
        </div>
      </div>

      {/* PREMIUM RIGHT SIDE SLIDING DRAWER */}
      <div className={`fixed top-0 right-0 h-screen w-80 backdrop-blur-xl bg-slate-950/90 border-l-2 border-amber-500/40 p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out z-50 flex flex-col gap-5 pointer-events-auto ${
        selectedContainer ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        {selectedContainer && (
          <>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mt-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-400 font-bold tracking-widest animate-pulse">⚡ X-RAY TELEMETRY</span>
                <span className="text-lg text-white font-sans font-extrabold tracking-wide">{selectedContainer.id}</span>
              </div>
              <button 
                onClick={onClearSelection}
                className="bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 text-[10px] px-3 py-1.5 rounded-lg border border-white/10 transition-all cursor-pointer font-bold"
              >
                CLOSE ✕
              </button>
            </div>

            <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[8px] text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                LIVE SENSOR FREQUENCY STATUS
              </span>
              <div className="h-10 flex items-end gap-1 pt-2">
                {sensorBars.map((h, i) => (
                  <span 
                    key={i} 
                    className="bg-gradient-to-t from-amber-500 to-amber-300 w-full rounded-t-sm transition-all duration-200 ease-in-out shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                    style={{ height: `${h}%` }}
                  ></span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs mt-2">
              <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                <span className="text-white/40 text-[9px] uppercase tracking-wider">📦 CARGO TYPE</span>
                <span className="text-cyan-400 font-bold text-sm">{selectedContainer.content}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                <span className="text-white/40 text-[9px] uppercase tracking-wider">⚖️ NET WEIGHT</span>
                <span className="text-amber-400 font-sans font-extrabold text-sm">{selectedContainer.weight}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                <span className="text-white/40 text-[9px] uppercase tracking-wider">📍 FINAL DESTINATION</span>
                <span className="text-white font-bold text-sm">{selectedContainer.destination}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
                <span className="text-white/40 text-[9px] uppercase tracking-wider">🚦 STOWAGE STATUS</span>
                <span className="text-emerald-400 font-bold tracking-wider text-xs">{selectedContainer.status}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-white/40 text-[9px] uppercase tracking-wider">🌐 YARD GRID COORDS</span>
                <span className="text-white/80 text-[10px] bg-slate-900/90 px-3 py-2 rounded-xl mt-1 border border-white/5 shadow-inner">
                  {selectedContainer.bayCoordinates}
                </span>
              </div>
            </div>
            
            <div className="mt-auto border-t border-white/10 pt-3 text-[8px] text-white/30 flex justify-between">
              <span>SECURE NODE // IOT-CONN</span>
              <span>v1.0.4</span>
            </div>
          </>
        )}
      </div>

    </div>
  );
}