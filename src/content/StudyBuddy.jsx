import React, { useState, useEffect, useRef } from 'react';
import OwlCharacter from '../components/OwlCharacter';
import BearCharacter from '../components/BearCharacter';
import CatCharacter from '../components/CatCharacter';
import FoxCharacter from '../components/FoxCharacter';
import ChatInterface from '../components/ChatInterface';
import HistoryView from '../components/HistoryView';
import SettingsModal from '../components/SettingsModal';

const StudyBuddy = () => {
  // ============= CORE STATE =============
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [emotion, setEmotion] = useState('idle');
  const [showChat, setShowChat] = useState(false);
  const [chatVisible, setChatVisible] = useState(false); // separate from showChat — hides without destroying
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! I can help you understand this page. Ask me anything!' }]);
  const [pageContent, setPageContent] = useState('');
  const [pendingSummary, setPendingSummary] = useState(null);

  // ============= WING ANIMATION =============
  const [wingAngle, setWingAngle] = useState(0);
  const [isFlapping, setIsFlapping] = useState(false);

  // ============= FEATURE STATES =============
  const [language, setLanguage] = useState('EN');
  const [readingLevel, setReadingLevel] = useState('High School');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [dyslexiaEnabled, setDyslexiaEnabled] = useState(false);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);

  // ============= CUSTOMIZATION STATES =============
  const [characterType, setCharacterType] = useState('owl');
  const [bodyColor, setBodyColor] = useState('#8B4513');
  const [bellyColor, setBellyColor] = useState('#DEB887');

  // ============= REFS =============
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const lastScrollY = useRef(window.scrollY);
  const scrollTimeout = useRef(null);

  // ============= LOAD SETTINGS =============
  useEffect(() => {
    chrome.storage.sync.get([
      'characterSettings', 'readingLevel', 'language',
      'ttsEnabled', 'dyslexiaEnabled', 'focusModeEnabled'
    ], (result) => {
      if (result.characterSettings) {
        setCharacterType(result.characterSettings.type || 'owl');
        setBodyColor(result.characterSettings.bodyColor || '#8B4513');
        setBellyColor(result.characterSettings.bellyColor || '#DEB887');
      }
      if (result.readingLevel) setReadingLevel(result.readingLevel);
      if (result.language) setLanguage(result.language);
      setTtsEnabled(!!result.ttsEnabled);
      setDyslexiaEnabled(!!result.dyslexiaEnabled);
      setFocusModeEnabled(!!result.focusModeEnabled);
    });
  }, []);

  // ============= LISTEN FOR CHARACTER UPDATES =============
  useEffect(() => {
    const handleMessage = (request) => {
      if (request.action === 'updateCharacter' && request.settings) {
        setCharacterType(request.settings.type);
        setBodyColor(request.settings.bodyColor);
        setBellyColor(request.settings.bellyColor);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // ============= EXTRACT PAGE CONTENT =============
  useEffect(() => {
    const extractContent = () => {
      setPageContent(`Title: ${document.title}\n\n${document.body.innerText.slice(0, 3000)}`);
    };
    extractContent();
    const observer = new MutationObserver(() => {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(extractContent, 1000);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // ============= SCROLL — drives wing flapping =============
  useEffect(() => {
    const handleScroll = () => {
      const delta = window.scrollY - lastScrollY.current;
      if (Math.abs(delta) > 10 && !isDragging) {
        setIsFlapping(true);
        setWingAngle(delta > 0 ? -30 : 30);
        setTimeout(() => { setWingAngle(0); setIsFlapping(false); }, 500);
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDragging]);

  // ============= DRAGGING =============
  const handleMouseDown = (e) => {
    if (e.target.closest('.chat-interface') || e.target.closest('.history-view')) return;
    setIsDragging(true);
    setEmotion('flying');
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 100)),
      y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 100)),
    });
  };

  const handleMouseUp = () => {
    if (isDragging) { setIsDragging(false); setEmotion('idle'); }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // ============= CHARACTER CLICK =============
  const handleCharacterClick = () => {
    if (!isDragging) {
      if (!showChat) {
        // First open — show everything
        setShowChat(true);
        setChatVisible(true);
        setEmotion('excited');
        setTimeout(() => setEmotion('idle'), 800);
      } else {
        // Toggle visibility without destroying the chat
        setChatVisible(prev => !prev);
      }
    }
  };

  // ============= SUMMARIZE =============
  const handleSummarize = async () => {
    setEmotion('thinking');
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'summarize',
        pageContent,
        language: getLanguageDisplay(language),
        readingLevel,
      });
      // Reset to null first so the useEffect in ChatInterface always fires,
      // even if the same page is summarized twice
      setPendingSummary(null);
      setTimeout(() => {
        setPendingSummary(response.summary);
        setShowChat(true);
        setChatVisible(true);
      }, 0);
      setEmotion('excited');
      setTimeout(() => setEmotion('idle'), 800);
    } catch {
      setEmotion('idle');
    }
  };

  // ============= FEATURE HANDLERS =============
  const handleTTSToggle = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    chrome.storage.sync.set({ ttsEnabled: next });
    window.dispatchEvent(new CustomEvent('sb:toggle-tts', { detail: { enabled: next } }));
  };

  const handleDyslexiaToggle = () => {
    const next = !dyslexiaEnabled;
    setDyslexiaEnabled(next);
    chrome.storage.sync.set({ dyslexiaEnabled: next });
    window.dispatchEvent(new CustomEvent('sb:toggle-dyslexia'));
  };

  const handleFocusModeToggle = () => {
    const next = !focusModeEnabled;
    setFocusModeEnabled(next);
    chrome.storage.sync.set({ focusModeEnabled: next });
    if (next) {
      document.body.style.filter = 'brightness(0.3)';
      if (containerRef.current) containerRef.current.style.filter = 'brightness(3.3)';
    } else {
      document.body.style.filter = '';
      if (containerRef.current) containerRef.current.style.filter = '';
    }
  };

  const handleSettingsToggle = () => setShowSettings(prev => !prev);

  const handleSettingsChange = ({ type, settings, level, lang }) => {
    if (type === 'character' && settings) {
      setCharacterType(settings.type);
      setBodyColor(settings.bodyColor);
      setBellyColor(settings.bellyColor);
    }
    if (type === 'readingLevel' && level) setReadingLevel(level);
    if (type === 'language' && lang) setLanguage(lang);
  };

  // ============= HELPERS =============
  const getLanguageDisplay = (lang) =>
    ({ EN: 'English', ES: 'Spanish', RU: 'Russian' }[lang] || lang);

  const isNearBottom = position.y > window.innerHeight / 2;
  const isNearLeft   = position.x < 400;

  // ============= RENDER CHARACTER =============
  const renderCharacter = () => {
    const props = { emotion, bodyColor, bellyColor, wingAngle, isFlapping };
    switch (characterType) {
      case 'bear': return <BearCharacter {...props} />;
      case 'cat':  return <CatCharacter  {...props} />;
      case 'fox':  return <FoxCharacter  {...props} />;
      default:     return <OwlCharacter  {...props} />;
    }
  };

  // ============= BUTTON BAR =============
  // Bar sits BETWEEN the owl and the chat, on the SAME side as the owl.
  // isNearLeft  -> owl LEFT,  chat RIGHT -> bar flush against LEFT edge of chat, right corners square
  // !isNearLeft -> owl RIGHT, chat LEFT  -> bar flush against RIGHT edge of chat, left corners square
  const renderBar = () => {
    const CHAT_WIDTH = 350;
    const BAR_WIDTH  = 56;

    const barLeft = isNearLeft
      ? position.x + 100 - BAR_WIDTH   // flush against left edge of chat
      : position.x - 370 + CHAT_WIDTH; // flush against right edge of chat

    const borderRadius = isNearLeft
      ? '20px 0 0 20px'  // bar is LEFT of chat -> right edge flat
      : '0 20px 20px 0'; // bar is RIGHT of chat -> left edge flat

    // In top half: push bar down by owl height so it starts below the owl, not on top of it
    // In bottom half: anchor from bottom as before
    const OWL_HEIGHT = 165;
    const barTopStyle = isNearBottom
      ? { bottom: `${window.innerHeight - position.y}px` }
      : { top: `${position.y + OWL_HEIGHT}px` };

    const iconBtn = (emoji, active, onClick) => ({
      onClick: (e) => { e.stopPropagation(); onClick(); },
      style: {
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        border: 'none',
        background: active
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'white',
        color: active ? 'white' : '#555',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      children: emoji,
    });

    const accentBtn = (emoji, gradient, onClick, extraProps = {}) => ({
      onClick: (e) => { e.stopPropagation(); onClick(e); },
      ...extraProps,
      style: {
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        border: 'none',
        background: gradient,
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        pointerEvents: 'auto',
      },
      children: emoji,
    });

    return (
      <div style={{
        position: 'fixed',
        left: `${barLeft}px`,
        ...barTopStyle,
        width: `${BAR_WIDTH}px`,
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        borderRadius,
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        padding: '10px 6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 999999,
        border: '3px solid #667eea',
      }}>
        {/* Summarize */}
        <button {...iconBtn('\u{1F4DD}', false, handleSummarize)} title="Summarize page" />
        {/* Dyslexia */}
        <button {...iconBtn('\u{1F524}', dyslexiaEnabled, handleDyslexiaToggle)} title="Dyslexia Mode" />
        {/* Focus Mode */}
        <button {...iconBtn('\u{1F526}', focusModeEnabled, handleFocusModeToggle)} title="Focus Mode" />
        {/* Settings */}
        <button {...accentBtn('\u2699\uFE0F', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', handleSettingsToggle)} title="Settings" />
        {/* History */}
        <button {...accentBtn(
          '\u{1F4AC}',
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          (e) => { e.preventDefault(); setShowHistory(prev => !prev); },
          { onMouseDown: (e) => e.stopPropagation() }
        )} title="History" />
      </div>
    );
  };

  // ============= RENDER =============
  return (
    <>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onClick={handleCharacterClick}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 999999,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        {renderCharacter()}
      </div>

      {/* Icon bar — only show when chat is visible */}
      {showChat && chatVisible && renderBar()}

      {/* Chat — rendered while showChat, but hidden/shown via chatVisible */}
      {showChat && (
        <div className="chat-interface" style={{
          display: chatVisible ? 'block' : 'none',
          position: 'fixed',
          left: isNearLeft ? `${position.x + 100}px` : `${position.x - 370}px`,
          top: isNearBottom ? 'auto' : `${position.y}px`,
          bottom: isNearBottom ? `${window.innerHeight - position.y}px` : 'auto',
          zIndex: 999998,
        }}>
          <ChatInterface
            onClose={() => setChatVisible(false)}
            onNewChat={() => {
              setMessages([{ role: 'assistant', content: 'Hi! I can help you understand this page. Ask me anything!' }]);
              setPendingSummary(null);
            }}
            pageContent={pageContent}
            language={getLanguageDisplay(language)}
            readingLevel={readingLevel}
            initialSummary={pendingSummary}
            messages={messages}
            setMessages={setMessages}
          />
        </div>
      )}

      {/* History */}
      {showHistory && (
        <div className="history-view" onClick={(e) => e.stopPropagation()} style={{
          position: 'fixed',
          left: isNearLeft ? `${position.x + 100}px` : `${position.x - 370}px`,
          top: isNearBottom ? 'auto' : `${position.y}px`,
          bottom: isNearBottom ? `${window.innerHeight - position.y}px` : 'auto',
          zIndex: 1000000,
          pointerEvents: 'auto',
        }}>
          <HistoryView
            key={Date.now()}
            onClose={() => setShowHistory(false)}
            onBack={() => setShowHistory(false)}
            onLoadChat={(item) => {
              setShowHistory(false);
              setShowChat(true);
              setChatVisible(true);
              if (item.type === 'chat') {
                // Restore the full conversation
                try {
                  const restored = JSON.parse(item.content || item.summary);
                  setMessages(restored);
                  setPendingSummary(null);
                } catch {
                  setPendingSummary(item.content || item.summary);
                }
              } else {
                // Summary — load as a summary turn
                setPendingSummary(null);
                setTimeout(() => setPendingSummary(item.summary || item.content), 0);
              }
            }}
          />
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSettingsChange={handleSettingsChange}
        />
      )}
    </>
  );
};

export default StudyBuddy;
