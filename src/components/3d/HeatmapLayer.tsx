'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// 🚀 Custom WebGL Shader Material Definition
const CyberHeatmapMaterial = shaderMaterial(
  {
    uTime: 0,
    uDensityGrid: [
      0.2, 0.8, 0.4, 0.9, 0.1,
      0.7, 0.3, 0.9, 0.5, 0.8,
      0.1, 0.6, 0.2, 0.7, 0.4
    ], // වරායේ විවිධ කලාප වල ඝනත්වය (Mock Density Array)
  },
  // 1. Vertex Shader: 3D අවකාශයේ Grid එකේ පිහිටීම සකසයි
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // 2. Fragment Shader: හැම pixel එකකම පාට සහ Neon Glow/Pulse එක GPU එකෙන්ම තීරණය කරයි
  `
    uniform float uTime;
    uniform float uDensityGrid[15];
    varying vec2 vUv;

    void main() {
      // UV coordinates මත පදනම්ව grid සෛල (cells) 3x5 කට කඩා ගැනීම
      int col = int(vUv.x * 5.0);
      int row = int(vUv.y * 3.0);
      int index = row * 5 + col;
      
      // අදාළ කොටසේ කන්ටේනර් ඝනත්වය (0.0 සිට 1.0 දක්වා)
      float density = 0.0;
      if (index >= 0 && index < 15) {
        density = uDensityGrid[index];
      }

      // Base Colors: අඩු ඝනත්වයට Cyber Cyan (0.0, 1.0, 0.8) සහ වැඩි ඝනත්වයට Luminous Neon Red (1.0, 0.0, 0.2)
      vec3 lowColor = vec3(0.0, 0.8, 1.0);
      vec3 highColor = vec3(1.0, 0.0, 0.2);
      
      // ඝනත්වය අනුව පාටවල් දෙක එකිනෙක මිශ්‍ර කිරීම (Interpolation)
      vec3 finalColor = mix(lowColor, highColor, density);

      // Edge Glow Effect: හැම grid කොටුවකම වටේ බෝඩර් එක ලස්සනට glow කිරීම
      vec2 gridUv = fract(vUv * vec2(5.0, 3.0));
      float border = smoothstep(0.0, 0.05, gridUv.x) * smoothstep(1.0, 0.95, gridUv.x) *
                     smoothstep(0.0, 0.08, gridUv.y) * smoothstep(1.0, 0.92, gridUv.y);

      // Cyberpunk Wave Pulse Effect: කාලය (uTime) සමඟ සෙමෙන් නිවෙමින් බැබලෙන තරංගයක් එකතු කිරීම
      float pulse = 0.7 + 0.3 * sin(uTime * 3.0 + (vUv.x * 4.0));
      
      // අවසාන වශයෙන් බෝඩර් ඉෆෙක්ට් එක සහ පල්ස් එක එකතු කර වර්ණය නිපදවීම
      vec3 glowOutput = finalColor * (1.2 - border * 0.6) * pulse;

      gl_FragColor = vec4(glowOutput, 0.45); // 0.45 යනු Opacity එකයි (Semi-transparent layer)
    }
  `
);

// R3F එක ඇතුලේ <cyberHeatmapMaterial /> ටැග් එකක් විදිහට පාවිච්චි කරන්න extend කරනවා
extend({ CyberHeatmapMaterial });

// TypeScript JSX definitions වලට අලුත් shader එක එකතු කිරීම
declare global {
  namespace JSX {
    interface IntrinsicElements {
      cyberHeatmapMaterial: any;
    }
  }
}

export default function HeatmapLayer() {
  const materialRef = useRef<any>(null);

  // හැම frame එකකදීම shader එක ඇතුලට යන uTime uniform එක update කරනවා (Pulse ඇනිමේෂන් එක වෙන්නේ මේකෙන්)
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime();
    }
  });

  return (
    // වරාය බිම වැහෙන්න ලොකු ප්ලේන් එකක් අරන්, ඒක අංශක 90ක් කරකවලා බිමට සමතලා කරා
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
      <planeGeometry args={[110, 370]} />
      <cyberHeatmapMaterial ref={materialRef} transparent depthWrite={false} />
    </mesh>
  );
}