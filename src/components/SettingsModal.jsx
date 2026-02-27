import React, { useState, useEffect } from 'react';

const SettingsModal = ({ onClose, onSettingsChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [applied, setApplied] = useState(false);

  // Character settings
  const [characterType, setCharacterType] = useState('owl');
  const [bodyColor, setBodyColor] = useState('#8B4513');
  const [bellyColor, setBellyColor] = useState('#DEB887');

  // Feature settings
  const [readingLevel, setReadingLevel] = useState('High School');
  const [language, setLanguage] = useState('EN');

  useEffect(() => {
    chrome.storage.sync.get([
      'geminiApiKey', 'characterSettings', 'readingLevel', 'language'
    ], (result) => {
      if (result.geminiApiKey) setApiKey(result.geminiApiKey);
      if (result.characterSettings) {
        setCharacterType(result.characterSettings.type || 'owl');
        setBodyColor(result.characterSettings.bodyColor || '#8B4513');
        setBellyColor(result.characterSettings.bellyColor || '#DEB887');
      }
      if (result.readingLevel) setReadingLevel(result.readingLevel);
      if (result.language) setLanguage(result.language);
    });
  }, []);

  const handleApply = () => {
    const settings = { type: characterType, bodyColor, bellyColor };
    chrome.storage.sync.set({ characterSettings: settings });
    if (apiKey) chrome.storage.sync.set({ geminiApiKey: apiKey });
    chrome.storage.sync.set({ readingLevel });
    chrome.storage.sync.set({ language });

    setApplied(true);
    setTimeout(() => setApplied(false), 2000);

    if (onSettingsChange) onSettingsChange({ type: 'character', settings });
    if (onSettingsChange) onSettingsChange({ type: 'readingLevel', level: readingLevel });
    if (onSettingsChange) onSettingsChange({ type: 'language', lang: language });
  };

  const handleDyslexiaToggle = (e) => {
    // kept for external use only - not shown in settings
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999998,
        }}
      />

      {/* Panel — matches voice file exactly */}
      <div
        className="settings-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          maxHeight: '80vh',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 50px rgba(0,0,0,0.3)',
          zIndex: 9999999,
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', borderBottom: 'none' }}>⚙️ Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >×</button>
        </div>

        {/* Scrollable content */}
        <div style={{ padding: '20px 24px 40px 20px', maxHeight: 'calc(80vh - 85px)', overflowY: 'scroll', boxSizing: 'border-box' }}>

          {/* Character Type */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🦉 Character Type</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { id: 'owl', name: 'Owl', icon: '🦉' },
                { id: 'cat', name: 'Cat', icon: '🐱' },
                { id: 'fox', name: 'Fox', icon: '🦊' },
                { id: 'bear', name: 'Bear', icon: '🐻' },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setCharacterType(type.id)}
                  style={{
                    padding: '15px',
                    background: characterType === type.id ? '#667eea' : '#f5f5f5',
                    color: characterType === type.id ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  <div style={{ fontSize: '30px', marginBottom: '5px' }}>{type.icon}</div>
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🎨 Colors</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>
                  Body Color
                </label>
                <input
                  type="color"
                  value={bodyColor}
                  onChange={(e) => setBodyColor(e.target.value)}
                  style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px' }}>
                  Belly Color
                </label>
                <input
                  type="color"
                  value={bellyColor}
                  onChange={(e) => setBellyColor(e.target.value)}
                  style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Reading Level */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>📚 Reading Level</h3>
            <select
              value={readingLevel}
              onChange={(e) => setReadingLevel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: 'white',
              }}
            >
              <option value="Elementary">Elementary (K-5)</option>
              <option value="Middle School">Middle School (6-8)</option>
              <option value="High School">High School (9-12)</option>
              <option value="College">College</option>
            </select>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Adjusts complexity of summaries and chat responses
            </div>
          </div>

          {/* Language */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🌐 Language</h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: 'white',
              }}
            >
              <option value="EN">🌐 English</option>
              <option value="ES">🇪🇸 Spanish</option>
              <option value="RU">🇷🇺 Russian</option>
            </select>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              All responses will be in this language
            </div>
          </div>

          {/* TTS Voice */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🔊 Read Aloud Voice</h3>
            <select
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: 'white',
              }}
            >
              <option value="default">Default</option>
              <option disabled>── More coming soon ──</option>
            </select>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              Highlight any text on the page to hear it read aloud 🔊
            </div>
          </div>

          {/* API Key */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>🔑 Gemini API Key</h3>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                marginBottom: '8px',
              }}
            />
            <div style={{ fontSize: '12px', color: '#666' }}>
              Get a free key at{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#667eea' }}>
                aistudio.google.com
              </a>
            </div>
          </div>

          {/* Apply button */}
          <button
            onClick={handleApply}
            style={{
              width: '100%',
              padding: '14px',
              background: applied
                ? 'linear-gradient(135deg, #56ab2f, #a8e063)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.3s',
            }}
          >
            {applied ? '✓ Applied!' : 'Apply Changes'}
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
