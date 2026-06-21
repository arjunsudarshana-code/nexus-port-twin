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

  useEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    let index = 0;
    const tempMap: any[] = [];

    const containerColors = [
      new THREE.Color('#0f172a'), 
      new THREE.Color('#1e293b'), 
      new THREE.Color('#0284c7'), 
      new THREE.Color('#0d9488'), 
    ];

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
          if (isAlleyPath) {
            continue; 
          }

          dummy.position.set(posX, posY, posZ);
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(index, dummy.matrix);

          const containerId = `CT-${x.toString().padStart(2, '0')}${z.toString().padStart(2, '0')}-${y}`;
          const weightVal = ((x * 3 + z * 7 + y * 11) % 15 + 18).toFixed(1); 
          
          tempMap[index] = {
            id: containerId,
            weight: `${weightVal} Tons`,
            content: cargoTypes[(x + z + y) % cargoTypes.length],
            destination: destinations[(x * 2 + z) % destinations.length],
            status: y === stackHeight - 1 ? "Top Tier // Ready" : "Stowed Below",
            bayCoordinates: `BAY [Row: ${x}, Col: ${z}, Tier: ${y}]`,
            position: [posX, posY, posZ]
          };

          const colorIdx = (x * 7 + z * 13 + y * 3) % containerColors.length;
          let finalColor = containerColors[colorIdx];

          if (isHeatmapMode) {
            if (stackHeight >= 5) {
              finalColor = new THREE.Color('#ef4444').multiplyScalar(1.5); 
            } else if (stackHeight === 4) {
              finalColor = new THREE.Color('#f97316'); 
            } else if (stackHeight === 3) {
              finalColor = new THREE.Color('#eab308'); 
            } else {
              finalColor = new THREE.Color('#06b6d4').multiplyScalar(0.4); 
            }
          } else {
            const isSelected = selectedContainer && containerId === selectedContainer.id;
            if (isSelected) {
              finalColor = new THREE.Color('#ff0055'); 
            } else if (searchQuery.trim() !== '') {
              const isMatched = containerId.toLowerCase().includes(searchQuery.toLowerCase().trim());
              if (isMatched) {
                finalColor = new THREE.Color('#fbbf24'); 
              } else {
                finalColor = new THREE.Color('#0f172a').multiplyScalar(0.25); 
              }
            }
          }

          meshRef.current.setColorAt(index, finalColor);
          index++;
        }
      }
    }

    meshRef.current.count = index;
    containerDataMapRef.current = tempMap; 

    meshRef.current.geometry.computeBoundingBox();
    meshRef.current.geometry.computeBoundingSphere();
    
    meshRef.current.boundingBox = new THREE.Box3(
      new THREE.Vector3(-200, -50, -400),
      new THREE.Vector3(200, 150, 400)
    );
    meshRef.current.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 600);

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [searchQuery, selectedContainer, isHeatmapMode]); 

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[boxGeometry, textMaterial, CONTAINER_COUNT]} 
      castShadow 
      receiveShadow
      // 🚀 [PERFORMANCE MATRIX FIX] Static mesh එකක් නිසා අනවශ්‍ය පර්ෆ්‍රේම් ලූප්ස් නැවැත්තුවා මචන්!
      matrixAutoUpdate={false}
      onClick={(e) => {
        e.stopPropagation(); 
        if (e.instanceId !== undefined && containerDataMapRef.current[e.instanceId]) {
          onSelectContainer(containerDataMapRef.current[e.instanceId]); 
        }
      }}
    />
  );
}