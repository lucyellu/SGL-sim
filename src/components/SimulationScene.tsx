import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Sphere, Line, Html } from '@react-three/drei';

interface SimulationSceneProps {
  distance: number;
  lateralOffset: { x: number, y: number };
  target: string;
  trueScale: boolean;
  satellites: number;
  showLightYears: boolean;
  inversionMode: boolean;
  cameraMode: 'auto' | 'birds-eye';
}

const targetsInfo = [
  { id: 'proxima-b', name: 'Proxima b', distLy: 4.24, color: '#38bdf8', orbitAngle: 217 * Math.PI / 180 },
  { id: 'sirius', name: 'Sirius A', distLy: 8.6, color: '#facc15', orbitAngle: 101 * Math.PI / 180 },
  { id: 'trappist-1e', name: 'TRAPPIST-1e', distLy: 39.6, color: '#ef4444', orbitAngle: 346 * Math.PI / 180 },
  { id: 'kepler-186f', name: 'Kepler-186f', distLy: 582, color: '#10b981', orbitAngle: 298 * Math.PI / 180 }
];

const SimulationScene: React.FC<SimulationSceneProps> = ({ distance, lateralOffset, target, trueScale, satellites, showLightYears, inversionMode, cameraMode }) => {
  const telescopeRef = useRef<THREE.Group>(null);
  const sunGlowRef = useRef<THREE.Mesh>(null);
  const universeRef = useRef<THREE.Group>(null);

  const AU_PER_LY = 63241;
  
  const { camera, controls } = useThree();

  const activeTargetData = targetsInfo.find(t => t.id === target) || targetsInfo[0];

  const lyScale = trueScale ? 100 : 1; 

  const getScaledDist = (distLy: number) => {
    // In true scale: 100 units per ly.
    // In compact scale: logarithmic compression so they all fit closely in a nice ring.
    return trueScale ? distLy * 100 : (Math.log10(distLy + 1) * 30 + 30);
  };
  
  // In True Scale: 1 ly = 100 units. So we convert AU to ly, then multiply by 100.
  // In Compact Scale: 1 unit = 10 AU.
  const auScale = trueScale ? (100 / AU_PER_LY) : 0.1;
  const scaledDistance = distance * auScale;
  
  const alienFocalStart = target === 'proxima-b' ? 95 : target === 'sirius' ? 760 : target === 'trappist-1e' ? 85 : 550;
  const currentFocalStart = inversionMode ? alienFocalStart : 542;
  const focalStart = currentFocalStart * auScale; 

  // If zoomed out past 10 lightyears in trueScale, the inner solar system labels will overlap with the Sun.
  const isExtremeZoom = trueScale && activeTargetData.distLy > 10;
  const showLocalLabels = !isExtremeZoom;

  // Snap Camera when target or scale changes
  useEffect(() => {
    const dist = getScaledDist(activeTargetData.distLy);
    
    // In Normal Mode: The active target is at X = -dist. The sun is at 0. Telescope is at +scaledDistance.
    // In Inversion Mode: The sun is at X = -dist. The target is at 0. Telescope is at +scaledDistance.
    // Midpoint to frame the entire span (from -dist to +scaledDistance):
    let midX = (-dist + scaledDistance) / 2;
    
    let camZ = Math.max(150, dist * 1.2);
    let camY = Math.max(50, dist * 0.5);
    
    if (cameraMode === 'birds-eye') {
      midX = 0; // Look at center
      camY = trueScale ? Math.max(1000, dist * 1.2) : 250; // High up
      camZ = 0.1; // Straight down
    }
    
    // Animate camera (or snap)
    camera.position.set(midX, camY, camZ);
    camera.lookAt(midX, 0, 0);
    
    if (controls) {
      (controls as any).target.set(midX, 0, 0);
      (controls as any).update();
    }
  }, [target, trueScale, lyScale, camera, controls]);

  const lightRays = useMemo(() => {
    const rays = [];
    const numRays = 16;
    const startX = -getScaledDist(activeTargetData.distLy);
    
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2;
      const radiusOffset = 2.5; 
      
      const pY = Math.sin(angle) * radiusOffset;
      const pZ = Math.cos(angle) * radiusOffset;
      
      const points = [
        new THREE.Vector3(startX, pY * (trueScale ? 100 : 10), pZ * (trueScale ? 100 : 10)), 
        new THREE.Vector3(0, pY, pZ),             
        new THREE.Vector3(focalStart, 0, 0),      
        new THREE.Vector3(120, -pY * 1.2, -pZ * 1.2) 
      ];
      
      const curve = new THREE.CatmullRomCurve3(points);
      rays.push(curve.getPoints(50));
    }
    return rays;
  }, [activeTargetData, lyScale, trueScale]);

  useFrame(({ clock }) => {
    if (sunGlowRef.current) {
      const scale = 1.0 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
      sunGlowRef.current.scale.set(scale, scale, scale);
    }
    
    if (telescopeRef.current) {
      telescopeRef.current.position.set(scaledDistance, lateralOffset.y * 2, lateralOffset.x * 2);
    }
    
    if (universeRef.current) {
      const targetRotation = inversionMode 
        ? -activeTargetData.orbitAngle + Math.PI 
        : -activeTargetData.orbitAngle;
      
      const currentRotation = universeRef.current.rotation.y;
      const newRot = THREE.MathUtils.lerp(currentRotation, targetRotation, 0.05);
      universeRef.current.rotation.y = newRot;
      
      const targetTranslateX = inversionMode ? -getScaledDist(activeTargetData.distLy) : 0;
      universeRef.current.position.x = THREE.MathUtils.lerp(universeRef.current.position.x, targetTranslateX, 0.05);
    }
  });

  return (
    <group>
      <gridHelper args={[trueScale ? 200000 : 2000, trueScale ? 1000 : 20, 0x111111, 0x111111]} position={[0, -20, 0]} />

      <group position={[0, 0, 0]}>
        <Sphere ref={sunGlowRef} args={[3, 32, 32]}>
          <meshBasicMaterial color={inversionMode ? activeTargetData.color : "#fbbf24"} transparent opacity={0.3} />
        </Sphere>
        <Sphere args={[2.5, 32, 32]}>
          <meshBasicMaterial color={inversionMode ? activeTargetData.color : "#fbbf24"} />
        </Sphere>
        
        {showLocalLabels && (
          <Html center position={[0, 0, 0]}>
            <div style={{ color: '#ffffff', whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.8)', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translate(0, -50px)' }}>
              <div>{inversionMode ? activeTargetData.name : 'The Sun'}</div>
              <div style={{ width: '1px', height: '40px', background: `linear-gradient(to bottom, ${inversionMode ? activeTargetData.color : '#fbbf24'}, transparent)`, marginTop: '4px' }} />
            </div>
          </Html>
        )}
      </group>
      
      <group ref={universeRef}>
        {targetsInfo.map((t, index) => {
          const dist = getScaledDist(t.distLy);
          const x = -dist * Math.cos(t.orbitAngle);
          const z = dist * Math.sin(t.orbitAngle);
          
          const radius = trueScale ? Math.max(10, dist / 40) : 3;
          const isActive = t.id === target;
          
          return (
            <group key={t.id} position={[x, 0, z]}>
              <Sphere args={[radius, 32, 32]}>
                <meshBasicMaterial color={inversionMode && isActive ? "#3b82f6" : t.color} />
              </Sphere>
              
              {(!isExtremeZoom || isActive) && (
                <Html center position={[0, 0, 0]}>
                  <div style={{
                    color: inversionMode && isActive ? "#3b82f6" : t.color,
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transform: `translate(0, -${60 + index * 40}px)`,
                    opacity: isActive ? 1 : 0.6
                  }}>
                    <strong style={{ fontSize: '1rem', display: 'block' }}>{inversionMode && isActive ? 'Earth (Target)' : t.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {showLightYears ? `${t.distLy} ly` : `${Math.round(t.distLy * AU_PER_LY).toLocaleString()} AU`}
                    </span>
                    <div style={{ width: '1px', height: `${30 + index * 40}px`, background: `linear-gradient(to bottom, ${inversionMode && isActive ? '#3b82f6' : t.color}, transparent)`, marginTop: '4px' }} />
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>

      {lightRays.map((points, idx) => (
        <Line 
          key={idx}
          points={points}
          color={inversionMode ? "#3b82f6" : activeTargetData.color}
          lineWidth={1.5}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      ))}

      {/* Focal Line Marker */}
      <Line 
        points={[
          new THREE.Vector3(focalStart, 0, 0),
          new THREE.Vector3(100, 0, 0)
        ]}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.3}
      />
      
      {showLocalLabels && (
        <Html center position={[focalStart, 0, 0]}>
          <div style={{ color: '#ffffff', whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translate(0, -80px)' }}>
            <div>{showLightYears ? `${(currentFocalStart / AU_PER_LY).toFixed(4)} ly Focal Start` : `${currentFocalStart} AU Focal Start`}</div>
            <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, #ffffff, transparent)', marginTop: '4px' }} />
          </div>
        </Html>
      )}

      {/* The Telescope(s) */}
      <group ref={telescopeRef}>
        {Array.from({ length: satellites }).map((_, i) => (
          <group key={i} position={[i * 2, 0, 0]}>
            <Sphere args={[0.8, 16, 16]}>
              <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
            </Sphere>
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[0.1, 2, 0.1]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 1.5]} />
              <meshStandardMaterial color="#1d4ed8" side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
        
        {showLocalLabels && (
          <Html center position={[0, 0, 0]}>
            <div style={{ color: '#ffffff', whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.8)', fontWeight: 'bold', display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', transform: 'translate(0, 80px)' }}>
              <div>{satellites > 1 ? `${satellites}x SGL Satellites` : 'SGL Telescope'}</div>
              <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to top, #ffffff, transparent)', marginBottom: '4px' }} />
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

export default SimulationScene;
