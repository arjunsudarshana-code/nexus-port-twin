'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Ocean() {
  const geomRef = useRef<THREE.PlaneGeometry>(null);
  const [isNight, setIsNight] = useState(false);

  // 💡 [NEW] දවල්/රෑ මූඩ් එක අනුව මුහුදේ වර්ණය ලයිව් වෙනස් කිරීමට Listeners එකතු කිරීම
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
    
    // ⏳ රළ චලනය වන වේගය (Natural Fluid Velocity)
    const time = state.clock.getElapsedTime() * 1.2; 
    const positions = geomRef.current.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // 🌊 Real Ocean Wave Equations (ප්‍රධාන රළ + සියුම් රිපල්ස් එකතුව)
      const swell1 = Math.sin(x * 0.015 + time) * 1.2;          // ඈතින් එන මහා රළ පේළිය
      const swell2 = Math.cos(y * 0.02 + time * 0.9) * 1.0;     // හරස් කැපෙන රළ
      const microRipple = Math.sin((x + y) * 0.08 + time * 2.0) * 0.25; // වතුර මතුපිට ඇති සියුම් රැළි
      
      positions.setZ(i, swell1 + swell2 + microRipple);
    }
    
    positions.needsUpdate = true;
    geomRef.current.computeVertexNormals(); // 👈 සිනිඳුවට ආලෝකය වැදීමට නෝමල්ස් ලයිව් රී-කැල්කියුලේට් කිරීම
  });

  return (
    // වරායේ පොළව මට්ටමට (Y: -4.5) සාපේක්ෂව වතුර නූලටම පිහිටුවීම
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.3, 0]} receiveShadow>
      {/* 🚀 args සයිස් එක නූලටම තබා ගනිමින් ප්ලේන් එක සුමුවු කරා මචන් */}
      <planeGeometry ref={geomRef} args={[3000, 3000, 150, 150]} />
      
      {/* 🏗️ [PREMIUM MATERIAL UPGRADE] සැබෑ වතුරේ ස්වභාවය දෙන ඉහළම මෙටීරියල් එක */}
      <meshPhysicalMaterial 
        color={isNight ? '#010b14' : '#004b6e'} // 🚀 අලුත් අහසට ගැලපෙන නියම Deep Ocean Blue වර්ණය
        roughness={0.12}                        // Specular highlights (ලයිට්ස් දිලිසෙන පෙනුම) ලස්සනට තබා ගැනීමට
        metalness={0.05}                        // වතුර Dielectric ඔබ්ජෙක්ට් එකක් නිසා මෙටල්නස් අඩු කළා මචන්
        clearcoat={1.0}                         // වතුර මතුපිට වීදුරුවක් මෙන් ආලෝකය පරාවර්තනය වීමට (Reflective)
        clearcoatRoughness={0.08}
        transmission={0.3}                      // 深度 (Depth) පෙනීමට වතුර තරමක් විනිවිද පෙනෙන ස්වභාවයක් දීම
        thickness={1.5}
        flatShading={false}                     // 🔴 කොටු කොටු පෙනුම සදහටම අයින් කර සිනිඳු කරා බ්‍රෝ
      />
    </mesh>
  );
}