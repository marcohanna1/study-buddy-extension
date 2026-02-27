import React, { useState, useEffect } from 'react';

const CatCharacter = ({ bodyColor = '#9B59B6', bellyColor = '#E8DAEF', wingAngle = 0, isFlapping = false }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [bobOffset, setBobOffset] = useState(0);
  const [tailWag, setTailWag] = useState(0);

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

  // Tail wagging animation
  useEffect(() => {
    const wagInterval = setInterval(() => {
      setTailWag(prev => (prev + 1) % 360);
    }, 30);
    return () => clearInterval(wagInterval);
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

      {/* ===== CAT BODY ===== */}
      <div style={{
        width: `${BODY_WIDTH}px`,
        height: `${BODY_HEIGHT}px`,
        background: `linear-gradient(135deg, ${bodyColor} 0%, ${bodyColor}DD 100%)`,
        borderRadius: '40% 40% 38% 38%',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        zIndex: 2
      }}>

        {/* ===== LEFT EAR (triangular, cat-like) ===== */}
        <div style={{
          position: 'absolute',
          top: '-14px',
          left: '10px',
          width: '0',
          height: '0',
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderBottom: `20px solid ${bodyColor}`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}>
          {/* Inner ear */}
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '-7px',
            width: '0',
            height: '0',
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderBottom: `12px solid ${bellyColor}`,
            opacity: 0.7
          }} />
        </div>

        {/* ===== RIGHT EAR (triangular, cat-like) ===== */}
        <div style={{
          position: 'absolute',
          top: '-14px',
          right: '10px',
          width: '0',
          height: '0',
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderBottom: `20px solid ${bodyColor}`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}>
          {/* Inner ear */}
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '-7px',
            width: '0',
            height: '0',
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderBottom: `12px solid ${bellyColor}`,
            opacity: 0.7
          }} />
        </div>

        {/* ===== EYES (cat slits) ===== */}
        <div style={{
          display: 'flex',
          gap: '14px',
          position: 'absolute',
          top: '22px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          {/* Left Eye */}
          <div style={{
            width: '18px',
            height: isBlinking ? '2px' : '18px',
            background: '#F1C40F',
            borderRadius: '50%',
            position: 'relative',
            transition: 'height 0.1s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Cat slit pupil */}
            {!isBlinking && (
              <div style={{
                width: '3px',
                height: '14px',
                background: '#1a1a1a',
                borderRadius: '2px'
              }} />
            )}
          </div>

          {/* Right Eye */}
          <div style={{
            width: '18px',
            height: isBlinking ? '2px' : '18px',
            background: '#F1C40F',
            borderRadius: '50%',
            position: 'relative',
            transition: 'height 0.1s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Cat slit pupil */}
            {!isBlinking && (
              <div style={{
                width: '3px',
                height: '14px',
                background: '#1a1a1a',
                borderRadius: '2px'
              }} />
            )}
          </div>
        </div>

        {/* ===== SNOUT (cat muzzle) ===== */}
        <div style={{
          width: '30px',
          height: '18px',
          background: bellyColor,
          borderRadius: '50%',
          position: 'absolute',
          bottom: '26px',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Nose */}
          <div style={{
            width: '8px',
            height: '6px',
            background: '#E91E63',
            borderRadius: '50% 50% 50% 50%',
            position: 'absolute',
            top: '2px',
            left: '50%',
            transform: 'translateX(-50%)'
          }} />
          {/* Mouth lines (W shape) */}
          <div style={{
            position: 'absolute',
            bottom: '2px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '16px',
            height: '6px'
          }}>
            <div style={{
              width: '1px',
              height: '5px',
              background: '#1a1a1a',
              position: 'absolute',
              left: '7px',
              bottom: '0'
            }} />
            <div style={{
              width: '6px',
              height: '1px',
              background: '#1a1a1a',
              position: 'absolute',
              left: '2px',
              bottom: '2px',
              transform: 'rotate(-20deg)',
              transformOrigin: 'right'
            }} />
            <div style={{
              width: '6px',
              height: '1px',
              background: '#1a1a1a',
              position: 'absolute',
              right: '2px',
              bottom: '2px',
              transform: 'rotate(20deg)',
              transformOrigin: 'left'
            }} />
          </div>
        </div>

        {/* ===== WHISKERS ===== */}
        {/* Left whiskers */}
        <div style={{
          position: 'absolute',
          left: '-12px',
          top: '42px'
        }}>
          <div style={{
            width: '15px',
            height: '1px',
            background: '#1a1a1a',
            marginBottom: '3px',
            opacity: 0.6
          }} />
          <div style={{
            width: '15px',
            height: '1px',
            background: '#1a1a1a',
            opacity: 0.6
          }} />
        </div>
        {/* Right whiskers */}
        <div style={{
          position: 'absolute',
          right: '-12px',
          top: '42px'
        }}>
          <div style={{
            width: '15px',
            height: '1px',
            background: '#1a1a1a',
            marginBottom: '3px',
            opacity: 0.6
          }} />
          <div style={{
            width: '15px',
            height: '1px',
            background: '#1a1a1a',
            opacity: 0.6
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

      {/* ===== TAIL (curved and animated) ===== */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '-32px',
        width: '38px',
        height: '50px',
        background: `linear-gradient(135deg, ${bodyColor} 0%, ${bodyColor}DD 100%)`,
        borderRadius: '40% 60% 40% 30%',
        transform: `rotate(${-15 + Math.sin(tailWag * 0.08) * 8}deg)`,
        transformOrigin: 'left center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        zIndex: 0,
        transition: 'transform 0.1s ease-out'
      }}>
        {/* Tail tip */}
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          right: '2px',
          width: '14px',
          height: '14px',
          background: bellyColor,
          borderRadius: '50%',
          opacity: 0.8
        }} />
      </div>

    </div>
  );
};

export default CatCharacter;