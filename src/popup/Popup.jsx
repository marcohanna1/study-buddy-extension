import React, { useState, useEffect } from 'react';

const Popup = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState('');
  const [summaries, setSummaries] = useState([]);
  const [activeTab, setActiveTab] = useState('settings');

  // Customization settings
  const [characterType, setCharacterType] = useState('owl');
  const [bodyColor, setBodyColor] = useState('#8B4513');
  const [bellyColor, setBellyColor] = useState('#DEB887');

  useEffect(() => {
    // Load API key
    chrome.storage.sync.get(['geminiApiKey'], (result) => {
      if (result.geminiApiKey) {
        setApiKey(result.geminiApiKey);
      }
    });

    // Load customization settings
    chrome.storage.sync.get(['characterSettings'], (result) => {
      if (result.characterSettings) {
        setCharacterType(result.characterSettings.type || 'owl');
        setBodyColor(result.characterSettings.bodyColor || '#8B4513');
        setBellyColor(result.characterSettings.bellyColor || '#DEB887');
      }
    });

    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    const response = await chrome.runtime.sendMessage({ action: 'getSummaries' });
    setSummaries(response.summaries || []);
  };

  const handleSaveApiKey = () => {
    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
      setSaved('api');
      setTimeout(() => setSaved(''), 2000);
    });
  };

  const handleSaveCustomization = () => {
    const settings = {
      type: characterType,
      bodyColor,
      bellyColor
    };
    chrome.storage.sync.set({ characterSettings: settings }, () => {
      setSaved('custom');
      setTimeout(() => setSaved(''), 2000);
      
      // Notify content script to reload character
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'updateCharacter', 
            settings 
          });
        }
      });
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const characterPreviews = {
    owl: '🦉',
    cat: '🐱',
    bear: '🐻',
    fox: '🦊'
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '400px',
      background: 'white'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>
          {characterPreviews[characterType]}
        </div>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '600' }}>
          Study Buddy
        </h1>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
          Your AI Reading Companion
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e0e0e0',
        background: '#f9f9f9'
      }}>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: activeTab === 'settings' ? 'white' : 'transparent',
            borderBottom: activeTab === 'settings' ? '2px solid #667eea' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'settings' ? '600' : 'normal',
            color: activeTab === 'settings' ? '#667eea' : '#666'
          }}
        >
          Settings
        </button>
        <button
          onClick={() => {
            setActiveTab('summaries');
            loadSummaries();
          }}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: activeTab === 'summaries' ? 'white' : 'transparent',
            borderBottom: activeTab === 'summaries' ? '2px solid #667eea' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'summaries' ? '600' : 'normal',
            color: activeTab === 'summaries' ? '#667eea' : '#666'
          }}
        >
          Saved ({summaries.length})
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'settings' && (
          <div>
            {/* API KEY SECTION */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                fontSize: '14px',
                color: '#333'
              }}>
                Google Gemini API Key
              </label>
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
                  marginBottom: '10px'
                }}
              />
              <button
                onClick={handleSaveApiKey}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {saved === 'api' ? '✓ API Key Saved!' : 'Save API Key'}
              </button>
            </div>

            {/* CUSTOMIZATION SECTION */}
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>
                🎨 Customize Your Buddy
              </h3>

              {/* Character Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  Character
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px'
                }}>
                  {Object.entries(characterPreviews).map(([type, emoji]) => (
                    <button
                      key={type}
                      onClick={() => setCharacterType(type)}
                      style={{
                        padding: '15px',
                        border: `2px solid ${characterType === type ? '#667eea' : '#ddd'}`,
                        borderRadius: '8px',
                        background: characterType === type ? '#f0f7ff' : 'white',
                        cursor: 'pointer',
                        fontSize: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{emoji}</span>
                      <span style={{ 
                        fontSize: '12px', 
                        textTransform: 'capitalize',
                        color: '#666'
                      }}>
                        {type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Color */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  Body Color
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={bodyColor}
                    onChange={(e) => setBodyColor(e.target.value)}
                    style={{
                      width: '50px',
                      height: '40px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    value={bodyColor}
                    onChange={(e) => setBodyColor(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Belly Color */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  Belly Color
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={bellyColor}
                    onChange={(e) => setBellyColor(e.target.value)}
                    style={{
                      width: '50px',
                      height: '40px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    value={bellyColor}
                    onChange={(e) => setBellyColor(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveCustomization}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {saved === 'custom' ? '✓ Customization Saved!' : 'Apply Changes'}
              </button>
            </div>

            {/* HOW TO USE */}
            <div style={{
              padding: '15px',
              background: '#fff9e6',
              borderRadius: '6px',
              fontSize: '13px'
            }}>
              <strong>🦉 How to use:</strong>
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                <li>Your buddy appears on every webpage</li>
                <li>Drag it anywhere you want</li>
                <li>Click 📝 to summarize pages</li>
                <li>Click ⚙️ to access settings</li>
                <li>Use feature buttons for TTS, dyslexia mode, etc.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'summaries' && (
          <div>
            {summaries.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📚</div>
                <p>No saved summaries yet!</p>
                <p style={{ fontSize: '13px' }}>
                  Click the 📝 button on any page to create your first summary.
                </p>
              </div>
            ) : (
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {summaries.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: '15px',
                      padding: '12px',
                      background: '#f9f9f9',
                      borderRadius: '6px',
                      fontSize: '13px',
                      borderLeft: '3px solid #667eea'
                    }}
                  >
                    <div style={{
                      fontWeight: '600',
                      marginBottom: '5px',
                      color: '#333',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '8px'
                    }}>
                      {formatDate(item.timestamp)}
                    </div>
                    <div style={{
                      color: '#555',
                      lineHeight: '1.4',
                      marginBottom: '8px'
                    }}>
                      {item.summary.slice(0, 150)}...
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      style={{
                        color: '#667eea',
                        textDecoration: 'none',
                        fontSize: '12px'
                      }}
                    >
                      View original →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
