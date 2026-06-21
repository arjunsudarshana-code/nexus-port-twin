'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function PortWater() {
  const geometryRef = useRef<THREE.PlaneGeometry>(null);

  // =========================================================================
  // 🛠️ මූදේ වතුර රැලි වල වේගය, පාට සහ ස්වභාවය වෙනස් කරන තැන (Settings) 🛠️
  // =========================================================================
  const WATER_COLOR = '#0b1329';    // 🌊 මූදේ ප්‍රධාන පාට (Deep Ocean Dark Blue)
  const WAVE_SPEED = 1.0;          // ⏱️ වතුර රැලි ගමන් කරන වේගය (Slow Smooth Motion)
  const WAVE_HEIGHT = 0.5;         // ⬆️ රළුවල උපරිම උස ප්‍රමාණය (Wave Amplitude)
  const WAVE_FREQUENCY = 0.03;     // 🌊 රැලි එකිනෙකට ඇති පරතරය (Wave Frequency)

  // මුල් පිහිටීම් මතක තබා ගැනීමට (Performance ආරක්ෂා කරගන්න useMemo එකක් දැම්මා)
  const originalPositions = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2000, 2000, 64, 64);
    return geo.attributes.position.array.slice();
  }, []);

  useFrame((state) => {
    if (!geometryRef.current) return;

    const time = state.clock.getElapsedTime() * WAVE_SPEED;
    const positionAttribute = geometryRef.current.attributes.position;
    const array = positionAttribute.array as Float32Array;

    // 🔄 Mathematical Sine Waves මඟින් හැම වර්ටෙක්ස් (Vertex) එකක්ම රියල්-ටයිම් ඇනිමේට් කිරීම
    for (let i = 0; i < array.length; i += 3) {
      const x = originalPositions[i];
      const y = originalPositions[i + 1];

      // Z අක්ෂය (උස) සයිනස් තරංග වලට අනුව වෙනස් කරලා රැලි ගැසීම සිදු කරයි
      array[i + 2] = 
        Math.sin(x * WAVE_FREQUENCY + time) * WAVE_HEIGHT +
        Math.cos(y * WAVE_FREQUENCY + time * 0.8) * (WAVE_HEIGHT * 0.5);
    }

    // Three.js එකට වෙනස් වීම් ලයිව් අප්ඩේට් කිරීමට දැනුම් දීම
    positionAttribute.needsUpdate = true;
    
    // එළිය සහ සෙවනැලි (Lighting & Reflections) රැලි මත නූලටම වැටෙන්න මේක අනිවාර්යයි
    geometryRef.current.computeVertexNormals(); 
  });

  return (
    // මූද වරායේ කොන්ක්‍රීට් බිමට වඩා පොඩ්ඩක් පහළින් පිහිටුවීම (Y = -0.1)
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -100]} receiveShadow>
      <planeGeometry ref={geometryRef} args={[2000, 2000, 64, 64]} />
      <meshStandardMaterial
        color={WATER_COLOR}
        roughness={0.12}    // 🪞 මූද මතුපිට ලස්සනට එළිය පරාවර්තනය වීමට රෆ්නස් එක අඩු කරා
        metalness={0.7}     // ✨ සිනමාටික් ග්ලොසි ලුක් එකක් එන්න මෙටල්නස් එක වැඩි කරා
        flatShading={false} // වතුර එක ගොඩක් ස්මූත් වී පෙනීමට
      />
    </mesh>
  );
}