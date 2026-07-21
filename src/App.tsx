import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import Dashboard from './components/Dashboard';
import SimulationScene from './components/SimulationScene';

function App() {
  const [distance, setDistance] = useState(550); // 550 to 900 AU
  const [lateralOffset, setLateralOffset] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState('proxima-b');
  const [trueScale, setTrueScale] = useState(false);
  const [satellites, setSatellites] = useState(1);
  const [showLightYears, setShowLightYears] = useState(false);
  const [inversionMode, setInversionMode] = useState(false);
  const [cameraMode, setCameraMode] = useState<'auto' | 'birds-eye'>('auto');

  // We use a scaled coordinate system. 1 unit = 10 AU.
  // Sun is at x=0. Focal line starts at x=55, goes to x=90.
  // We want to center the view around x=40.

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#030712' }}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[40, 30, 70]} fov={50} far={200000} />
          <color attach="background" args={['#030712']} />
          <Stars radius={300000} depth={1000} count={10000} factor={10} saturation={0} fade speed={1} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} />
          
          <SimulationScene 
            distance={distance} 
            lateralOffset={lateralOffset} 
            target={target} 
            trueScale={trueScale}
            satellites={satellites}
            showLightYears={showLightYears}
            inversionMode={inversionMode}
            cameraMode={cameraMode}
          />
          
          <OrbitControls 
            makeDefault
            target={[40, 0, 0]} 
            enableZoom={true} 
            enablePan={true} 
            maxPolarAngle={cameraMode === 'birds-eye' ? 0 : Math.PI / 2} 
            minPolarAngle={0} 
          />
        </Canvas>
      </div>

      <Dashboard 
        distance={distance} setDistance={setDistance}
        lateralOffset={lateralOffset} setLateralOffset={setLateralOffset}
        target={target} setTarget={setTarget}
        trueScale={trueScale} setTrueScale={setTrueScale}
        satellites={satellites} setSatellites={setSatellites}
        showLightYears={showLightYears} setShowLightYears={setShowLightYears}
        inversionMode={inversionMode} setInversionMode={setInversionMode}
        cameraMode={cameraMode} setCameraMode={setCameraMode}
      />
    </>
  );
}

export default App;
