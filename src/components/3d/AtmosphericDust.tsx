'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AtmosphericDust() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1200; // Particles ප්‍රමාණය

  // 3D අවකාශය පුරාම random points ඛණ්ඩාංක සෑදීම
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colorOptions = [new THREE.Color('#00ffcc'), new THREE.Color('#ff0055'), new THREE.Color('#00bbff')];

    for (let i = 0; i < count; i++) {
      // වරාය වටා පුළුල්ව පැතිරීම [X, Y, Z]
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = Math.random() * 40; // බිම සිට අඩි 40ක් ඉහළට පමණක්
      pos[i * 3 + 2] = (Math.random() - 0.5) * 400;

      // අංශු වලට Cyberpunk colors random mix කිරීම
      const chosenColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      cols[i * 3] = chosenColor.r;
      cols[i * 3 + 1] = chosenColor.g;
      cols[i * 3 + 2] = chosenColor.b;
    }
    return [pos, cols];
  }, []);

  // හැම frame එකකදීම particles සෙමෙන් පහළට සහ වටයට පාවී යාම ඇනිමේට් කිරීම
  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Particles ලාවට කැරකැවීම සහ පාවීම
    pointsRef.current.rotation.y = time * 0.02;
    pointsRef.current.rotation.x = Math.sin(time * 0.01) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        vertexColors
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending} // එක මත එක වැටෙනකොට ඩබල් glow වෙන effect එක
      />
    </points>
  );
}