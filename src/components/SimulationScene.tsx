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
}

const targetsInfo = [
  { id: 'proxima-b', name: 'Proxima b', distLy: 4.24, color: '#38bdf8', orbitAngle: 0 },
  { id: 'trappist-1e', name: 'TRAPPIST-1e', distLy: 39.6, color: '#ef4444', orbitAngle: (Math.PI * 2) / 3 },
  { id: 'kepler-186f', name: 'Kepler-186f', distLy: 582, color: '#10b981', orbitAngle: (Math.PI * 4) / 3 }
];

const SimulationScene: React.FC<SimulationSceneProps> = ({ distance, lateralOffset, target, trueScale, satellites, showLightYears }) => {
  const telescopeRef = useRef<THREE.Group>(null);
  const sunGlowRef = useRef<THREE.Mesh>(null);
  const universeRef = useRef<THREE.Group>(null);

  const AU_PER_LY = 63241;
  
  const { camera, controls } = useThree();

  const activeTargetData = targetsInfo.find(t => t.id === target) || targetsInfo[0];

  const lyScale = trueScale ? 100 : 10;
  
  // In True Scale: 1 ly = 100 units. So we convert AU to ly, then multiply by 100.
  // In Compact Scale: 1 unit = 10 AU.
  const auScale = trueScale ? (100 / AU_PER_LY) : 0.1;
  const scaledDistance = distance * auScale;
  const focalStart = 542 * auScale; 

  // If zoomed out past 10 lightyears in trueScale, the inner solar system labels will overlap with the Sun.
  const isExtremeZoom = trueScale && activeTargetData.distLy > 10;
  const showLocalLabels = !isExtremeZoom;

  // Snap Camera when target or scale changes
  useEffect(() => {
    const dist = activeTargetData.distLy * lyScale;
    
    // The active target is at X = -dist. The sun is at 0. The telescope is at +55.
    // Midpoint to frame the whole scene:
    const midX = -dist / 2;
    
    // Zoom out enough to see it all
    // If distance is huge, pull camera way back on Z and Y
    const camZ = Math.max(150, dist * 1.2);
    const camY = Math.max(50, dist * 0.5);
    
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
    const startX = -(activeTargetData.distLy * lyScale);
    
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
      // Smoothly rotate the universe so the active target aligns with -X axis (angle 0 relative to camera view)
      // We want the active target's orbitAngle to end up pointing at -X. 
      // If target is at orbitAngle, we rotate the universe by -orbitAngle.
      const targetRotation = -activeTargetData.orbitAngle;
      
      // Simple lerp for smooth transition
      const currentRotation = universeRef.current.rotation.y;
      // Handle shortest path rotation (wrap around Math.PI*2)
      let diff = targetRotation - currentRotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      
      universeRef.current.rotation.y += diff * 0.05;
    }
  });

  return (
    <group>
      {/* Background Grid for Scale */}
      <gridHelper args={[trueScale ? 200000 : 2000, trueScale ? 1000 : 20, 0x111111, 0x111111]} position={[0, -20, 0]} />

      {/* The Sun */}
      <group position={[0, 0, 0]}>
        <Sphere args={[2, 32, 32]}>
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </Sphere>
        <Sphere ref={sunGlowRef} args={[2.5, 32, 32]}>
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </Sphere>
        <Html center position={[0, 0, 0]}>
          <div style={{ color: '#fbbf24', whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.8)', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translate(0, -50px)' }}>
            <div>The Sun</div>
            <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #fbbf24, transparent)', marginTop: '4px' }} />
          </div>
        </Html>
      </group>
      
      {/* Earth */}
      <group position={[-1, 0, 0]}>
        <Sphere args={[0.3, 16, 16]}>
          <meshStandardMaterial color="#3b82f6" />
        </Sphere>
        {showLocalLabels && (
          <Html center position={[0, 0, 0]}>
            <div style={{ color: '#93c5fd', whiteSpace: 'nowrap', textShadow: '0 2px 10px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', transform: 'translate(0, 50px)' }}>
              <div>Earth (1 AU)</div>
              <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to top, #93c5fd, transparent)', marginBottom: '4px' }} />
            </div>
          </Html>
        )}
      </group>

      {/* The rotating universe containing the target exoplanets */}
      <group ref={universeRef}>
        {targetsInfo.map((t, index) => {
          const dist = t.distLy * lyScale;
          // Calculate position based on their assigned orbit angle
          const x = -dist * Math.cos(t.orbitAngle);
          const z = dist * Math.sin(t.orbitAngle);
          
          // Make it visible! If true scale, the body should be large enough to see from a distance.
          const radius = trueScale ? Math.max(10, dist / 40) : 3;
          const isActive = t.id === target;
          
          return (
            <group key={t.id} position={[x, 0, z]}>
              <Sphere args={[radius, 32, 32]}>
                <meshBasicMaterial color={t.color} />
              </Sphere>
              
              {(!isExtremeZoom || isActive) && (
                <Html center position={[0, 0, 0]}>
                  <div style={{
                    color: t.color,
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
                    <strong style={{ fontSize: '1rem', display: 'block' }}>{t.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {showLightYears ? `${t.distLy} ly` : `${Math.round(t.distLy * AU_PER_LY).toLocaleString()} AU`}
                    </span>
                    <div style={{ width: '1px', height: `${30 + index * 40}px`, background: `linear-gradient(to bottom, ${t.color}, transparent)`, marginTop: '4px' }} />
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>

      {/* Light Rays from the active target */}
      {lightRays.map((points, idx) => (
        <Line 
          key={idx}
          points={points}
          color={activeTargetData.color}
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
            <div>{showLightYears ? `${(542 / AU_PER_LY).toFixed(4)} ly Focal Start` : '542 AU Focal Start'}</div>
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
