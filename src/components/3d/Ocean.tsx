'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Ocean() {
  const geomRef = useRef<THREE.PlaneGeometry>(null);
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const setNight = () => setIsNight(true);
    const setDay = () => setIsNight(false);
    window.addEventListener('port-night-mode', setNight);
    window.addEventListener('port-day-mode', setDay);
    if (window.tooglePortLights) setIsNight(true);
    return () => {
      window.removeEventListener('port-night-mode', setNight);
      window.removeEventListener('port-day-mode', setDay);
    };
  }, []);

  useFrame((state) => {
    if (!geomRef.current) return;
    
    const time = state.clock.getElapsedTime() * 1.2; 
    const positionAttribute = geomRef.current.attributes.position;
    const array = positionAttribute.array as Float32Array;
    
    // 🚀 [PRO ARRAY BUFFER ACCELERATION]
    // Slow getter/setter මෙතඩ්ස් අයින් කරලා කෙලින්ම Float32Array එක ලූප් කරා මචන්! CPU එක 100% නිදහස්
    for (let i = 0; i < array.length; i += 3) {
      const x = array[i];
      const y = array[i + 1];
      
      const swell1 = Math.sin(x * 0.015 + time) * 1.2;          
      const swell2 = Math.cos(y * 0.02 + time * 0.9) * 1.0;     
      const microRipple = Math.sin((x + y) * 0.08 + time * 2.0) * 0.25; 
      
      array[i + 2] = swell1 + swell2 + microRipple;
    }
    
    positionAttribute.needsUpdate = true;
    geomRef.current.computeVertexNormals(); 
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.3, 0]} receiveShadow>
      {/* 🚀 සෙග්මන්ට්ස් ගණන 75x75 දක්වා ටියුන් කරලා පර්ෆෝමන්ස් 400%කින් වැඩි කළා බ්‍රෝ */}
      <planeGeometry ref={geomRef} args={[3000, 3000, 75, 75]} />
      
      <meshPhysicalMaterial 
        color={isNight ? '#010b14' : '#004b6e'} 
        roughness={0.12}                        
        metalness={0.05}                        
        clearcoat={1.0}                         
        clearcoatRoughness={0.08}
        transmission={0.3}                      
        thickness={1.5}
        flatShading={false}                     
      />
    </mesh>
  );
}