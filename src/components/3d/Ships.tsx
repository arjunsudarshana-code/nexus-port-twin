'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber'; 
import { DeltaUpdate } from '@/types/telemetry';
import gsap from 'gsap';
import { Html, useGLTF, Center } from '@react-three/drei';

interface ShipProps {
  id: string;
  initialPosition: [number, number, number];
}

export default function Ship({ id, initialPosition }: ShipProps) {
  const shipRef = useRef<THREE.Group>(null);
  const rockingGroupRef = useRef<THREE.Group>(null); 
  const smokeRef = useRef<THREE.InstancedMesh>(null);
  
  // 🚀 [THE ULTIMATE ARRIVAL GUARD] Animation fakt ekach veles run honyasathi guard ref
  const arrivalPlayed = useRef(false);

  const [targetPos, setTargetPos] = useState<[number, number, number]>(initialPosition);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  
  const [liveTelemetry, setLiveTelemetry] = useState({ status: 'CRUISING // ARRIVAL', speed: 18.4 });
  const [isNight, setIsNight] = useState(false);

  const isIntroFinished = useRef(false);
  const { scene } = useGLTF('/models/ship.glb');

  // =========================================================================
  // 💨 SMOKE PARTICLE SYSTEM INITIALIZATION
  // =========================================================================
  const SMOKE_COUNT = 35; 
  
  const [smokeGeo, smokeMat] = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.0, 6, 6); 
    const mat = new THREE.MeshStandardMaterial({
      color: '#64748b',
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.3 
    });
    return [geo, mat];
  }, []);

  const smokeParticles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < SMOKE_COUNT; i++) {
      arr.push({
        age: (i / SMOKE_COUNT), 
        speed: 0.3 + Math.random() * 0.4,
        swaySpeed: 1 + Math.random() * 2,
        xOffset: (Math.random() * 2 - 1) * 0.2,
        zOffset: (Math.random() * 2 - 1) * 0.2
      });
    }
    return arr;
  }, []);

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
    if (!rockingGroupRef.current || !shipRef.current) return;

    const time = state.clock.getElapsedTime();
    const currentX = shipRef.current.position.x;
    const currentZ = shipRef.current.position.z;

    // Bobbing & Rocking Physics
    const waveY = Math.sin(currentX * 0.02 + time * 1.6) * 0.4 + Math.cos(currentZ * 0.02 + time * 1.9) * 0.4;
    rockingGroupRef.current.position.y = waveY;

    const roll = Math.cos(time * 1.2) * 0.03 + Math.sin(currentX * 0.01 + time * 1.6) * 0.02;
    rockingGroupRef.current.rotation.z = roll;

    const pitch = Math.sin(time * 1.7) * 0.015;
    rockingGroupRef.current.rotation.x = pitch;

    if (!isIntroFinished.current && liveTelemetry.speed > 0) {
      setLiveTelemetry(prev => ({ ...prev, speed: Math.max(0, prev.speed - 0.08) }));
    }

    // =========================================================================
    // 💨 REAL-TIME 3D SMOKE SIMULATION ENGINE (useFrame)
    // =========================================================================
    if (smokeRef.current) {
      const dummy = new THREE.Object3D();
      const delta = state.clock.getDelta() || 0.016; 

      smokeParticles.forEach((p, idx) => {
        p.age += delta * p.speed;

        if (p.age > 1.0) {
          p.age = 0;
        }

        // Tumche original smoke dimensions mazaat takle ahet bhau
        const emitterX = -15 + p.xOffset; 
        const emitterY = 10;              
        const emitterZ = -10 + p.zOffset;     

        const currentY = emitterY + p.age * 18.0; 
        const currentX = emitterX - (p.age * 8.0) + Math.sin(time * p.swaySpeed + idx) * 0.5; 
        const currentZ = emitterZ + Math.cos(time * p.swaySpeed + idx) * 0.5; 

        dummy.position.set(currentX, currentY, currentZ);

        const scaleVal = Math.sin(p.age * Math.PI) * 2.8;
        dummy.scale.set(scaleVal, scaleVal, scaleVal);
        
        dummy.updateMatrix();
        smokeRef.current.setMatrixAt(idx, dummy.matrix);
      });

      smokeRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Emissive Window Glow
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;

        if (mesh.material && 'emissive' in mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (isNight) {
            if (mesh.name.toLowerCase().includes('window') || mesh.name.toLowerCase().includes('glass')) {
              mat.emissive.setHex(0xffaa00);
              mat.emissiveIntensity = 3.0;
            } else {
              mat.emissive.setHex(0x111122);
              mat.emissiveIntensity = 0.5;
            }
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [scene, isNight]);

  // WebSocket Movement
  useEffect(() => {
    const handleDeltaStream = (e: CustomEvent<DeltaUpdate>) => {
      const packet = e.detail;
      if (packet.id === id && isIntroFinished.current) {
        setTargetPos(packet.position);
        if (packet.telemetry) {
          setLiveTelemetry({ status: packet.telemetry.status, speed: packet.telemetry.speed || 0 });
        }
      }
    };
    window.addEventListener('ws-delta-stream' as any, handleDeltaStream);
    return () => window.removeEventListener('ws-delta-stream' as any, handleDeltaStream);
  }, [id]);

  // GSAP Cinematic Arrival
  useEffect(() => {
    // 🚀 [THE GUARD CHECK] Jar animation aadhi run zala asel tar parat play honar nahi!
    if (arrivalPlayed.current || !shipRef.current) return;
    arrivalPlayed.current = true; 

    shipRef.current.position.set(initialPosition[0] - 240, initialPosition[1], initialPosition[2] + 65);
    shipRef.current.rotation.y = Math.PI / 6;

    gsap.to(shipRef.current.position, {
      x: initialPosition[0],
      y: initialPosition[1],
      z: initialPosition[2],
      duration: 8.0,
      ease: 'power2.out',
      onComplete: () => {
        isIntroFinished.current = true;
        if (shipRef.current) {
          gsap.to(shipRef.current.rotation, { y: 0, duration: 1.5 });
        }
        setLiveTelemetry({ status: 'DOCKED // STANDBY', speed: 0 });
      }
    });
  }, []); // Array reference clean thevla ahe जेणेकरून state updates mule trigger honar nahi

  useEffect(() => {
    if (!shipRef.current || !isIntroFinished.current) return;
    gsap.to(shipRef.current.position, {
      x: targetPos[0],
      y: targetPos[1],
      z: targetPos[2],
      duration: 2.8,
      ease: 'power2.inOut',
    });
  }, [targetPos]);

  return (
    <group 
      ref={shipRef}
      onClick={(e) => { e.stopPropagation(); setSelected(!selected); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      <group ref={rockingGroupRef}>
        <Center position={[0, 4.2, 0]}>
          <primitive object={scene} scale={0.015} />
        </Center>

        <instancedMesh ref={smokeRef} args={[smokeGeo, smokeMat, SMOKE_COUNT]} />

        {isNight && (
          <group position={[0, 4, 0]}>
            <pointLight position={[0, 10, 5]} intensity={800} distance={100} color="#ffb703" castShadow />
            <pointLight position={[-15, 6, 8]} intensity={300} distance={40} color="#ff0055" />
            <pointLight position={[15, 6, 8]} intensity={300} distance={40} color="#00ff66" />
            <pointLight position={[25, 5, -5]} intensity={400} distance={80} color="#ffffff" />
          </group>
        )}
      </group>

      {/* Live Telemetry Status Box */}
      <Html distanceFactor={60} position={[0, 15, 0]} center>
        <div className={`backdrop-blur-md bg-slate-950/80 border-2 text-xs p-4 rounded font-mono shadow-2xl w-60 transition-all duration-300 ${
          liveTelemetry.status.includes('CRUISING') 
            ? 'border-amber-500/60 text-amber-400' 
            : 'border-emerald-500/60 text-emerald-400'
        }`}>
          <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-2">
            <span className="font-bold text-white">🚢 VESSEL ALPHA</span>
            <span className={`px-1 rounded text-[9px] font-bold animate-pulse ${
              liveTelemetry.status.includes('CRUISING') ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {liveTelemetry.status.includes('CRUISING') ? 'APPROACHING' : 'LIVE'}
            </span>
          </div>
          <p className="flex justify-between">STATUS : <span className="text-white font-bold">{liveTelemetry.status}</span></p>
          <p className="flex justify-between">SPEED  : <span className="text-white font-sans font-bold">{liveTelemetry.speed.toFixed(1)} knots</span></p>
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload('/models/ship.glb');