'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei'; // 🚀 3D Floating Spatial UI එක සඳහා Drei Html Component එක
import * as THREE from 'three';

interface CraneProps {
  position: [number, number, number];
  offset: number;
  containerColors: string[];
  craneId: string; // ක්‍රේන් අංකය පෙන්වීමට
}

const YARD_SLOTS = [
  { x: -1.4, z: 5.5 },  
  { x: 1.4, z: 5.5 },   
  { x: -1.4, z: 12.5 }, 
];

const SHIP_SLOTS = [
  { x: -1.4, z: 24.0 }, 
  { x: 1.4, z: 24.0 },  
  { x: -1.4, z: 31.0 }, 
];

const YARD_Y = 1.7; 
const SHIP_Y = 1.7; 

function IndustrialCrane({ position, offset, containerColors, craneId }: CraneProps) {
  const trolleyRef = useRef<THREE.Group>(null);
  const hookGroupRef = useRef<THREE.Group>(null); 
  const cableRef = useRef<THREE.Mesh>(null);
  const craneContainerRef = useRef<THREE.Mesh>(null);
  const craneMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const staticShipBoxesRef = useRef<THREE.Mesh[]>([]);
  const staticYardBoxesRef = useRef<THREE.Mesh[]>([]);

  // 🚀 Live Spatial UI එක පාලනය කරන States
  const [status, setStatus] = useState('RETURNING');
  const [efficiency, setEfficiency] = useState(90);
  const lastPhaseRef = useRef<number>(-1);

  useFrame((state) => {
    if (
      !trolleyRef.current || !hookGroupRef.current || !cableRef.current || 
      !craneContainerRef.current || !craneMatRef.current
    ) return;

    const t = (state.clock.getElapsedTime() + offset) * 0.28;
    const phase = t % 4; 
    const currentIdx = Math.floor(t / 4) % 3; 

    const lastYardSlot = YARD_SLOTS[(currentIdx === 0 ? 2 : currentIdx - 1)];
    const targetShipSlot = SHIP_SLOTS[currentIdx];
    const targetYardSlot = YARD_SLOTS[currentIdx];

    let currentX = lastYardSlot.x;
    let currentZ = lastYardSlot.z;
    let currentY = 0; 
    let showCraneBox = false;

    const shipVisibility = [true, true, true];
    const yardVisibility = [false, false, false];

    for (let i = 0; i < currentIdx; i++) yardVisibility[i] = true;
    for (let i = 0; i < currentIdx; i++) shipVisibility[i] = false;

    craneMatRef.current.color.set(containerColors[currentIdx]);

    // 🚀 Performance-Safe UI Status Dispatcher
    const currentPhaseInt = Math.floor(phase);
    if (currentPhaseInt !== lastPhaseRef.current) {
      lastPhaseRef.current = currentPhaseInt;
      
      if (currentPhaseInt === 0) setStatus('FETCHING CARGO');
      if (currentPhaseInt === 1) setStatus('LIFTING FROM SHIP');
      if (currentPhaseInt === 2) setStatus('TRANSITING TO YARD');
      if (currentPhaseInt === 3) setStatus('STACKING ROW ' + (currentIdx + 1));
      
      setEfficiency(Math.floor(92 + Math.sin(t) * 5));
    }

    // 4-Phase Gantry Engine
    if (phase < 1) {
      const p = phase;
      const ease = (1 - Math.cos(p * Math.PI)) / 2; 
      currentZ = lastYardSlot.z + ease * (targetShipSlot.z - lastYardSlot.z);
      currentX = lastYardSlot.x + ease * (targetShipSlot.x - lastYardSlot.x);
      currentY = 0;
      showCraneBox = false;
      shipVisibility[currentIdx] = true;
      yardVisibility[currentIdx] = false;
    } 
    else if (phase < 2) {
      const p = phase - 1;
      currentZ = targetShipSlot.z;
      currentX = targetShipSlot.x;
      currentY = Math.sin(p * Math.PI) * -19.1; 
      
      if (p < 0.5) {
        showCraneBox = false;
        shipVisibility[currentIdx] = true;
      } else {
        showCraneBox = true;
        shipVisibility[currentIdx] = false;
      }
      yardVisibility[currentIdx] = false;
    } 
    else if (phase < 3) {
      const p = phase - 2;
      const ease = (1 - Math.cos(p * Math.PI)) / 2;
      currentZ = targetShipSlot.z + ease * (targetYardSlot.z - targetShipSlot.z);
      currentX = targetShipSlot.x + ease * (targetYardSlot.x - targetShipSlot.x);
      currentY = 0;
      showCraneBox = true;
      shipVisibility[currentIdx] = false;
      yardVisibility[currentIdx] = false;
    } 
    else {
      const p = phase - 3;
      currentZ = targetYardSlot.z;
      currentX = targetYardSlot.x;
      currentY = Math.sin(p * Math.PI) * -19.1;
      
      if (p < 0.5) {
        showCraneBox = true;
        yardVisibility[currentIdx] = false;
      } else {
        showCraneBox = false;
        yardVisibility[currentIdx] = true; 
      }
      shipVisibility[currentIdx] = false;
    }

    trolleyRef.current.position.z = currentZ;
    trolleyRef.current.position.x = currentX;
    hookGroupRef.current.position.y = currentY;

    const cableLength = Math.abs(currentY);
    if (cableLength > 0.1) {
      cableRef.current.scale.y = cableLength;
      cableRef.current.position.y = currentY / 2;
      cableRef.current.visible = true;
    } else {
      cableRef.current.visible = false;
    }

    craneContainerRef.current.visible = showCraneBox;

    for (let i = 0; i < 3; i++) {
      if (staticShipBoxesRef.current[i]) staticShipBoxesRef.current[i].visible = shipVisibility[i];
      if (staticYardBoxesRef.current[i]) staticYardBoxesRef.current[i].visible = yardVisibility[i];
    }
  });

  return (
    <group position={position}>
      
      {/* 🚀 🔘 Premium Floating Spatial UI (Hologram Card) */}
      <Html 
        position={[0, 27.5, 0]} 
        center 
        distanceFactor={38} 
        className="pointer-events-none select-none transition-all duration-500"
      >
        <div 
          className="backdrop-blur-md bg-slate-950/75 px-3 py-2 rounded-xl border font-mono text-[10px] shadow-2xl flex flex-col gap-1 w-44"
          style={{ borderColor: `${containerColors[0]}aa` }} 
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-1">
            <span className="font-extrabold text-white tracking-widest uppercase">🏗️ {craneId}</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: containerColors[0] }}></span>
              <span className="text-[9px] text-white/50">SYS ACTIVE</span>
            </div>
          </div>
          <div className="flex flex-col mt-0.5">
            <span className="text-white/40 text-[8px] uppercase tracking-wider">Current Task</span>
            <span className="text-cyan-400 font-bold tracking-wide truncate">
              {status}
            </span>
          </div>
          <div className="flex flex-col mt-0.5">
            <div className="flex justify-between items-center text-[8px] text-white/40 uppercase">
              <span>OP Efficiency</span>
              <span className="text-emerald-400 font-bold font-sans">{efficiency}%</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-0.5">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${efficiency}%` }}></div>
            </div>
          </div>
        </div>
      </Html>

      {/* 🗼 Vertical Gantry Columns (මුල් කෝඩ් එකේ තිබ්බ පර්ෆෙක්ට් කණු දෙක) */}
      <mesh position={[-3.5, 12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 24, 1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[3.5, 12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 24, 1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 🏗️ Horizontal Main Boom */}
      <mesh position={[0, 23, 12]} castShadow>
        <boxGeometry args={[3.8, 1.2, 36]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 🟡 Cyber Yellow Neon Strip */}
      <mesh position={[0, 23.7, 12]}>
        <boxGeometry args={[0.15, 0.15, 34]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={6} />
      </mesh>

      {/* 🎛️ Moving Trolley System */}
      <group ref={trolleyRef} position={[0, 22.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.8, 0.5, 3.5]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.4} roughness={0.4} />
        </mesh>
        <spotLight position={[0, -0.5, 0]} angle={0.4} penumbra={0.7} intensity={800} distance={60} color="#ffffff" castShadow />
        
        <mesh ref={cableRef}>
          <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
        </mesh>

        <group ref={hookGroupRef}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[2.5, 0.4, 5.5]} />
            <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh ref={craneContainerRef} position={[0, -1.4, 0]} castShadow>
            <boxGeometry args={[2.4, 2.4, 5.4]} />
            <meshStandardMaterial ref={craneMatRef} roughness={0.4} metalness={0.3} flatShading />
          </mesh>
        </group>
      </group>

      {/* 🚢 Static Ship Boxes Array */}
      {SHIP_SLOTS.map((slot, i) => (
        <mesh key={`ship-box-${i}`} ref={(el) => { if (el) staticShipBoxesRef.current[i] = el; }} position={[slot.x, SHIP_Y, slot.z]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 2.4, 5.4]} />
          <meshStandardMaterial color={containerColors[i]} roughness={0.4} metalness={0.3} flatShading />
        </mesh>
      ))}

      {/* 🏭 Static Yard Boxes Array */}
      {YARD_SLOTS.map((slot, i) => (
        <mesh key={`yard-box-${i}`} ref={(el) => { if (el) staticYardBoxesRef.current[i] = el; }} position={[slot.x, YARD_Y, slot.z]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 2.4, 5.4]} />
          <meshStandardMaterial color={containerColors[i]} roughness={0.4} metalness={0.3} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export default function PortCranes() {
  // =========================================================================
  // 🛠️ ක්‍රේන් 5 පිහිටන ස්ථාන (Cranes Positions Array) 🛠️
  // =========================================================================
  // 🚀 [FIXED] වම් පස පාර තියෙන්නේ X = -60 සීමාවේ නිසා, CRANE ALPHA එක පාරෙන් දකුණට/ඇතුළට 
  // ගන්න එහි පළමු අගය -60 සිට -52 දක්වා මම වෙනස් කළා මචන්. 
  // ඉස්සරහට තව තල්ලු කරන්න ඕනෙ නම් -52 අගය -50 හෝ -48 කරලා ඔයාටම ලේසියෙන්ම වෙනස් කරගන්න පුළුවන් බ්‍රෝ!
  const cranesConfig = [
    { id: 1, name: 'CRANE ALPHA', pos: [-52, 0, 18] as [number, number, number], offset: 0.0, colors: ['#0284c7', '#f97316', '#10b981'] }, // 👈 මෙන්න මෙතන -60 තිබ්බ එක -52 කරා!
    { id: 2, name: 'CRANE BRAVO', pos: [-30, 0, 18] as [number, number, number], offset: 1.5, colors: ['#ef4444', '#3b82f6', '#eab308'] }, 
    { id: 3, name: 'CRANE CHARLIE', pos: [0, 0, 18] as [number, number, number], offset: 3.0, colors: ['#22c55e', '#a855f7', '#f43f5e'] },   
    { id: 4, name: 'CRANE DELTA', pos: [30, 0, 18] as [number, number, number], offset: 0.8, colors: ['#eab308', '#06b6d4', '#dc2626'] },   
    { id: 5, name: 'CRANE ECHO', pos: [60, 0, 18] as [number, number, number], offset: 2.2, colors: ['#a855f7', '#3b82f6', '#f97316'] },   
  ];

  return (
    <group>
      {cranesConfig.map((crane) => (
        <IndustrialCrane 
          key={crane.id} 
          craneId={crane.name} 
          position={crane.pos} 
          offset={crane.offset} 
          containerColors={crane.colors} 
        />
      ))}
    </group>
  );
}