import React, { useState } from 'react';
import { Target, Maximize, Sliders, Activity, Info, Eye, EyeOff, Layers, Ruler } from 'lucide-react';
import Joystick from './Joystick';

interface DashboardProps {
  distance: number;
  setDistance: (d: number) => void;
  lateralOffset: { x: number, y: number };
  setLateralOffset: (pos: { x: number, y: number }) => void;
  target: string;
  setTarget: (t: string) => void;
  trueScale: boolean;
  setTrueScale: (e: boolean) => void;
  satellites: number;
  setSatellites: (s: number) => void;
  showLightYears: boolean;
  setShowLightYears: (s: boolean) => void;
}

const targets = [
  { id: 'proxima-b', name: 'Proxima Centauri b', dist: '4.24 ly' },
  { id: 'trappist-1e', name: 'TRAPPIST-1e', dist: '39.6 ly' },
  { id: 'kepler-186f', name: 'Kepler-186f', dist: '582 ly' }
];

const Dashboard: React.FC<DashboardProps> = ({
  distance, setDistance, lateralOffset, setLateralOffset, target, setTarget, trueScale, setTrueScale, satellites, setSatellites, showLightYears, setShowLightYears
}) => {
  
  // Quality Calculation (0 to 1)
  const inFocus = distance >= 542;
  const focusFactor = inFocus ? Math.min(1.0, 0.8 + ((distance - 542) / (900 - 542)) * 0.2) : 0;
  const satFactor = (satellites / 100); // 1 = 1%, 100 = 100%
  const offsetErr = Math.sqrt(lateralOffset.x * lateralOffset.x + lateralOffset.y * lateralOffset.y);
  const alignFactor = Math.max(0, 1.0 - offsetErr); 
  
  const quality = inFocus ? (focusFactor * satFactor * alignFactor) : 0;
  const qualityPercent = (quality * 100).toFixed(1);

  const activeTarget = targets.find(t => t.id === target);
  
  const [showInfo, setShowInfo] = useState(false);

  const AU_PER_LY = 63241;
  const displayDist = showLightYears ? `${(distance / AU_PER_LY).toFixed(4)} ly` : `${distance} AU`;
  const formatDist = (distLy: number) => showLightYears ? `${distLy} ly` : `${Math.round(distLy * AU_PER_LY).toLocaleString()} AU`;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="title-card glass-panel glass-panel-accent">
          <h1>SGL Telescope</h1>
          <p>Solar Gravitational Lens Simulator</p>
        </div>
      </header>

      <aside className="controls-sidebar">
        <div className="glass-panel control-group">
          <h3 style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} /> Target Selection
            </span>
            <button 
              onClick={() => setShowLightYears(!showLightYears)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
            >
              <Ruler size={14} /> {showLightYears ? 'LY' : 'AU'}
            </button>
          </h3>
          <div className="target-selector">
            {targets.map(t => (
              <button 
                key={t.id} 
                className={`target-btn ${target === t.id ? 'active' : ''}`}
                onClick={() => setTarget(t.id)}
              >
                <strong>{t.name}</strong>
                <span style={{ float: 'right', opacity: 0.7 }}>{formatDist(parseFloat(t.dist))}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel control-group">
          <h3 style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} /> Scale & Optics
            </span>
            <button 
              onClick={() => setTrueScale(!trueScale)}
              style={{ background: 'none', border: 'none', color: trueScale ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
            >
              {trueScale ? <Eye size={14} /> : <EyeOff size={14} />} {trueScale ? 'True Scale' : 'Compact Scale'}
            </button>
          </h3>
          
          <div className="slider-container">
            <div className="slider-header">
              <span>Observation Distance</span>
              <span className="slider-value">{displayDist}</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="900" 
              value={distance} 
              onChange={(e) => setDistance(parseInt(e.target.value))} 
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Focal line starts at {showLightYears ? `${(542 / AU_PER_LY).toFixed(4)} ly` : '542 AU'}.
            </span>
          </div>

          <div className="slider-container" style={{ marginTop: '12px' }}>
            <div className="slider-header">
              <span><Layers size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> String of Pearls</span>
              <span className="slider-value">{satellites}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={satellites} 
              onChange={(e) => setSatellites(parseInt(e.target.value))} 
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              More satellites = better image reconstruction.
            </span>
          </div>
        </div>

        <div className="glass-panel control-group">
          <h3><Maximize size={18} /> Satellite Alignment</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            Lateral scan of the image plane. Keep perfectly centered (0,0) to perfectly reconstruct the image.
          </p>
          <Joystick onChange={setLateralOffset} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'monospace' }}>
            <span style={{ color: Math.abs(lateralOffset.x) > 0.5 ? '#ef4444' : 'inherit' }}>X: {lateralOffset.x.toFixed(2)}m</span>
            <span style={{ color: Math.abs(lateralOffset.y) > 0.5 ? '#ef4444' : 'inherit' }}>Y: {lateralOffset.y.toFixed(2)}m</span>
          </div>
        </div>

        <div className="glass-panel control-group" style={{ paddingBottom: '24px' }}>
          <h3 style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Reconstructed Image</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: quality > 0.8 ? '#10b981' : quality > 0.2 ? '#f59e0b' : '#ef4444' }}>
              {quality > 0.8 ? 'High Res' : quality > 0.2 ? 'Partial Res' : inFocus ? 'Low Signal' : 'Sub-focal'}
            </span>
          </h3>
          
          <div style={{
            width: '100%', height: '140px', background: '#000', borderRadius: '8px',
            position: 'relative', overflow: 'hidden', border: '1px solid var(--panel-border)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
          }}>
            
            {/* The blurred/resolved planet image based on quality */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: target === 'proxima-b' ? 'url(/proxima_b.png)' : 
                            target === 'trappist-1e' ? 'url(/trappist_1e.png)' : 
                            'url(/kepler_186f.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: `0 0 ${20 * quality}px rgba(255,255,255,${quality * 0.5})`,
                // Calculate blur and opacity
                filter: `blur(${Math.max(0, 15 - (quality * 15))}px)`,
                opacity: 0.1 + (quality * 0.9),
                transition: 'all 0.2s ease-out'
              }}></div>
            </div>
            
            {/* Grid overlay */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '10px 10px', pointerEvents: 'none'
            }}></div>
          </div>
          
          <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong>Expected Planetary Profile:</strong><br/>
            {target === 'proxima-b' && "Likely rocky. Potentially tidally locked (an 'eyeball planet' with a molten day-side and frozen night-side)."}
            {target === 'trappist-1e' && "Rocky world in the habitable zone. Highly likely to contain a liquid water ocean and thick Earth-like atmosphere."}
            {target === 'kepler-186f' && "Earth-sized rocky planet. Orbits a red dwarf, meaning any potential plant life would likely appear red or black to absorb the dim light."}
          </div>
        </div>
      </aside>

      <div className="telemetry-panel glass-panel glass-panel-accent">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px' }}>
          <Activity size={18} /> Telemetry
        </h3>
        
        <div className="telemetry-item">
          <span className="telemetry-label">Status</span>
          <span className="telemetry-value telemetry-good">{inFocus ? 'ONLINE' : 'SUB-FOCAL'}</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Target</span>
          <span className="telemetry-value">{activeTarget?.name}</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Distance from Sun</span>
          <span className="telemetry-value">{displayDist}</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">Image Quality</span>
          <span className={`telemetry-value ${quality > 0.5 ? 'telemetry-good' : 'telemetry-warn'}`}>{qualityPercent}%</span>
        </div>
        <div className="telemetry-item" style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px dashed var(--panel-border)' }}>
          <span className="telemetry-label">Magnification</span>
          <span className="telemetry-value" style={{ color: 'var(--accent)' }}>~100 Billion x</span>
        </div>
      </div>
      
      {/* Floating Info Toggle */}
      <div style={{ position: 'absolute', bottom: '24px', right: '360px', pointerEvents: 'auto' }}>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
        >
          <Info size={20} />
        </button>
        
        {showInfo && (
          <div className="glass-panel" style={{ position: 'absolute', bottom: '50px', right: '0', width: '250px', padding: '16px', zIndex: 50 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem' }}>
              Why not our Solar System?
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              The Sun's focal line begins at ~542 AU and extends outward. It only focuses light from sources <strong>behind</strong> the Sun. Objects within our solar system are too close to be magnified by the SGL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
