import React, { useRef, useEffect, useState } from 'react';

const GREETING = 'Hi! I can help you understand this page. Ask me anything!';

const ChatInterface = ({
  onClose,
  pageContent,
  language,
  readingLevel,
  initialSummary,
  messages,
  setMessages,
  onNewChat,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const messagesEndRef = useRef(null);

  // Append summary as a conversation turn when it arrives
  useEffect(() => {
    if (!initialSummary) return;
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.content === initialSummary) return prev;
      return [
        ...prev,
        { role: 'user', content: '📝 Summarize this page for me' },
        { role: 'assistant', content: initialSummary },
      ];
    });
  }, [initialSummary]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const friendlyError = (msg) => {
    if (!msg || msg.startsWith('Error:') || msg.length > 120) {
      return 'Something went wrong. Check your API key in Settings (⚙️).';
    }
    return msg;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'chat',
        message: userMessage,
        pageContent,
        language,
        readingLevel,
        conversationHistory: updatedMessages,
      });

      if (response.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '⚠️ ' + friendlyError(response.error),
          isError: true,
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Could not reach the background service. Try reloading the page.',
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveChat = async () => {
    // Don't save if it's just the greeting
    const meaningful = messages.filter(m => !(m.role === 'assistant' && m.content === GREETING));
    if (meaningful.length === 0) return;

    setSaveState('saving');
    try {
      await chrome.runtime.sendMessage({
        action: 'saveSummary',
        summary: JSON.stringify(messages),
        url: window.location.href,
        title: document.title,
        type: 'chat',
      });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 2000);
    }
  };

  const saveLabel = { idle: '💾', saving: '⏳', saved: '✓', error: '✗' }[saveState];
  const hasContent = messages.some(m => m.role === 'user');

  return (
    <div style={{
      width: '350px',
      height: '450px',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', flex: 1 }}>
          Study Buddy Chat
        </h3>

        {/* Save button */}
        <button
          onClick={handleSaveChat}
          disabled={!hasContent || saveState === 'saving'}
          title="Save this chat"
          style={{
            background: saveState === 'saved'
              ? 'rgba(86,171,47,0.35)'
              : saveState === 'error'
                ? 'rgba(220,53,69,0.35)'
                : 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: hasContent ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: hasContent ? 1 : 0.4,
            transition: 'background 0.2s',
          }}
        >
          {saveLabel}
        </button>

        {/* New Chat button */}
        <button
          onClick={onNewChat}
          title="Start a new chat"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🔄
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          title="Hide chat"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
          }}>
            <div style={{
              background: msg.isError
                ? '#fff3cd'
                : msg.role === 'user'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#f0f0f0',
              color: msg.isError ? '#856404' : msg.role === 'user' ? 'white' : '#333',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '15px 15px 5px 15px' : '15px 15px 15px 5px',
              fontSize: '14px',
              lineHeight: '1.5',
              wordWrap: 'break-word',
              border: msg.isError ? '1px solid #ffc107' : 'none',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{
              background: '#f0f0f0',
              padding: '10px 14px',
              borderRadius: '15px 15px 15px 5px',
              fontSize: '14px',
            }}>
              <span className="typing-indicator">●●●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '10px',
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about this page..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: '20px',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
          }}
        >
          ➤
        </button>
      </div>

      <style>{`
        .typing-indicator { display: inline-block; animation: typing 1.4s infinite; }
        @keyframes typing { 0%,60%,100% { opacity:0.3; } 30% { opacity:1; } }
      `}</style>
    </div>
  );
};

export default ChatInterface;
