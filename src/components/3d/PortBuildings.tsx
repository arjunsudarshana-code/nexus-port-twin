'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

let cachedWindowTex: THREE.CanvasTexture | null = null;
let cachedGlowTex: THREE.CanvasTexture | null = null;
let cachedLandTex: THREE.CanvasTexture | null = null;
let cachedLandGlowTex: THREE.CanvasTexture | null = null;

function initTextures() {
  if (typeof window === 'undefined' || cachedWindowTex) return;

  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#cbd5e1'; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#1e293b'; 
    for (let y = 12; y < 256; y += 24) {
      for (let x = 12; x < 256; x += 20) ctx.fillRect(x, y, 10, 14);
    }
  }
  cachedWindowTex = new THREE.CanvasTexture(canvas);
  cachedWindowTex.wrapS = THREE.RepeatWrapping;
  cachedWindowTex.wrapT = THREE.RepeatWrapping;
  cachedWindowTex.minFilter = THREE.NearestFilter; 

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 256; glowCanvas.height = 256;
  const gCtx = glowCanvas.getContext('2d');
  if (gCtx) {
    gCtx.fillStyle = '#000000'; gCtx.fillRect(0, 0, 256, 256);
    const windowLights = ['#fef08a', '#bae6fd', '#fed7aa', '#ffffff']; 
    for (let y = 12; y < 256; y += 24) {
      for (let x = 12; x < 256; x += 20) {
        if (Math.sin(x * 0.05 + y * 0.08) * Math.cos(y * 0.1) > -0.2) {
          gCtx.fillStyle = windowLights[Math.floor((x + y) % windowLights.length)];
          gCtx.fillRect(x, y, 10, 14);
        }
      }
    }
  }
  cachedGlowTex = new THREE.CanvasTexture(glowCanvas);
  cachedGlowTex.wrapS = THREE.RepeatWrapping;
  cachedGlowTex.wrapT = THREE.RepeatWrapping;
  cachedGlowTex.minFilter = THREE.NearestFilter;

  const landCanvas = document.createElement('canvas');
  landCanvas.width = 512; landCanvas.height = 512;
  const lCtx = landCanvas.getContext('2d');
  if (lCtx) {
    lCtx.fillStyle = '#1e293b'; lCtx.fillRect(0, 0, 512, 512);
    lCtx.fillStyle = '#0f172a'; 
    for (let i = 0; i < 512; i += 64) {
      lCtx.fillRect(i, 0, 12, 512); lCtx.fillRect(0, i, 512, 12); 
    }
  }
  cachedLandTex = new THREE.CanvasTexture(landCanvas);
  cachedLandTex.wrapS = THREE.RepeatWrapping;
  cachedLandTex.wrapT = THREE.RepeatWrapping;
  cachedLandTex.repeat.set(12, 35);

  const landGlowCanvas = document.createElement('canvas');
  landGlowCanvas.width = 512; landGlowCanvas.height = 512;
  const lgCtx = landGlowCanvas.getContext('2d');
  if (lgCtx) {
    lgCtx.fillStyle = '#000000'; lgCtx.fillRect(0, 0, 512, 512);
    lgCtx.fillStyle = '#fef08a';
    for (let i = 6; i < 512; i += 64) {
      for (let j = 0; j < 512; j += 24) {
        lgCtx.fillRect(i, j, 2, 2); lgCtx.fillRect(j, i, 2, 2); 
      }
    }
  }
  cachedLandGlowTex = new THREE.CanvasTexture(landGlowCanvas);
  cachedLandGlowTex.wrapS = THREE.RepeatWrapping;
  cachedLandGlowTex.wrapT = THREE.RepeatWrapping;
  cachedLandGlowTex.repeat.set(12, 35);
}

interface PortBuildingsProps {
  isNightMode: boolean;
}

export default function PortBuildings({ isNightMode }: PortBuildingsProps) {
  const intensityRef = useRef(0);
  initTextures(); 

  useFrame((state, delta) => {
    // 🚀 [VIBRANT LIGHTING CONTROL] රෑ මෝඩ් එකේදි ලයිට්ස් පට්ට ෂාප් එකට මතු වෙන්න බ්‍රයිට්නස් 3.8ක් දුන්නා බ්‍රෝ
    const target = isNightMode ? 3.8 : 0;
    intensityRef.current = THREE.MathUtils.lerp(intensityRef.current, target, delta * 4);
  });

  const buildings = useMemo(() => [
    { pos: [110, 15, -120], size: [14, 30, 14], type: 'hq', color: '#1e293b' },
    { pos: [125, 20, -80], size: [12, 40, 12], type: 'hq', color: '#0f172a' },
    { pos: [115, 12, -40], size: [16, 24, 16], type: 'hq', color: '#1e293b' },
    { pos: [115, 6, 10], size: [22, 12, 35], type: 'warehouse', color: '#334155' },
    { pos: [115, 6, 60], size: [22, 12, 35], type: 'warehouse', color: '#1e293b' },
    { pos: [115, 6, 110], size: [22, 12, 35], type: 'warehouse', color: '#475569' },
    { pos: [105, 8, 160], size: [14, 16, 20], type: 'office', color: '#0f172a' },
    { pos: [105, 8, 200], size: [14, 16, 20], type: 'office', color: '#334155' },
  ], []);

  const mainlandCity = useMemo(() => {
    const cityBlocks = [];
    const archColors = ['#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#a8a29e', '#e7e5e4'];
    for(let i = 0; i < 200; i++) {
       const x = 260 + Math.random() * 490;
       const z = -800 + Math.random() * 1600;
       let w = 18 + Math.random() * 22;
       let d = 18 + Math.random() * 22;
       const h = (Math.sqrt(Math.abs(x - 330)) < 180 ? 65 : 14) + Math.random() * 40;
       const color = archColors[Math.floor(Math.random() * archColors.length)];
       cityBlocks.push({ x, z, w, d, h, color });
    }
    return cityBlocks;
  }, []);

  const [sharedFloorSlabGeo, sharedColumnGeo, sharedBeaconGeo, sharedRadarPoleGeo, sharedRadarDishGeo] = useMemo(() => [
    new THREE.BoxGeometry(1, 0.2, 1),       
    new THREE.BoxGeometry(0.6, 1, 0.6),     
    new THREE.SphereGeometry(0.3, 8, 8),    
    new THREE.CylinderGeometry(0.15, 0.3, 2, 12), 
    new THREE.BoxGeometry(5, 0.4, 0.2)      
  ], []);

  const radarRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();
    radarRefs.current.forEach((ref, idx) => {
      if (ref) ref.rotation.y = elapsedTime * (1.2 + idx * 0.4);
    });
  });

  return (
    <group>
      {/* 🚧 වරායේ ප්‍රධාන ගොඩබිම */}
      <mesh position={[115, -4.4, 0]} receiveShadow>
        <boxGeometry args={[70, 10, 500]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.15} />
      </mesh>

      {/* 🏝️ නගරයේ පසුබිම් බිම සහ එහි ලයිට්ස් */}
      <mesh position={[450, -4.4, 0]} receiveShadow>
        <boxGeometry args={[600, 10, 2000]} />
        <meshStandardMaterial 
          map={cachedLandTex} 
          roughness={0.85} metalness={0.2}
          emissiveMap={cachedLandGlowTex}
          emissive={'#fef08a'}
          emissiveIntensity={isNightMode ? 1.8 : 0} 
        />
      </mesh>

      {/* 🏙️ PROCEDURAL BACKDROP CITY LAYER */}
      <group>
        {mainlandCity.map((b, i) => {
          const uRepeat = Math.max(2, Math.floor(b.w / 5));
          const vRepeat = Math.max(4, Math.floor(b.h / 4));

          return (
            <mesh key={`city-${i}`} position={[b.x, (b.h / 2) + 0.6, b.z]} castShadow receiveShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial 
                // 🚀 [PRO REALISM LIGHTING] රෑට බිල්ඩින් කට්ට කළු නොවී ලස්සන අඳුරු නිල් පැහැයක් ගනී
                color={isNightMode ? '#1e293b' : b.color} 
                roughness={0.3}
                metalness={0.5}
                map={cachedWindowTex}
                bumpMap={cachedWindowTex}
                bumpScale={0.015}
                emissiveMap={cachedGlowTex}
                emissive={'#ffffff'}
                emissiveIntensity={intensityRef.current} 
                onUpdate={(self) => {
                  if (self.map && self.map.repeat.x !== uRepeat) self.map.repeat.set(uRepeat, vRepeat);
                  if (self.emissiveMap && self.emissiveMap.repeat.x !== uRepeat) self.emissiveMap.repeat.set(uRepeat, vRepeat);
                }}
              />
            </mesh>
          );
        })}
      </group>

      {/* 🏭 වරායේ ඔරිජිනල් ගොඩනැගිලි 8 */}
      {buildings.map((b, i) => {
        const width = b.size[0]; const height = b.size[1]; const depth = b.size[2];
        const floorHeight = 3.5; const totalFloors = Math.floor(height / floorHeight);

        return (
          <group key={i} position={b.pos as [number, number, number]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={b.color} roughness={0.5} metalness={0.5} />
            </mesh>

            {(b.type === 'hq' || b.type === 'office') && (
              <group>
                <mesh>
                  <boxGeometry args={[width + 0.1, height - 0.2, depth + 0.1]} />
                  <meshStandardMaterial 
                    color="#00f5d4" emissive="#00f5d4" emissiveIntensity={b.type === 'hq' ? 0.25 : 0.15} 
                    transparent opacity={0.4} roughness={0.05} metalness={0.95} 
                  />
                </mesh>
                {Array.from({ length: totalFloors }).map((_, fIdx) => {
                  const slabY = (fIdx * floorHeight) - (height / 2) + 0.1;
                  return (
                    <mesh key={fIdx} geometry={sharedFloorSlabGeo} position={[0, slabY, 0]} scale={[width + 0.15, 1, depth + 0.15]}>
                      <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
                    </mesh>
                  );
                })}
                {[-0.5, 0.5].map((xSign, xi) => 
                  [-0.5, 0.5].map((zSign, zi) => (
                    <mesh key={`${xi}-${zi}`} geometry={sharedColumnGeo} position={[xSign * width, 0, zSign * depth]} scale={[1, height + 0.2, 1]}>
                      <meshStandardMaterial color="#64748b" roughness={0.4} />
                    </mesh>
                  ))
                )}
                <mesh>
                  <boxGeometry args={[width + 0.2, height + 0.2, depth + 0.2]} />
                  <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={0.8} wireframe transparent opacity={0.3} />
                </mesh>
              </group>
            )}

            {b.type === 'warehouse' && (
              <group>
                <mesh position={[-width / 4, height / 2 + 1.2, 0]} rotation={[0, 0, 0.22]} castShadow>
                  <boxGeometry args={[width / 2 + 0.5, 0.4, depth + 0.2]} />
                  <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
                </mesh>
                <mesh position={[width / 4, height / 2 + 1.2, 0]} rotation={[0, 0, -0.22]} castShadow>
                  <boxGeometry args={[width / 2 + 0.5, 0.4, depth + 0.2]} />
                  <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
                </mesh>
                {[-10, 0, 10].map((zOffset, dIdx) => (
                  <mesh key={dIdx} position={[-width / 2 - 0.05, -height / 2 + 2, zOffset]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[6, 3.8, 0.1]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.8} />
                  </mesh>
                ))}
              </group>
            )}

            <mesh geometry={sharedBeaconGeo} position={[0, height / 2 + 0.2, 0]}>
              <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={4} />
            </mesh>

            {b.type === 'hq' && (
              <group position={[0, height / 2 + 1, 0]}>
                <mesh geometry={sharedRadarPoleGeo} castShadow>
                  <meshStandardMaterial color="#475569" metalness={0.8} />
                </mesh>
                <mesh ref={(el) => { if (el) radarRefs.current[i] = el; }} geometry={sharedRadarDishGeo} position={[0, 1.1, 0]} castShadow>
                  <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}