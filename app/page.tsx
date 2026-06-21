'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import HUD from '../src/components/ui/HUD';

// SSR බෑන්ඩ් කරලා 3D කැන්වස් එක ස්මූත් කරා
const Scene = dynamic(() => import('../src/components/3d/Scene'), {
  ssr: false,
  loading: () => {
    return (
      <div className="flex items-center justify-center w-full h-[100dvh] bg-slate-950 font-mono text-cyan-400">
        <div className="animate-pulse tracking-widest">INITIALIZING DIGITAL TWIN ENGINE...</div>
      </div>
    );
  }
});

export default function Home() {
  const [isNightMode, setIsNightMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);

  return (
    // 🚀 [RESPONSIVE FIX] h-screen වෙනුවට h-[100dvh] දමා මුළු UI එකම සෙලවීම නැවැත්තුවා මචන්
    <main className="relative w-full h-[100dvh] overflow-hidden select-none">
      {/* 3D Core Layer */}
      <Scene 
        isNightMode={isNightMode} 
        searchQuery={searchQuery} 
        onSelectContainer={setSelectedContainer}
        selectedContainer={selectedContainer}
        isHeatmapMode={isHeatmapMode}
      />

      {/* 2D HUD UI Layer */}
      <HUD 
        isNightMode={isNightMode} 
        onToggleNightMode={() => setIsNightMode(!isNightMode)} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedContainer={selectedContainer}
        onClearSelection={() => setSelectedContainer(null)}
        isHeatmapMode={isHeatmapMode}
        onToggleHeatmap={() => setIsHeatmapMode(!isHeatmapMode)}
      />
    </main>
  );
}