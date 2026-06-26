'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

const CONTAINER_COUNT = 5000;

interface PortYardProps {
  searchQuery: string;
  onSelectContainer: (container: any) => void; 
  selectedContainer: any; 
  isHeatmapMode: boolean; 
}

export default function PortYard({ searchQuery, onSelectContainer, selectedContainer, isHeatmapMode }: PortYardProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const containerDataMapRef = useRef<any[]>([]);

  const [boxGeometry, textMaterial] = useMemo(() => {
    const geo = new THREE.BoxGeometry(2.8, 2.4, 6.2);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.85 });
    return [geo, mat];
  }, []);

  // 🚀 [THREE.JS PRO TECH] STATIC DATA GENERATION CACHE
  const staticContainers = useMemo(() => {
    const items = [];
    let index = 0;

    const cargoTypes = ["Tech Components", "Heavy Machinery", "Medical Supplies", "Automotive Parts", "Consumer Electronics"];
    const destinations = ["Singapore Hub", "Tokyo Port", "Rotterdam Terminal", "Dubai Logistics"];

    for (let x = 0; x < 25; x++) {
      for (let z = 0; z < 50; z++) {
        const pseudoRandom = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
        const stackHeight = Math.floor((pseudoRandom - Math.floor(pseudoRandom)) * 5) + 1;
        
        for (let y = 0; y < stackHeight; y++) {
          if (index >= CONTAINER_COUNT) break;

          const posX = (x - 12.5) * 3.5;
          const posY = y * 2.4 + 1.2; 
          const posZ = (z - 25) * 7.0;

          const isAlleyPath = (x === 4 || x === 21) && z >= 25;
          if (isAlleyPath) continue;

          const containerId = `CT-${x.toString().padStart(2, '0')}${z.toString().padStart(2, '0')}-${y}`;
          const weightVal = ((x * 3 + z * 7 + y * 11) % 15 + 18).toFixed(1); 

          items.push({
            index,
            id: containerId,
            weight: `${weightVal} Tons`,
            content: cargoTypes[(x + z + y) % cargoTypes.length],
            destination: destinations[(x * 2 + z) % destinations.length],
            status: y === stackHeight - 1 ? "Top Tier // Ready" : "Stowed Below",
            bayCoordinates: `BAY [Row: ${x}, Col: ${z}, Tier: ${y}]`,
            position: [posX, posY, posZ],
            stackHeight,
            colorIndex: (x * 7 + z * 13 + y * 3) % 4
          });
          index++;
        }
      }
    }
    return items;
  }, []);

  // 1. SETUP STATIC INSTANCE MATRICES (ධාවනය වන්නේ එකම එක පාරයි)
  useEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const tempMap: any[] = [];

    staticContainers.forEach((c) => {
      dummy.position.set(c.position[0], c.position[1], c.position[2]);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(c.index, dummy.matrix);
      tempMap[c.index] = c;
    });

    meshRef.current.count = staticContainers.length;
    containerDataMapRef.current = tempMap;

    meshRef.current.geometry.computeBoundingBox();
    meshRef.current.geometry.computeBoundingSphere();
    meshRef.current.boundingBox = new THREE.Box3(new THREE.Vector3(-200, -50, -400), new THREE.Vector3(200, 150, 400));
    meshRef.current.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 600);
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [staticContainers]);

  // 2. LIGHTWEIGHT FAST COLOR UPDATE LOOP
  useEffect(() => {
    if (!meshRef.current) return;

    const containerColors = [
      new THREE.Color('#0f172a'), 
      new THREE.Color('#1e293b'), 
      new THREE.Color('#0284c7'), 
      new THREE.Color('#0d9488'), 
    ];

    const query = searchQuery.trim().toLowerCase();
    const hasQuery = query !== '';

    staticContainers.forEach((c) => {
      let finalColor;

      if (isHeatmapMode) {
        if (c.stackHeight >= 5) {
          finalColor = new THREE.Color('#ef4444').multiplyScalar(1.5); 
        } else if (c.stackHeight === 4) {
          finalColor = new THREE.Color('#f97316'); 
        } else if (c.stackHeight === 3) {
          finalColor = new THREE.Color('#eab308'); 
        } else {
          finalColor = new THREE.Color('#06b6d4').multiplyScalar(0.4); 
        }
      } else {
        const isSelected = selectedContainer && c.id === selectedContainer.id;
        if (isSelected) {
          finalColor = new THREE.Color('#ff0055'); 
        } else if (hasQuery) {
          const isMatched = c.id.toLowerCase().includes(query);
          if (isMatched) {
            finalColor = new THREE.Color('#fbbf24'); 
          } else {
            finalColor = new THREE.Color('#0f172a').multiplyScalar(0.25); 
          }
        } else {
          finalColor = containerColors[c.colorIndex];
        }
      }

      meshRef.current!.setColorAt(c.index, finalColor);
    });

    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [searchQuery, selectedContainer, isHeatmapMode, staticContainers]);

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[boxGeometry, textMaterial, CONTAINER_COUNT]} 
      castShadow 
      receiveShadow
      matrixAutoUpdate={false}
      onClick={(e) => {
        e.stopPropagation(); 
        if (e.instanceId !== undefined && containerDataMapRef.current[e.instanceId]) {
          
          // 🚀 [THE ULTIMATE ZERO-DELAY TRICK]
          // React එක අප්ඩේට් වෙනකන් ඉන්නේ නැතුව ක්ලික් කරපු තත්ත්පරයෙන්ම 
          // මේ ෆ්‍රේම් එකේම පෙට්ටිය කෙලින්ම රතු (#ff0055) කරනවා මචන්!
          const instantRed = new THREE.Color('#ff0055');
          meshRef.current!.setColorAt(e.instanceId, instantRed);
          if (meshRef.current!.instanceColor) {
            meshRef.current!.instanceColor.needsUpdate = true;
          }

          // ඊට පස්සේ සාමාන්‍ය විදිහට React State එකට දත්ත යවනවා
          onSelectContainer(containerDataMapRef.current[e.instanceId]); 
        }
      }}
    />
  );
}