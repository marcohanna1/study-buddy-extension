import React, { useState, useEffect } from 'react';

const HistoryView = ({ onClose, onLoadChat, onBack }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSummaries' });
      // Only show items that were explicitly saved (have type 'chat')
      const savedChats = (response.summaries || []);
      setHistory(savedChats);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const truncate = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

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
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            💬 Saved Chats
          </h3>
        </div>
        <button
          onClick={onClose}
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
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* History List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px'
      }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            Loading...
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>💬</div>
            <p>No saved chats yet!</p>
            <p style={{ fontSize: '13px' }}>
              Click the save button in chat to save conversations.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onLoadChat(item)}
                title={item.type === 'chat' ? 'Load this conversation' : 'Load this summary'}
                style={{
                  padding: '12px',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s',
                  ':hover': {
                    background: '#f0f0f0',
                    borderColor: '#667eea'
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0';
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f9f9f9';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                {/* Title */}
                <div style={{
                  fontWeight: '600',
                  fontSize: '14px',
                  marginBottom: '4px',
                  color: '#333',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.title || 'Untitled'}
                </div>

                {/* Type badge + Content Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: item.type === 'chat' ? '#e8f4ff' : '#f0fff0',
                    color: item.type === 'chat' ? '#0066cc' : '#006600',
                  }}>
                    {item.type === 'chat' ? '💬 Chat' : '📝 Summary'}
                  </span>
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  lineHeight: '1.4',
                  marginBottom: '6px'
                }}>
                  {(() => {
                    if (item.type === 'chat') {
                      try {
                        const msgs = JSON.parse(item.content || item.summary);
                        const firstUser = msgs.find(m => m.role === 'user');
                        return truncate(firstUser ? firstUser.content : 'Saved chat');
                      } catch { return truncate(item.content || item.summary); }
                    }
                    return truncate(item.summary || item.content);
                  })()}
                </div>

                {/* Date & URL */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: '#999'
                }}>
                  <span>{formatDate(item.timestamp)}</span>
                  {item.url && (
                    <span style={{
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {new URL(item.url).hostname}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid #e0e0e0',
        background: '#f9f9f9',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        {history.length} saved {history.length === 1 ? 'chat' : 'chats'}
      </div>
    </div>
  );
};

export default HistoryView;
