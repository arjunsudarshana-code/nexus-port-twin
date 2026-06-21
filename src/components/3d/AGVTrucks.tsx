'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei'; 
import * as THREE from 'three';

interface TruckProps {
  basePosition: [number, number, number];
  offset: number;
  truckColor: string;
  containerColors: string[];
  truckId: number;
  onSelectTruck: (truckData: any) => void; 
}

const YARD_Z_SLOTS = [5.5, 8.5, 12.5];

function SingleAGVTruck({ basePosition, offset, truckColor, containerColors, truckId, onSelectTruck }: TruckProps) {
  const truckRef = useRef<THREE.Group>(null);
  const frontLeftWheelRef = useRef<THREE.Mesh>(null);
  const frontRightWheelRef = useRef<THREE.Mesh>(null);
  const rearLeftWheelRef = useRef<THREE.Mesh>(null);
  const rearRightWheelRef = useRef<THREE.Mesh>(null);
  const cargoMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const containerGroupRef = useRef<THREE.Group>(null);

  const ROAD_HEIGHT = 0.5;   
  const LEFT_X = -60.0;      
  const RIGHT_X = 71.0;      
  const FRONT_Z = 200.0;     
  const BACK_Z = -210.0;     

  const LANE_OFFSET = 2.5; 
  const isOuterLane = basePosition[0] <= 0; 

  const FRONT_Z_LANE = FRONT_Z + (isOuterLane ? LANE_OFFSET : -LANE_OFFSET);
  const BACK_Z_LANE  = BACK_Z  + (isOuterLane ? -LANE_OFFSET : LANE_OFFSET);
  const LEFT_X_LANE  = LEFT_X  + (isOuterLane ? -LANE_OFFSET : LANE_OFFSET);
  const RIGHT_X_LANE = RIGHT_X + (isOuterLane ? LANE_OFFSET : -LANE_OFFSET);

  const TRUCK_Y = ROAD_HEIGHT + 0.65; 
  
  // 🚀 [FIX 01] Z-Fighting බග් එක නැති කරන්න ලේසර් එක පාරේ මට්ටමට වඩා මිලිමීටර කිහිපයක් උඩට ගත්තා මචන්
  const PATH_Y = ROAD_HEIGHT + 0.06; 

  const sideX_lane = isOuterLane ? LEFT_X_LANE : RIGHT_X_LANE;
  const oppSideX_lane = isOuterLane ? RIGHT_X_LANE : LEFT_X_LANE;

  const vectorPathPoints = [
    [basePosition[0], PATH_Y, 5.5],          
    [basePosition[0], PATH_Y, FRONT_Z_LANE],  
    [sideX_lane, PATH_Y, FRONT_Z_LANE],       
    [sideX_lane, PATH_Y, BACK_Z_LANE],        
    [oppSideX_lane, PATH_Y, BACK_Z_LANE],     
    [oppSideX_lane, PATH_Y, FRONT_Z_LANE],    
    [basePosition[0], PATH_Y, FRONT_Z_LANE],  
    [basePosition[0], PATH_Y, 12.5],         
  ] as [number, number, number][];

  const pathColor = isOuterLane ? '#00f5d4' : '#ff9f1c';

  useFrame((state) => {
    if (!truckRef.current || !cargoMatRef.current || !containerGroupRef.current) return;

    const t = (state.clock.getElapsedTime() + offset) * 0.12; 
    const phase = t % 8;
    const currentIdx = Math.floor(t / 4) % 3; 

    const startZ = YARD_Z_SLOTS[currentIdx];

    let posX = basePosition[0];
    let posZ = startZ;
    let rotY = 0;
    let showCargo = false;
    let wheelSpeed = 0;
    
    const moveSpeed = -0.05; 

    if (phase < 1) {
      posX = basePosition[0]; posZ = startZ; rotY = 0; showCargo = (phase > 0.5); wheelSpeed = 0;
    } else if (phase < 2) {
      const p = phase - 1; const ease = (1 - Math.cos(p * Math.PI)) / 2;
      posX = basePosition[0]; posZ = startZ + ease * (FRONT_Z_LANE - startZ); rotY = 0; showCargo = true; wheelSpeed = moveSpeed;
    } else if (phase < 3) {
      const p = phase - 2; const ease = (1 - Math.cos(p * Math.PI)) / 2;
      posX = basePosition[0] + ease * (sideX_lane - basePosition[0]); posZ = FRONT_Z_LANE; rotY = (sideX_lane > basePosition[0]) ? Math.PI / 2 : -Math.PI / 2; showCargo = true; wheelSpeed = moveSpeed;
    } else if (phase < 4) {
      const p = phase - 3; const ease = (1 - Math.cos(p * Math.PI)) / 2;
      posX = sideX_lane; posZ = FRONT_Z_LANE + ease * (BACK_Z_LANE - FRONT_Z_LANE); rotY = Math.PI; showCargo = true; wheelSpeed = moveSpeed;
    } else if (phase < 5) {
      const p = phase - 4; const ease = (1 - Math.cos(p * Math.PI)) / 2;
      posX = sideX_lane + ease * (oppSideX_lane - sideX_lane); posZ = BACK_Z_LANE; rotY = (oppSideX_lane > sideX_lane) ? Math.PI / 2 : -Math.PI / 2; 
      showCargo = isOuterLane ? false : (p < 0.5); 
      wheelSpeed = moveSpeed;
    } else if (phase < 6) {
      const p = phase - 5; const ease = (1 - Math.cos(p * Math.PI)) / 2;
      posX = oppSideX_lane; posZ = BACK_Z_LANE + ease * (FRONT_Z_LANE - BACK_Z_LANE); rotY = 0; showCargo = false; wheelSpeed = moveSpeed;
    } else if (phase < 7) {
      const p = phase - 6; const ease = (1 - Math.cos(p * Math.PI)) / 2;
      posX = oppSideX_lane + ease * (basePosition[0] - oppSideX_lane); posZ = FRONT_Z_LANE; rotY = (basePosition[0] > oppSideX_lane) ? Math.PI / 2 : -Math.PI / 2; showCargo = false; wheelSpeed = moveSpeed;
    } else {
      const p = phase - 7; const ease = (1 - Math.cos(p * Math.PI)) / 2;
      posX = basePosition[0]; posZ = FRONT_Z_LANE + ease * (startZ - FRONT_Z_LANE); rotY = Math.PI; showCargo = false; wheelSpeed = moveSpeed;
    }

    truckRef.current.position.x = posX; 
    truckRef.current.position.z = posZ; 
    truckRef.current.position.y = TRUCK_Y;
    truckRef.current.rotation.y = rotY;

    if (frontLeftWheelRef.current) frontLeftWheelRef.current.rotation.x += wheelSpeed;
    if (frontRightWheelRef.current) frontRightWheelRef.current.rotation.x += wheelSpeed;
    if (rearLeftWheelRef.current) rearLeftWheelRef.current.rotation.x += wheelSpeed;
    if (rearRightWheelRef.current) rearRightWheelRef.current.rotation.x += wheelSpeed;

    containerGroupRef.current.visible = showCargo;
    cargoMatRef.current.color.set(containerColors[currentIdx]);
  });

  return (
    <group>
      {/* 🚀 [FIX 02] GPU Render Queue එකේ පාරට වඩා ලේසර් එක හැමවිටම උඩින් තියන්න Polygon Offset ශක්තිමත් කළා */}
      <Line 
        points={vectorPathPoints} 
        color={pathColor} 
        lineWidth={3.2} 
        dashed={true} 
        dashSize={1.5} 
        gapSize={0.8} 
        opacity={0.9} 
        transparent={true} 
        depthTest={true} 
        polygonOffset={true} 
        polygonOffsetFactor={-10} // තවත් ඉදිරියට ඇද්දා
        polygonOffsetUnits={-10}
      />
      
      <group 
        ref={truckRef}
        onClick={(e) => {
          e.stopPropagation(); 
          if (truckRef.current) {
            const currentX = truckRef.current.position.x.toFixed(2);
            const currentZ = truckRef.current.position.z.toFixed(2);

            onSelectTruck({
              id: `AGV-FLEET-0${truckId}`,
              content: `EV Autonomous Power Unit`,
              weight: `Tare: 4.8 Tons // Heavy Load`,
              destination: isOuterLane ? "Unloading Depot Terminal" : "Yard Buffer Circuit Lane",
              status: `ONLINE // Core Systems Nominal`,
              bayCoordinates: `ACTIVE GPS [X: ${currentX}, Z: ${currentZ}]`
            });
          }
        }}
      >
        <mesh castShadow receiveShadow position={[0, 0.4, 0]}><boxGeometry args={[2.8, 0.5, 6.0]} /><meshStandardMaterial color={truckColor} metalness={0.8} roughness={0.2} /></mesh>
        <mesh castShadow position={[0, 0.85, -2.6]}><boxGeometry args={[2.4, 0.6, 0.8]} /><meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} /></mesh>
        <mesh position={[-0.8, 0.85, -3.02]}><boxGeometry args={[0.3, 0.12, 0.05]} /><meshStandardMaterial color={pathColor} emissive={pathColor} emissiveIntensity={8} /></mesh>
        <mesh position={[0.8, 0.85, -3.02]}><boxGeometry args={[0.3, 0.12, 0.05]} /><meshStandardMaterial color={pathColor} emissive={pathColor} emissiveIntensity={8} /></mesh>
        <mesh position={[-0.9, 0.4, 3.02]}><boxGeometry args={[0.3, 0.1, 0.05]} /><meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={4} /></mesh>
        <mesh position={[0.9, 0.4, 3.02]}><boxGeometry args={[0.3, 0.1, 0.05]} /><meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={4} /></mesh>
        <mesh ref={frontLeftWheelRef} position={[-1.45, 0.15, -1.8]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.4, 0.4, 0.3, 16]} /><meshStandardMaterial color="#1e293b" roughness={0.9} /></mesh>
        <mesh ref={frontRightWheelRef} position={[1.45, 0.15, -1.8]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.4, 0.4, 0.3, 16]} /><meshStandardMaterial color="#1e293b" roughness={0.9} /></mesh>
        <mesh ref={rearLeftWheelRef} position={[-1.45, 0.15, 1.8]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.4, 0.4, 0.3, 16]} /><meshStandardMaterial color="#1e293b" roughness={0.9} /></mesh>
        <mesh ref={rearRightWheelRef} position={[1.45, 0.15, 1.8]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.4, 0.4, 0.3, 16]} /><meshStandardMaterial color="#1e293b" roughness={0.9} /></mesh>
        <group ref={containerGroupRef}><mesh position={[0, 1.85, 0]} castShadow><boxGeometry args={[2.4, 2.4, 5.4]} /><meshStandardMaterial ref={cargoMatRef} roughness={0.4} metalness={0.3} flatShading /></mesh></group>
      </group>
    </group>
  );
}

function UnloadingDepot() {
  const depositContainerRef1 = useRef<THREE.Mesh>(null);
  const depositContainerRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!depositContainerRef1.current || !depositContainerRef2.current) return;
    const t = state.clock.getElapsedTime() * 0.12;
    const phase = t % 8;
    const isCargoDeposited = phase >= 4.1 && phase <= 7.8;
    depositContainerRef1.current.visible = isCargoDeposited;
    depositContainerRef2.current.visible = !isCargoDeposited; 
  });

  return (
    <group position={[-58, 0.5, -204]}>
      <mesh receiveShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[8, 0.1, 14]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[8.2, 0.02, 14.2]} />
        <meshStandardMaterial color="#00f5d4" emissive="#00f5d4" emissiveIntensity={3} wireframe />
      </mesh>
      <mesh ref={depositContainerRef1} castShadow position={[-1.5, 1.2, 0]}>
        <boxGeometry args={[2.4, 2.4, 5.4]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.5} flatShading />
      </mesh>
      <mesh ref={depositContainerRef2} castShadow position={[1.5, 1.2, 2]}>
        <boxGeometry args={[2.4, 2.4, 5.4]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.5} flatShading />
      </mesh>
    </group>
  );
}

interface AGVTrucksComponentProps {
  onSelectTruck: (truckData: any) => void;
}

export default function AGVTrucks({ onSelectTruck }: AGVTrucksComponentProps) {
  const fleetConfig = [
    { id: 1, pos: [-30, 0, 0] as [number, number, number], offset: 0.0, color: '#1e293b', colors: ['#0284c7', '#f97316', '#10b981'] },
    { id: 2, pos: [30, 0, 0] as [number, number, number], offset: 4.0, color: '#334155', colors: ['#ef4444', '#3b82f6', '#eab308'] }
  ];

  return (
    <group>
      <UnloadingDepot />

      {fleetConfig.map((truck) => (
        <SingleAGVTruck 
          key={truck.id} 
          truckId={truck.id}
          basePosition={truck.pos} 
          offset={truck.offset} 
          truckColor={truck.color} 
          containerColors={truck.colors} 
          onSelectTruck={onSelectTruck} 
        />
      ))}
    </group>
  );
}