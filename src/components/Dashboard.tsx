import React, { useState, useEffect } from 'react';
import { Target, Maximize, Sliders, Activity, Info, Eye, EyeOff, Layers, Ruler } from 'lucide-react';
import Joystick from './Joystick';
import earthImg from '../assets/earth.png';
import proximaImg from '../assets/proxima_b.png';
import trappistImg from '../assets/trappist_1e.png';
import keplerImg from '../assets/kepler_186f.png';

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
  inversionMode: boolean;
  setInversionMode: (m: boolean) => void;
  cameraMode: 'auto' | 'birds-eye';
  setCameraMode: (m: 'auto' | 'birds-eye') => void;
}

const targets = [
  { id: 'proxima-b', name: 'Proxima Centauri b', dist: '4.24 ly' },
  { id: 'sirius', name: 'Sirius A', dist: '8.6 ly' },
  { id: 'trappist-1e', name: 'TRAPPIST-1e', dist: '39.6 ly' },
  { id: 'kepler-186f', name: 'Kepler-186f', dist: '582 ly' }
];

const Dashboard: React.FC<DashboardProps> = ({
  distance, setDistance, lateralOffset, setLateralOffset, target, setTarget, trueScale, setTrueScale, satellites, setSatellites, showLightYears, setShowLightYears, inversionMode, setInversionMode, cameraMode, setCameraMode
}) => {
  
  const AU_PER_LY = 63241;
  // If inversion mode, the target star is the lens. Proxima's focal start is ~95 AU. Sirius is ~760 AU. Trappist is ~85 AU. Kepler is ~550 AU.
  const alienFocalStart = target === 'proxima-b' ? 95 : target === 'sirius' ? 760 : target === 'trappist-1e' ? 85 : 550;
  const currentFocalStart = inversionMode ? alienFocalStart : 542;
  
  // Auto-snap distance so image is at least partially visible when switching targets
  useEffect(() => {
    if (distance < currentFocalStart) {
      setDistance(currentFocalStart + 20); // Push just past the focal line to resolve the image
    }
  }, [target, inversionMode, currentFocalStart, distance, setDistance]);
  
  // Quality Calculation (0 to 1)
  const inFocus = distance >= currentFocalStart;
  const focusFactor = inFocus ? Math.min(1.0, 0.8 + ((distance - currentFocalStart) / (1500 - currentFocalStart)) * 0.2) : 0;
  const satFactor = (satellites / 100); // 1 = 1%, 100 = 100%
  const offsetErr = Math.sqrt(lateralOffset.x * lateralOffset.x + lateralOffset.y * lateralOffset.y);
  const alignFactor = Math.max(0, 1.0 - offsetErr); 
  
  const quality = inFocus ? (focusFactor * satFactor * alignFactor) : 0;
  const qualityPercent = (quality * 100).toFixed(1);

  const activeTarget = targets.find(t => t.id === target);
  
  const [showInfo, setShowInfo] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

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

      <aside className={`controls-sidebar ${leftOpen ? '' : 'collapsed'}`}>
        <div className="glass-panel" style={{ padding: '0 16px' }}>
          <div className="control-group">
            <details open>
              <summary>
                <span className="summary-title">
                  <Target size={18} /> Target Selection
                </span>
              </summary>
              <div className="details-content">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-24px', marginBottom: '8px' }}>
                  <button 
                    onClick={() => setShowLightYears(!showLightYears)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                  >
                    <Ruler size={14} /> {showLightYears ? 'LY' : 'AU'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button 
                    onClick={() => setInversionMode(!inversionMode)}
                    style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: inversionMode ? 'var(--accent)' : 'var(--panel-bg)', color: inversionMode ? '#000' : 'var(--text)', border: '1px solid var(--panel-border)', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {inversionMode ? 'Alien Lens Mode' : 'Earth Lens Mode'}
                  </button>
                  <button 
                    onClick={() => setCameraMode(cameraMode === 'auto' ? 'birds-eye' : 'auto')}
                    style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: cameraMode === 'birds-eye' ? 'var(--accent)' : 'var(--panel-bg)', color: cameraMode === 'birds-eye' ? '#000' : 'var(--text)', border: '1px solid var(--panel-border)', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Bird's Eye View
                  </button>
                </div>
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
            </details>
          </div>

          <div className="control-group">
            <details open>
              <summary>
                <span className="summary-title">
                  <Sliders size={18} /> Scale & Optics
                </span>
              </summary>
              <div className="details-content">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-24px', marginBottom: '8px' }}>
                  <button 
                    onClick={() => setTrueScale(!trueScale)}
                    style={{ background: 'none', border: 'none', color: trueScale ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                  >
                    {trueScale ? <Eye size={14} /> : <EyeOff size={14} />} {trueScale ? 'True Scale' : 'Compact Scale'}
                  </button>
                </div>
                <div className="slider-container">
                  <div className="slider-header">
                    <span>Observation Distance</span>
                    <span className="slider-value">{displayDist}</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="1500" 
                    value={distance} 
                    onChange={(e) => setDistance(parseInt(e.target.value))} 
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Focal line starts at {showLightYears ? `${(currentFocalStart / AU_PER_LY).toFixed(4)} ly` : `${currentFocalStart} AU`}.
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
            </details>
          </div>

          <div className="control-group" style={{ paddingBottom: '16px' }}>
            <details open>
              <summary>
                <span className="summary-title"><Activity size={18} /> Reconstructed Image</span>
              </summary>
              <div className="details-content">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-24px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: quality > 0.8 ? '#10b981' : quality > 0.2 ? '#f59e0b' : '#ef4444' }}>
                    {quality > 0.8 ? 'High Res' : quality > 0.2 ? 'Partial Res' : inFocus ? 'Low Signal' : 'Sub-focal'}
                  </span>
                </div>
                <div style={{
                  width: '100%', height: '140px', background: '#000', borderRadius: '8px',
                  position: 'relative', overflow: 'hidden', border: '1px solid var(--panel-border)',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      background: inversionMode ? `url(${earthImg})` :
                                  target === 'proxima-b' ? `url(${proximaImg})` : 
                                  target === 'trappist-1e' ? `url(${trappistImg})` : 
                                  target === 'sirius' ? 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sirius_A_and_B_artwork.jpg/320px-Sirius_A_and_B_artwork.jpg)' :
                                  `url(${keplerImg})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: `0 0 ${20 * quality}px rgba(255,255,255,${quality * 0.5})`,
                      filter: `blur(${Math.max(0, 15 - (quality * 15))}px)`,
                      opacity: 0.1 + (quality * 0.9),
                      transition: 'all 0.2s ease-out'
                    }}></div>
                  </div>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '10px 10px', pointerEvents: 'none'
                  }}></div>
                </div>
                
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {inversionMode ? (
                    <>
                      <strong>Alien SGL Lore:</strong><br/>
                      Because their stars have different masses and radii, the focal line starts at a different distance! 
                      {target === 'proxima-b' && ' Proxima is a small red dwarf, so its focal line starts at just ~95 AU! Much easier for them to build this telescope.'}
                      {target === 'trappist-1e' && ' TRAPPIST-1 is tiny, so its focal line starts at just ~85 AU!'}
                      {target === 'sirius' && ' Sirius A is a massive, bright star. Its focal line starts much further out at ~760 AU!'}
                    </>
                  ) : (
                    <>
                      <strong>Expected Planetary Profile:</strong><br/>
                      {target === 'proxima-b' && "Likely rocky. Potentially tidally locked (an 'eyeball planet' with a molten day-side and frozen night-side)."}
                      {target === 'trappist-1e' && "Rocky world in the habitable zone. Highly likely to contain a liquid water ocean and thick Earth-like atmosphere."}
                      {target === 'sirius' && "Sirius A is a massive young star. It has no known exoplanets, but we would look for young, molten protoplanets."}
                      {target === 'kepler-186f' && "Earth-sized rocky planet. Orbits a red dwarf, meaning any potential plant life would likely appear red or black to absorb the dim light."}
                    </>
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>
        
        {/* Left Toggle Button */}
        <button 
          onClick={() => setLeftOpen(!leftOpen)}
          style={{ position: 'absolute', top: '16px', right: '-40px', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '0 8px 8px 0', padding: '8px', color: 'var(--accent)', cursor: 'pointer', pointerEvents: 'auto' }}
        >
          {leftOpen ? '◀' : '▶'}
        </button>
      </aside>

      <aside className={`right-sidebar ${rightOpen ? '' : 'collapsed'}`}>
        <div className="glass-panel" style={{ padding: '0 16px' }}>
          <div className="control-group">
            <details open>
              <summary>
                <span className="summary-title"><Maximize size={18} /> Focal Plane Scanning</span>
              </summary>
              <div className="details-content">
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  The telescope must physically scan the 1-meter wide focal plane pixel-by-pixel. Use this joystick to perfectly center the telescope on the X/Y focal axis (0,0). Even slight drift will blur the reconstruction.
                </p>
                <Joystick onChange={setLateralOffset} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                  <span style={{ color: Math.abs(lateralOffset.x) > 0.5 ? '#ef4444' : 'inherit' }}>X Drift: {lateralOffset.x.toFixed(2)}m</span>
                  <span style={{ color: Math.abs(lateralOffset.y) > 0.5 ? '#ef4444' : 'inherit' }}>Y Drift: {lateralOffset.y.toFixed(2)}m</span>
                </div>
              </div>
            </details>
          </div>

          <div className="control-group" style={{ paddingBottom: '16px' }}>
            <details open>
              <summary>
                <span className="summary-title"><Activity size={18} /> Telemetry</span>
              </summary>
              <div className="details-content">
                <div className="telemetry-item">
                  <span className="telemetry-label">Status</span>
                  <span className="telemetry-value telemetry-good">{inFocus ? 'ONLINE' : 'SUB-FOCAL'}</span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-label">Target</span>
                  <span className="telemetry-value">{activeTarget?.name}</span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-label">Distance from {inversionMode ? 'Target Star' : 'Sun'}</span>
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
            </details>
          </div>
        </div>
        
        {/* Right Toggle Button */}
        <button 
          onClick={() => setRightOpen(!rightOpen)}
          style={{ position: 'absolute', top: '16px', left: '-40px', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '8px 0 0 8px', padding: '8px', color: 'var(--accent)', cursor: 'pointer', pointerEvents: 'auto' }}
        >
          {rightOpen ? '▶' : '◀'}
        </button>
      </aside>
      {/* Floating Info Toggle */}
      <div style={{ position: 'absolute', bottom: '24px', right: '340px', pointerEvents: 'auto' }}>
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
