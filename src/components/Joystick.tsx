import React, { useState, useEffect, useRef } from 'react';


interface JoystickProps {
  onChange: (val: {x: number, y: number}) => void;
}

const Joystick: React.FC<JoystickProps> = ({ onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleUp = () => {
      setActive(false);
      setPos({ x: 0, y: 0 });
      onChange({ x: 0, y: 0 });
    };
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, [onChange]);

  const handleMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!active || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDist = rect.width / 2 - 15; // 15 is knob radius

    let finalX = dx;
    let finalY = dy;

    if (distance > maxDist) {
      finalX = (dx / distance) * maxDist;
      finalY = (dy / distance) * maxDist;
    }

    setPos({ x: finalX, y: finalY });
    // Normalize -1 to 1
    onChange({ x: finalX / maxDist, y: -finalY / maxDist }); // invert Y for typical cartesian
  };

  useEffect(() => {
    if (active) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove);
    } else {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [active]);

  return (
    <div 
      className="joystick-container" 
      ref={containerRef}
      onMouseDown={(e) => { setActive(true); handleMove(e); }}
      onTouchStart={(e) => { setActive(true); handleMove(e); }}
    >
      <div className="joystick-crosshair" />
      <div 
        className="joystick-knob" 
        style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
      />
    </div>
  );
};

export default Joystick;
