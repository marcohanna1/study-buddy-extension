import React, { useState, useEffect } from 'react';

const FoxCharacter = ({ bodyColor = '#FF6B35', bellyColor = '#FFEAA7', wingAngle = 0, isFlapping = false }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [bobOffset, setBobOffset] = useState(0);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Idle bobbing animation
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

      {/* ===== FOX BODY ===== */}
      <div style={{
        width: `${BODY_WIDTH}px`,
        height: `${BODY_HEIGHT}px`,
        background: `linear-gradient(135deg, ${bodyColor} 0%, ${bodyColor}DD 100%)`,
        borderRadius: '40% 40% 38% 38%',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        zIndex: 2
      }}>

        {/* ===== LEFT EAR (pointed, fox-like) ===== */}
        <div style={{
          position: 'absolute',
          top: '-18px',
          left: '12px',
          width: '0',
          height: '0',
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: `24px solid ${bodyColor}`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}>
          {/* Inner ear triangle */}
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '-6px',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `14px solid ${bellyColor}`,
            opacity: 0.8
          }} />
        </div>

        {/* ===== RIGHT EAR (pointed, fox-like) ===== */}
        <div style={{
          position: 'absolute',
          top: '-18px',
          right: '12px',
          width: '0',
          height: '0',
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: `24px solid ${bodyColor}`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}>
          {/* Inner ear triangle */}
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '-6px',
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `14px solid ${bellyColor}`,
            opacity: 0.8
          }} />
        </div>

        {/* ===== EYES ===== */}
        <div style={{
          display: 'flex',
          gap: '12px',
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          {/* Left Eye */}
          <div style={{
            width: '16px',
            height: isBlinking ? '3px' : '20px',
            background: '#2C3E50',
            borderRadius: '50% 50% 50% 50%',
            position: 'relative',
            transition: 'height 0.1s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            transform: 'rotate(-10deg)'
          }}>
            {/* Eye shine */}
            {!isBlinking && (
              <div style={{
                width: '5px',
                height: '5px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '4px',
                left: '3px'
              }} />
            )}
          </div>

          {/* Right Eye */}
          <div style={{
            width: '16px',
            height: isBlinking ? '3px' : '20px',
            background: '#2C3E50',
            borderRadius: '50% 50% 50% 50%',
            position: 'relative',
            transition: 'height 0.1s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            transform: 'rotate(10deg)'
          }}>
            {/* Eye shine */}
            {!isBlinking && (
              <div style={{
                width: '5px',
                height: '5px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '4px',
                left: '3px'
              }} />
            )}
          </div>
        </div>

        {/* ===== SNOUT (fox muzzle) ===== */}
        <div style={{
          width: '32px',
          height: '24px',
          background: bellyColor,
          borderRadius: '50% 50% 45% 45%',
          position: 'absolute',
          bottom: '22px',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Nose */}
          <div style={{
            width: '10px',
            height: '8px',
            background: '#1a1a1a',
            borderRadius: '50% 50% 50% 50%',
            position: 'absolute',
            top: '3px',
            left: '50%',
            transform: 'translateX(-50%)'
          }} />
          {/* Mouth line */}
          <div style={{
            width: '1px',
            height: '6px',
            background: '#1a1a1a',
            position: 'absolute',
            bottom: '3px',
            left: '50%',
            transform: 'translateX(-50%)'
          }} />
          {/* Whisker dots */}
          <div style={{
            width: '2px',
            height: '2px',
            background: '#1a1a1a',
            borderRadius: '50%',
            position: 'absolute',
            top: '10px',
            left: '6px'
          }} />
          <div style={{
            width: '2px',
            height: '2px',
            background: '#1a1a1a',
            borderRadius: '50%',
            position: 'absolute',
            top: '10px',
            right: '6px'
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

      {/* ===== TAIL (behind body) ===== */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '-28px',
        width: '35px',
        height: '45px',
        background: `linear-gradient(135deg, ${bodyColor} 0%, ${bodyColor}CC 50%, ${bellyColor} 100%)`,
        borderRadius: '50% 40% 60% 30%',
        transform: 'rotate(-20deg)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        zIndex: 0
      }} />

    </div>
  );
};

export default FoxCharacter;