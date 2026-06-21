'use client';

import * as THREE from 'three';

export default function PortRoads() {
  // =========================================================
  // 🛠️ පාරේ දිග, පළල සහ උස වෙනස් කරන තැන (මෙතන විතරක් වෙනස් කරන්න) 🛠️
  // =========================================================
  const ROAD_HEIGHT = 0.5;    // ⬆️ පාරේ උස (පොළොවෙන් කොච්චර උඩින්ද තියෙන්නේ. උදා: 3.5)
  const ROAD_WIDTH = 10;      // ↔️ පාරේ පළල (ට්‍රක් එකට යන්න පුළුවන් ගාන)
  const ROAD_THICKNESS = 0.5; // ↕️ තාර තට්ටුවේ ඝනකම

  // 📍 පාරවල් වල සීමාවන් (Border positions - පාරේ දිග හදන්න මේවා වෙනස් කරන්න)
  const LEFT_X = -60;  // ⬅️ වම් පාර තියෙන තැන (කන්ටේනර් වල වදිනවා නම් මේක තවත් අඩු කරන්න, උදා: -130)
  const RIGHT_X = 71;   // ➡️ දකුණු පාර තියෙන තැන
  const FRONT_Z = 200;   // ⬇️ ඉදිරිපස පාර (මුහුද පැත්තේ)
  const BACK_Z = -210;  // ⬆️ පිටුපස පාර (කන්ටේනර් යාරඩ් එක අග)

  // ---------------------------------------------------------
  // ⚠️ (පහළ තියෙන ටික ඔටෝමැටික් ගණනය වේ, වෙනස් කිරීමට අවශ්‍ය නැත)
  // ---------------------------------------------------------
  const HORIZONTAL_LENGTH = RIGHT_X - LEFT_X + ROAD_WIDTH;
  const VERTICAL_LENGTH = FRONT_Z - BACK_Z;
  const CENTER_X = (LEFT_X + RIGHT_X) / 2;
  const CENTER_Z = (FRONT_Z + BACK_Z) / 2;
  const Y_POS = ROAD_HEIGHT;

  // කොන්ක්‍රීට් කණු පිහිටන ස්ථාන
  const pillarZPositions = [55, 10, -35, -80, -125, -170, -210];

  return (
    <group>
      {/* 🛣️ තාර පාරවල් 4 (Asphalt Tracks) */}
      <mesh position={[CENTER_X, Y_POS, FRONT_Z]} receiveShadow>
        <boxGeometry args={[HORIZONTAL_LENGTH, ROAD_THICKNESS, ROAD_WIDTH]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh position={[CENTER_X, Y_POS, BACK_Z]} receiveShadow>
        <boxGeometry args={[HORIZONTAL_LENGTH, ROAD_THICKNESS, ROAD_WIDTH]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh position={[LEFT_X, Y_POS, CENTER_Z]} receiveShadow>
        <boxGeometry args={[ROAD_WIDTH, ROAD_THICKNESS, VERTICAL_LENGTH]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh position={[RIGHT_X, Y_POS, CENTER_Z]} receiveShadow>
        <boxGeometry args={[ROAD_WIDTH, ROAD_THICKNESS, VERTICAL_LENGTH]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* 💛 කහ පාට ආරක්ශිත ඉරි (Yellow Safety Lines) */}
      <mesh position={[CENTER_X, Y_POS + ROAD_THICKNESS/2 + 0.01, FRONT_Z + ROAD_WIDTH/2 - 0.2]}>
        <boxGeometry args={[HORIZONTAL_LENGTH, 0.02, 0.15]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[CENTER_X, Y_POS + ROAD_THICKNESS/2 + 0.01, FRONT_Z - ROAD_WIDTH/2 + 0.2]}>
        <boxGeometry args={[HORIZONTAL_LENGTH, 0.02, 0.15]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.5} />
      </mesh>
      
      <mesh position={[CENTER_X, Y_POS + ROAD_THICKNESS/2 + 0.01, BACK_Z + ROAD_WIDTH/2 - 0.2]}>
        <boxGeometry args={[HORIZONTAL_LENGTH, 0.02, 0.15]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[CENTER_X, Y_POS + ROAD_THICKNESS/2 + 0.01, BACK_Z - ROAD_WIDTH/2 + 0.2]}>
        <boxGeometry args={[HORIZONTAL_LENGTH, 0.02, 0.15]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.5} />
      </mesh>

      <mesh position={[LEFT_X + ROAD_WIDTH/2 - 0.2, Y_POS + ROAD_THICKNESS/2 + 0.01, CENTER_Z]}>
        <boxGeometry args={[0.15, 0.02, VERTICAL_LENGTH]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[LEFT_X - ROAD_WIDTH/2 + 0.2, Y_POS + ROAD_THICKNESS/2 + 0.01, CENTER_Z]}>
        <boxGeometry args={[0.15, 0.02, VERTICAL_LENGTH]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.5} />
      </mesh>

      <mesh position={[RIGHT_X + ROAD_WIDTH/2 - 0.2, Y_POS + ROAD_THICKNESS/2 + 0.01, CENTER_Z]}>
        <boxGeometry args={[0.15, 0.02, VERTICAL_LENGTH]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[RIGHT_X - ROAD_WIDTH/2 + 0.2, Y_POS + ROAD_THICKNESS/2 + 0.01, CENTER_Z]}>
        <boxGeometry args={[0.15, 0.02, VERTICAL_LENGTH]} />
        <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={1.5} />
      </mesh>

      {/* 🏛️ පාර ඔසවා තබන කොන්ක්‍රීට් කණු (Concrete Pillars) */}
      {[LEFT_X, RIGHT_X].map((x) => 
        pillarZPositions.map((z) => (
          <mesh key={`pillar-${x}-${z}`} position={[x, ROAD_HEIGHT / 2, z]} castShadow receiveShadow>
            <cylinderGeometry args={[1.2, 1.8, ROAD_HEIGHT, 16]} />
            <meshStandardMaterial color="#64748b" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
}