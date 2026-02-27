import React, { useState, useEffect } from 'react';

const OwlCharacter = ({
  emotion = 'idle',
  bodyColor = '#8B4513',
  bellyColor = '#DEB887',
  wingAngle = 0,
  isFlapping = false,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [bobOffset, setBobOffset] = useState(0);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (emotion === 'idle') {
      const bobInterval = setInterval(() => {
        setBobOffset(prev => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(bobInterval);
    }
  }, [emotion]);

  const getEmotionStyles = () => {
    switch (emotion) {
      case 'excited':  return { animation: 'owlBounce 0.5s ease-in-out infinite' };
      case 'thinking': return { animation: 'owlTilt 1s ease-in-out infinite' };
      case 'falling':  return { animation: 'owlFall 0.5s ease-in' };
      case 'flying':   return { animation: 'owlFly 0.5s ease-out' };
      case 'scared':   return { animation: 'owlShake 0.3s ease-in-out infinite' };
      default:         return { transform: `translateY(${Math.sin(bobOffset * 0.1) * 3}px)` };
    }
  };

  const getEyeStyle = () => {
    if (isBlinking) return { transform: 'scaleY(0.1)' };
    switch (emotion) {
      case 'excited':  return { transform: 'scale(1.3)' };
      case 'scared':   return { transform: 'scale(1.5)' };
      case 'thinking': return { transform: 'translateX(-2px)' };
      default: return {};
    }
  };

  return (
    <div style={{ width: '70px', height: '80px', position: 'relative', ...getEmotionStyles() }}>

      {/* Left Wing */}
      <div style={{
        position: 'absolute', left: '-14px', top: '22px',
        width: '25px', height: '40px',
        background: `linear-gradient(135deg, ${bodyColor} 0%, ${bodyColor}AA 100%)`,
        borderRadius: '50% 20% 30% 50%',
        transform: `rotate(${emotion === 'flying' ? -25 : wingAngle}deg)`,
        transformOrigin: 'right center',
        transition: isFlapping ? 'transform 0.3s ease-out' : 'transform 0.5s ease-in-out',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 1,
      }}>
        <div style={{ position: 'absolute', top: '5px', left: '4px', width: '3px', height: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px' }} />
        <div style={{ position: 'absolute', top: '12px', left: '6px', width: '3px', height: '11px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px' }} />
      </div>

      {/* Right Wing */}
      <div style={{
        position: 'absolute', right: '-14px', top: '22px',
        width: '25px', height: '40px',
        background: `linear-gradient(135deg, ${bodyColor}AA 0%, ${bodyColor} 100%)`,
        borderRadius: '20% 50% 50% 30%',
        transform: `rotate(${emotion === 'flying' ? 25 : -wingAngle}deg)`,
        transformOrigin: 'left center',
        transition: isFlapping ? 'transform 0.3s ease-out' : 'transform 0.5s ease-in-out',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 1,
      }}>
        <div style={{ position: 'absolute', top: '5px', right: '4px', width: '3px', height: '14px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px' }} />
        <div style={{ position: 'absolute', top: '12px', right: '6px', width: '3px', height: '11px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px' }} />
      </div>

      {/* Body */}
      <div style={{
        width: '70px', height: '80px',
        background: `linear-gradient(135deg, ${bodyColor} 0%, ${bodyColor}DD 100%)`,
        borderRadius: '45% 45% 40% 40%',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)', zIndex: 2,
      }}>
        {/* Ear tufts */}
        <div style={{ position: 'absolute', top: '-6px', left: '11px', width: '13px', height: '20px', background: bodyColor, borderRadius: '50% 50% 0 0', transform: 'rotate(-15deg)' }} />
        <div style={{ position: 'absolute', top: '-6px', right: '11px', width: '13px', height: '20px', background: bodyColor, borderRadius: '50% 50% 0 0', transform: 'rotate(15deg)' }} />

        {/* Eyes */}
        <div style={{ display: 'flex', gap: '10px', position: 'absolute', top: '22px', left: '50%', transform: 'translateX(-50%)' }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: '20px', height: '22px',
              background: 'white', borderRadius: '50%',
              border: '3px solid #333', position: 'relative',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              ...getEyeStyle(),
            }}>
              <div style={{ width: '10px', height: '10px', background: '#000', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div style={{ width: '3px', height: '3px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Beak */}
        <div style={{
          width: 0, height: 0,
          borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
          borderTop: '14px solid #FFA500',
          position: 'absolute', bottom: '28px', left: '50%',
          transform: 'translateX(-50%)',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))', zIndex: 3,
        }} />

        {/* Belly */}
        <div style={{
          width: '42px', height: '32px',
          background: `linear-gradient(135deg, ${bellyColor} 0%, ${bellyColor}DD 100%)`,
          borderRadius: '50%',
          position: 'absolute', bottom: '8px', left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{ width: '28px', height: '2px', background: 'rgba(0,0,0,0.06)', position: 'absolute', top: '9px', left: '50%', transform: 'translateX(-50%)', borderRadius: '2px' }} />
          <div style={{ width: '22px', height: '2px', background: 'rgba(0,0,0,0.06)', position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', borderRadius: '2px' }} />
        </div>
      </div>

      {/* Feet */}
      <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '14px', zIndex: 0 }}>
        <div style={{ width: '13px', height: '6px', background: '#FFA500', borderRadius: '3px 3px 0 0', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
        <div style={{ width: '13px', height: '6px', background: '#FFA500', borderRadius: '3px 3px 0 0', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
      </div>

      <style>{`
        @keyframes owlBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes owlTilt   { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes owlFall   { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(20px) rotate(15deg); } }
        @keyframes owlFly    { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(-20px) rotate(-10deg); } }
        @keyframes owlShake  { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
      `}</style>
    </div>
  );
};

export default OwlCharacter;
