import React, { useState, useEffect } from 'react';

const BearCharacter = ({ bodyColor = '#8B6914', bellyColor = '#C4956A', wingAngle = 0, isFlapping = false }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [bobOffset, setBobOffset] = useState(0);

  // Blinking animation (same as owl)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Idle bobbing animation (same as owl)
  useEffect(() => {
    const bobInterval = setInterval(() => {
      setBobOffset(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(bobInterval);
  }, []);

  const BODY_WIDTH = 70;
  const BODY_HEIGHT = 80;

  return (
    <div style={{
      width: `${BODY_WIDTH}px`,
      height: `${BODY_HEIGHT}px`,
      position: 'relative',
      transform: `translateY(${Math.sin(bobOffset * 0.1) * 3}px)`
    }}>

      {/* ===== LEFT ARM ===== */}
      <div style={{
        position: 'absolute',
        left: '-15px',
        top: '28px',
        width: '25px',
        height: '38px',
        background: `linear-gradient(135deg, ${bodyColor} 0%, ${bodyColor}AA 100%)`,
        borderRadius: '50% 20% 30% 50%',
        transform: `rotate(${wingAngle}deg)`,
        transformOrigin: 'right center',
        transition: isFlapping ? 'transform 0.3s ease-out' : 'transform 0.5s ease-in-out',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1
      }} />

      {/* ===== RIGHT ARM ===== */}
      <div style={{
        position: 'absolute',
        right: '-15px',
        top: '28px',
        width: '25px',
        height: '38px',
        background: `linear-gradient(135deg, ${bodyColor}AA 0%, ${bodyColor} 100%)`,
        borderRadius: '20% 50% 50% 30%',
        transform: `rotate(${-wingAngle}deg)`,
        transformOrigin: 'left center',
        transition: isFlapping ? 'transform 0.3s ease-out' : 'transform 0.5s ease-in-out',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 1
      }} />

      {/* ===== BEAR BODY ===== */}
      <div style={{
        width: `${BODY_WIDTH}px`,
        height: `${BODY_HEIGHT}px`,
        background: `linear-gradient(135deg, ${bodyColor} 0%, ${bodyColor}DD 100%)`,
        borderRadius: '40% 40% 38% 38%',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        zIndex: 2
      }}>

        {/* ===== LEFT EAR (round, bear-like) ===== */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '8px',
          width: '18px',
          height: '18px',
          background: bodyColor,
          borderRadius: '50%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {/* Inner ear */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            width: '10px',
            height: '10px',
            background: bellyColor,
            borderRadius: '50%',
            opacity: 0.7
          }} />
        </div>

        {/* ===== RIGHT EAR (round, bear-like) ===== */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '8px',
          width: '18px',
          height: '18px',
          background: bodyColor,
          borderRadius: '50%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {/* Inner ear */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            width: '10px',
            height: '10px',
            background: bellyColor,
            borderRadius: '50%',
            opacity: 0.7
          }} />
        </div>

        {/* ===== EYES ===== */}
        <div style={{
          display: 'flex',
          gap: '10px',
          position: 'absolute',
          top: '22px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          {/* Left Eye */}
          <div style={{
            width: '18px',
            height: isBlinking ? '3px' : '18px',
            background: '#1a1a1a',
            borderRadius: '50%',
            position: 'relative',
            transition: 'height 0.1s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {/* Eye shine */}
            {!isBlinking && (
              <div style={{
                width: '5px',
                height: '5px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: '3px'
              }} />
            )}
          </div>

          {/* Right Eye */}
          <div style={{
            width: '18px',
            height: isBlinking ? '3px' : '18px',
            background: '#1a1a1a',
            borderRadius: '50%',
            position: 'relative',
            transition: 'height 0.1s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {/* Eye shine */}
            {!isBlinking && (
              <div style={{
                width: '5px',
                height: '5px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: '3px'
              }} />
            )}
          </div>
        </div>

        {/* ===== SNOUT (bear muzzle) ===== */}
        <div style={{
          width: '28px',
          height: '20px',
          background: bellyColor,
          borderRadius: '50%',
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Nose */}
          <div style={{
            width: '12px',
            height: '8px',
            background: '#1a1a1a',
            borderRadius: '50% 50% 40% 40%',
            position: 'absolute',
            top: '2px',
            left: '50%',
            transform: 'translateX(-50%)'
          }} />
          {/* Mouth line */}
          <div style={{
            width: '1px',
            height: '5px',
            background: '#1a1a1a',
            position: 'absolute',
            bottom: '2px',
            left: '50%',
            transform: 'translateX(-50%)'
          }} />
        </div>

        {/* ===== BELLY ===== */}
        <div style={{
          width: '38px',
          height: '32px',
          background: `linear-gradient(135deg, ${bellyColor} 0%, ${bellyColor}CC 100%)`,
          borderRadius: '50%',
          position: 'absolute',
          bottom: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1
        }} />
      </div>

      {/* ===== FEET ===== */}
      <div style={{
        position: 'absolute',
        bottom: '-4px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        zIndex: 0
      }}>
        <div style={{
          width: '16px',
          height: '8px',
          background: bodyColor,
          borderRadius: '50% 50% 40% 40%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
        <div style={{
          width: '16px',
          height: '8px',
          background: bodyColor,
          borderRadius: '50% 50% 40% 40%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }} />
      </div>

    </div>
  );
};

export default BearCharacter;