'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function PortBuildings() {
  // 🏢 ගොඩනැගිලිවල පිහිටීම් දත්ත
  const buildings = useMemo(() => {
    return [
      { pos: [110, 15, -120], size: [14, 30, 14], type: 'hq', color: '#111827' },
      { pos: [125, 20, -80], size: [12, 40, 12], type: 'hq', color: '#030712' },
      { pos: [115, 12, -40], size: [16, 24, 16], type: 'hq', color: '#111827' },
      { pos: [115, 6, 10], size: [22, 12, 35], type: 'warehouse', color: '#1f2937' },
      { pos: [115, 6, 60], size: [22, 12, 35], type: 'warehouse', color: '#111827' },
      { pos: [115, 6, 110], size: [22, 12, 35], type: 'warehouse', color: '#374151' },
      { pos: [105, 8, 160], size: [14, 16, 20], type: 'office', color: '#030712' },
      { pos: [105, 8, 200], size: [14, 16, 20], type: 'office', color: '#1f2937' },
    ];
  }, []);

  // =========================================================================
  // ⚡ 🚀 GPU METRICS PERFORMANCE BOOST: GEOMETRY CACHING 🚀 ⚡
  // =========================================================================
  // ලූපය ඇතුළේ නැවත නැවත Geometry ඉන්ස්ටන්ස් සෑදීම වැළැක්වීමට මතකයේ රඳවා ගැනීම
  const [sharedFloorSlabGeo, sharedColumnGeo, sharedBeaconGeo, sharedRadarPoleGeo, sharedRadarDishGeo] = useMemo(() => {
    return [
      new THREE.BoxGeometry(1, 0.2, 1),       // Scale කර භාවිතා කරන පොදු Floor Slab එක
      new THREE.BoxGeometry(0.6, 1, 0.6),     // Scale කර භාවිතා කරන පොදු Column එක
      new THREE.SphereGeometry(0.3, 8, 8),    // Red Beacon Light
      new THREE.CylinderGeometry(0.15, 0.3, 2, 12), // Radar Support Pole
      new THREE.BoxGeometry(5, 0.4, 0.2)      // Rotating Radar Dish
    ];
  }, []);

  const radarRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();
    radarRefs.current.forEach((ref, idx) => {
      if (ref) ref.rotation.y = elapsedTime * (1.2 + idx * 0.4);
    });
  });

  return (
    <group>
      {/* 🚧 Extension of dry land on the right side */}
      <mesh position={[115, -4.4, 0]} receiveShadow>
        <boxGeometry args={[70, 10, 500]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.15} />
      </mesh>

      {buildings.map((b, i) => {
        const width = b.size[0];
        const height = b.size[1];
        const depth = b.size[2];

        const floorHeight = 3.5;
        const totalFloors = Math.floor(height / floorHeight);

        return (
          <group key={i} position={b.pos as [number, number, number]}>
            
            {/* 1️⃣ CORE WALLS STRUCTURE */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial color={b.color} roughness={0.5} metalness={0.5} />
            </mesh>

            {/* ========================================================================= */}
            {/* 🏢 CASE A: HQ CONTROL TOWERS & OFFICE UNITS (OPTIMIZED) */}
            {/* ========================================================================= */}
            {(b.type === 'hq' || b.type === 'office') && (
              <group>
                {/* Reflective Glass Facade */}
                <mesh>
                  <boxGeometry args={[width + 0.1, height - 0.2, depth + 0.1]} />
                  <meshStandardMaterial 
                    color="#00f5d4" emissive="#00f5d4" emissiveIntensity={b.type === 'hq' ? 0.25 : 0.15} 
                    transparent opacity={0.4} roughness={0.05} metalness={0.95} 
                  />
                </mesh>

                {/* 🏗️ Optimized Concrete Floor Slabs: Shared Geometry එකක් මත ධාවනය වේ */}
                {Array.from({ length: totalFloors }).map((_, fIdx) => {
                  const slabY = (fIdx * floorHeight) - (height / 2) + 0.1;
                  return (
                    <mesh 
                      key={fIdx} 
                      geometry={sharedFloorSlabGeo} 
                      position={[0, slabY, 0]} 
                      scale={[width + 0.15, 1, depth + 0.15]}
                    >
                      <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
                    </mesh>
                  );
                })}

                {/* 🏛️ Optimized Corner Columns: Shared Geometry එකක් මත ධාවනය වේ */}
                {[-0.5, 0.5].map((xSign, xi) => 
                  [-0.5, 0.5].map((zSign, zi) => (
                    <mesh 
                      key={`${xi}-${zi}`} 
                      geometry={sharedColumnGeo} 
                      position={[xSign * width, 0, zSign * depth]}
                      scale={[1, height + 0.2, 1]}
                    >
                      <meshStandardMaterial color="#64748b" roughness={0.4} />
                    </mesh>
                  ))
                )}

                {/* Cyberpunk Structural Neon Wireframe Grid */}
                <mesh>
                  <boxGeometry args={[width + 0.2, height + 0.2, depth + 0.2]} />
                  <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={0.8} wireframe transparent opacity={0.3} />
                </mesh>
              </group>
            )}

            {/* ========================================================================= */}
            {/* 🏭 CASE B: LOGISTICS WAREHOUSES */}
            {/* ========================================================================= */}
            {b.type === 'warehouse' && (
              <group>
                {/* Industrial A-Frame Gable Roof */}
                <mesh position={[-width / 4, height / 2 + 1.2, 0]} rotation={[0, 0, 0.22]} castShadow>
                  <boxGeometry args={[width / 2 + 0.5, 0.4, depth + 0.2]} />
                  <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
                </mesh>
                <mesh position={[width / 4, height / 2 + 1.2, 0]} rotation={[0, 0, -0.22]} castShadow>
                  <boxGeometry args={[width / 2 + 0.5, 0.4, depth + 0.2]} />
                  <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
                </mesh>

                {/* Loading Dock Shutter Doors */}
                {[-10, 0, 10].map((zOffset, dIdx) => (
                  <mesh key={dIdx} position={[-width / 2 - 0.05, -height / 2 + 2, zOffset]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[6, 3.8, 0.1]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.8} />
                  </mesh>
                ))}
              </group>
            )}

            {/* ========================================================================= */}
            {/* 📡 OPTIMIZED ROOFTOP COMPONENTS */}
            {/* ========================================================================= */}
            {/* Aviation Warning Beacon */}
            <mesh geometry={sharedBeaconGeo} position={[0, height / 2 + 0.2, 0]}>
              <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={4} />
            </mesh>

            {/* HQ Rotating Radar Antennas */}
            {b.type === 'hq' && (
              <group position={[0, height / 2 + 1, 0]}>
                <mesh geometry={sharedRadarPoleGeo} castShadow>
                  <meshStandardMaterial color="#475569" metalness={0.8} />
                </mesh>
                <mesh 
                  ref={(el) => { if (el) radarRefs.current[i] = el; }} 
                  geometry={sharedRadarDishGeo} 
                  position={[0, 1.1, 0]} 
                  castShadow
                >
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