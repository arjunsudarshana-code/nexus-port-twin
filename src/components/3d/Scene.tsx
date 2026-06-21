'use client';

import { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Cloud, Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { EffectComposer, Bloom } from '@react-three/postprocessing'; 

import Ocean from './Ocean';
import PortYard from './PortYard'; 
import HeatmapLayer from './HeatmapLayer';
import PortCranes from './PortCranes';
import Ship from './Ships';
import AGVTrucks from './AGVTrucks';
import PortRoads from './PortRoads'; 
import PortWater from './PortWater'; 
import PortBuildings from './PortBuildings'; 

function IntroCamera() {
  const { camera } = useThree();
  const introPlayed = useRef(false);

  useEffect(() => {
    if (introPlayed.current) return;
    introPlayed.current = true;

    camera.position.set(-150, 5, 180);
    gsap.to(camera.position, {
      x: 90,
      y: 55,
      z: 90,
      duration: 4.5,
      ease: 'power3.inOut',
    });
  }, [camera]);
  return null;
}

function DayNightLighting({ isNight }: { isNight: boolean }) {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const moonRef = useRef<THREE.Mesh>(null); 
  const { scene } = useThree();

  const cloudCanopy = useMemo(() => {
    return [
      { pos: [0, 150, -40], size: [60, 5, 60], vol: 24, seg: 35, speed: 0.15, grow: 5 },
      { pos: [40, 160, -20], size: [40, 4, 40], vol: 16, seg: 25, speed: 0.22, grow: 4 },
      { pos: [-120, 170, 30], size: [50, 4, 50], vol: 18, seg: 28, speed: 0.25, grow: 4 },
      { pos: [-220, 145, -80], size: [65, 6, 65], vol: 22, seg: 30, speed: 0.18, grow: 5 },
      { pos: [-80, 185, 90], size: [30, 3, 30], vol: 8, seg: 15, speed: 0.30, grow: 3 },
      { pos: [130, 190, -110], size: [55, 5, 55], vol: 20, seg: 32, speed: 0.12, grow: 5 },
      { pos: [220, 160, -40], size: [45, 4, 45], vol: 14, seg: 22, speed: 0.20, grow: 4 },
      { pos: [90, 175, -180], size: [35, 3, 35], vol: 10, seg: 18, speed: 0.28, grow: 3 },
      { pos: [50, 210, 150], size: [70, 6, 70], vol: 26, seg: 40, speed: 0.32, grow: 6 },
      { pos: [-30, 195, -280], size: [65, 6, 65], vol: 22, seg: 28, speed: 0.14, grow: 5 },
      { pos: [190, 180, 110], size: [50, 4, 50], vol: 15, seg: 20, speed: 0.26, grow: 4 },
      { pos: [-40, 155, -130], size: [25, 2, 25], vol: 7, seg: 12, speed: 0.35, grow: 3 },
      { pos: [160, 165, 220], size: [38, 4, 38], vol: 11, seg: 16, speed: 0.24, grow: 4 },
      { pos: [-160, 200, 200], size: [42, 5, 42], vol: 13, seg: 19, speed: 0.19, grow: 4 },
      { pos: [60, 170, -60], size: [55, 5, 55], vol: 22, seg: 30, speed: 0.18, grow: 5 },
      { pos: [-20, 180, 10], size: [50, 4, 50], vol: 18, seg: 25, speed: 0.24, grow: 4 },
      { pos: [100, 155, 20], size: [45, 5, 45], vol: 16, seg: 22, speed: 0.16, grow: 4 },
      { pos: [-60, 165, -40], size: [48, 4, 48], vol: 17, seg: 24, speed: 0.20, grow: 5 },
      { pos: [20, 175, -100], size: [60, 5, 60], vol: 25, seg: 35, speed: 0.13, grow: 5 },
      { pos: [140, 185, 40], size: [40, 4, 40], vol: 15, seg: 20, speed: 0.21, grow: 4 },
      { pos: [-100, 190, -100], size: [55, 6, 55], vol: 20, seg: 28, speed: 0.17, grow: 5 },
      { pos: [80, 200, -150], size: [50, 5, 50], vol: 19, seg: 26, speed: 0.23, grow: 4 },
    ];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const targetSunY = isNight ? -15 : 55; 
    const targetSunZ = isNight ? 80 : 70;
    const targetSunX = isNight ? 35 : 45;

    const currentSunY = THREE.MathUtils.lerp(dirLightRef.current ? dirLightRef.current.position.y : targetSunY, targetSunY, 0.05);
    const currentSunZ = THREE.MathUtils.lerp(dirLightRef.current ? dirLightRef.current.position.z : targetSunZ, targetSunZ, 0.05);
    const currentSunX = THREE.MathUtils.lerp(dirLightRef.current ? dirLightRef.current.position.x : targetSunX, targetSunX, 0.05);

    if (moonRef.current && isNight) {
      moonRef.current.position.y = 260 + Math.sin(time * 0.05) * 2;
    }

    if (scene.fog) {
      const fog = scene.fog as THREE.FogExp2;
      if (isNight) {
        fog.color.setHex(0x020617);
        fog.density = THREE.MathUtils.lerp(fog.density, 0.0008, 0.05); 
      } else {
        fog.color.setHex(0x0ea5e9);
        fog.density = THREE.MathUtils.lerp(fog.density, 0.0001, 0.05); 
      }
    }

    if (dirLightRef.current) {
      if (isNight) {
        dirLightRef.current.position.set(-80, 120, -80);
        dirLightRef.current.intensity = THREE.MathUtils.lerp(dirLightRef.current.intensity, 0.4, 0.05); 
        dirLightRef.current.color.setHex(0xe0f2fe); 
      } else {
        dirLightRef.current.position.set(currentSunX, currentSunY, currentSunZ);
        dirLightRef.current.intensity = THREE.MathUtils.lerp(dirLightRef.current.intensity, 1.6, 0.05); 
        dirLightRef.current.color.setHex(0xffffff); 
      }
    }

    if (hemiLightRef.current) {
      if (isNight) {
        hemiLightRef.current.intensity = THREE.MathUtils.lerp(hemiLightRef.current.intensity, 0.4, 0.05);
        hemiLightRef.current.color.setHex(0x0c4a6e);
        hemiLightRef.current.groundColor.setHex(0x020617);
      } else {
        hemiLightRef.current.intensity = THREE.MathUtils.lerp(hemiLightRef.current.intensity, 0.9, 0.05); 
        hemiLightRef.current.color.setHex(0x38bdf8); 
        hemiLightRef.current.groundColor.setHex(0x0284c7); 
      }
    }

    if (ambientLightRef.current) {
      if (isNight) {
        ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, 0.15, 0.05);
        ambientLightRef.current.color.setHex(0x020617);
      } else {
        ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, 0.65, 0.05);
        ambientLightRef.current.color.setHex(0xffffff);
      }
    }
  });

  return (
    <>
      {isNight ? (
        <>
          <Stars radius={280} depth={50} count={3500} factor={5} saturation={0.7} fade speed={1.5} />
          <mesh ref={moonRef} position={[750, -500, -200]}>
            <sphereGeometry args={[28, 28, 28]} />
            <meshBasicMaterial color="#fffbeb" toneMapped={false} />
          </mesh>
        </>
      ) : (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[900, 32, 32]} />
            <meshBasicMaterial color="#0ea5e9" side={THREE.BackSide} toneMapped={true} />
          </mesh>
        </>
      )}

      <ambientLight ref={ambientLightRef} intensity={0.6} />
      <hemisphereLight ref={hemiLightRef} intensity={0.6} args={[0xffffff, 0x0284c7]} />
      <directionalLight ref={dirLightRef} intensity={1.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0001} />

      {!isNight && (
        <group>
          {cloudCanopy.map((c, idx) => (
            <Cloud 
              key={idx}
              position={c.pos as [number, number, number]} 
              bounds={c.size as [number, number, number]}
              volume={c.vol}
              segments={c.seg}
              speed={c.speed}
              growth={c.grow}
              opacity={0.85}
              smallestVolume={3}
              concentrate="inside"
              color="#ffffff"
            />
          ))}
        </group>
      )}

      {isNight && (
        <group>
          <spotLight position={[-60, 60, 40]} angle={0.8} penumbra={0.8} intensity={15000} distance={300} color="#00f5d4" />
          <spotLight position={[0, 70, 30]} angle={0.9} penumbra={0.7} intensity={22000} distance={300} color="#ffffff" castShadow shadow-bias={-0.0008} shadow-mapSize={[1024, 1024]} />
          <spotLight position={[60, 60, 40]} angle={0.8} penumbra={0.8} intensity={15000} distance={300} color="#00f5d4" />
          
          <pointLight position={[-80, 6, 30]} intensity={600} distance={50} color="#ff0000" />
          <pointLight position={[0, 6, 30]} intensity={600} distance={50} color="#00ff66" />
          <pointLight position={[80, 6, 30]} intensity={600} distance={50} color="#ff0000" />
        </group>
      )}
    </>
  );
}

function CameraFocusHandler({ selectedContainer, controlsRef }: { selectedContainer: any; controlsRef: any }) {
  const { camera } = useThree();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; 
    }

    if (controlsRef.current) controlsRef.current.enabled = false;
    gsap.killTweensOf(camera.position);
    if (controlsRef.current) gsap.killTweensOf(controlsRef.current.target);

    if (selectedContainer && selectedContainer.position) {
      const [cx, cy, cz] = selectedContainer.position;
      
      gsap.to(camera.position, {
        x: cx + 20,
        y: cy + 14,
        z: cz + 20,
        duration: 1.2, 
        ease: 'power3.out',
      });

      if (controlsRef.current) {
        gsap.to(controlsRef.current.target, {
          x: cx,
          y: cy,
          z: cz,
          duration: 1.2,
          ease: 'power3.out',
          onUpdate: () => controlsRef.current.update(),
          onComplete: () => { if (controlsRef.current) controlsRef.current.enabled = true; }
        });
      }
    } else {
      gsap.to(camera.position, {
        x: 90,
        y: 55,
        z: 90,
        duration: 1.2,
        ease: 'power3.inOut',
      });
      if (controlsRef.current) {
        gsap.to(controlsRef.current.target, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.2,
          ease: 'power3.inOut',
          onUpdate: () => controlsRef.current.update(),
          onComplete: () => { if (controlsRef.current) controlsRef.current.enabled = true; }
        });
      }
    }
  }, [selectedContainer, camera, controlsRef]);

  return null;
}

function PostProcessingEffects({ isNightMode }: { isNightMode: boolean }) {
  const gl = useThree((state) => state.gl);
  if (!gl || !gl.getContext()) return null;

  return (
    <EffectComposer key={isNightMode ? 'night-pass' : 'day-pass'} disableNormalPass>
      <Bloom 
        luminanceThreshold={1.3} 
        mipmapBlur 
        luminanceSmoothing={0.9} 
        intensity={isNightMode ? 1.8 : 0.4} 
      />
    </EffectComposer>
  );
}

declare global {
  interface Window {
    tooglePortLights: boolean;
  }
}

interface SceneProps {
  isNightMode: boolean;
  searchQuery: string;
  onSelectContainer: (container: any) => void;
  selectedContainer: any; 
  isHeatmapMode: boolean;
}

export default function Scene({ isNightMode, searchQuery, onSelectContainer, selectedContainer, isHeatmapMode }: SceneProps) {
  const controlsRef = useRef<any>(null);
  
  useEffect(() => {
    window.tooglePortLights = isNightMode;
    if (isNightMode) {
      window.dispatchEvent(new Event('port-night-mode'));
    } else {
      window.dispatchEvent(new Event('port-day-mode'));
    }
  }, [isNightMode]);

  return (
    <div className="w-full h-[100dvh] bg-slate-950 relative">
      <Canvas
        camera={{ position: [90, 55, 90], fov: 45 }}
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[isNightMode ? '#020617' : '#0ea5e9']} />
        <fogExp2 attach="fog" args={[isNightMode ? '#020617' : '#0ea5e9', 0.0001]} />
        
        <Suspense fallback={null}>
          <IntroCamera />
          <CameraFocusHandler selectedContainer={selectedContainer} controlsRef={controlsRef} />
          
          <DayNightLighting isNight={isNightMode} />
          <Ocean />
          
          <mesh position={[0, -4.5, 0]} receiveShadow>
            <boxGeometry args={[160, 10, 500]} />
            <meshStandardMaterial color={isNightMode ? '#556173' : '#78889e'} roughness={0.7} metalness={0.1} />
          </mesh>

          <PortRoads isNightMode={isNightMode} />
          
          <PortYard 
            searchQuery={searchQuery} 
            onSelectContainer={onSelectContainer} 
            selectedContainer={selectedContainer}
            isHeatmapMode={isHeatmapMode}
          />

          <PortBuildings />
          
          {!isHeatmapMode && <HeatmapLayer />}
          
          <PortCranes />
          <AGVTrucks onSelectTruck={onSelectContainer} />
          
          <Ship id="vessel-alpha" initialPosition={[-110, 0, 15]} />

          <PostProcessingEffects isNightMode={isNightMode} />

        </Suspense>

        <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.04} maxPolarAngle={Math.PI / 2 - 0.02} />
      </Canvas>
    </div>
  );
}