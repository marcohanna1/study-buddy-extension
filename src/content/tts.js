
const ELEVENLABS_API_KEY = 'sk_f1671aff2652558ed2593ef1cb3ef897a0f4abe62362b4e5';

const VOICE_ID = 'hpp4J3VqNfWAUOO0d1Us';

let ttsButton = null;
let currentAudio = null;
let isPlaying = false;

function createTTSButton() {
  const btn = document.createElement('div');
  btn.id = 'sb-tts-button';
  btn.innerHTML = '🔊';

  Object.assign(btn.style, {
    position:       'fixed',
    zIndex:         '2147483647',
    display:        'none',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '40px',
    height:         '40px',
    borderRadius:   '50%',
    background:     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color:          'white',
    fontSize:       '18px',
    cursor:         'pointer',
    boxShadow:      '0 2px 12px rgba(102,126,234,0.5)',
    userSelect:     'none',
    transition:     'transform 0.15s ease, box-shadow 0.15s ease',
    border:         '2px solid white',
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.15)';
    btn.style.boxShadow = '0 4px 20px rgba(102,126,234,0.7)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 2px 12px rgba(102,126,234,0.5)';
  });

  btn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const selected = window.getSelection()?.toString().trim();
    if (!selected) return;
    if (isPlaying) {
      stopAudio();
    } else {
      speakText(selected);
    }
  });

  document.body.appendChild(btn);
  ttsButton = btn;
}

function showButton(x, y) {
  if (!ttsButton) return;
  ttsButton.style.left    = `${x}px`;
  ttsButton.style.top     = `${y}px`;
  ttsButton.style.display = 'flex';
  setButtonIcon('🔊');
}

function hideButton() {
  if (!ttsButton) return;
  ttsButton.style.display = 'none';
  stopAudio();
}

function setButtonIcon(icon) {
  if (ttsButton) ttsButton.innerHTML = icon;
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  isPlaying = false;
  setButtonIcon('🔊');
}

async function speakText(text) {
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'YOUR_ELEVENLABS_API_KEY_HERE') {
    // Fallback to browser speech synthesis
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 5000));
    isPlaying = true;
    setButtonIcon('⏹️');
    utterance.onend = () => { isPlaying = false; setButtonIcon('🔊'); };
    window.speechSynthesis.speak(utterance);
    return;
  }

  const safeText = text.slice(0, 5000);

  try {
    isPlaying = true;
    setButtonIcon('⏳');

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key':   ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept':       'audio/mpeg',
        },
        body: JSON.stringify({
          text: safeText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      // Fallback to browser TTS if ElevenLabs fails
      const utterance = new SpeechSynthesisUtterance(safeText);
      setButtonIcon('⏹️');
      utterance.onend = () => { isPlaying = false; setButtonIcon('🔊'); };
      window.speechSynthesis.speak(utterance);
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl  = URL.createObjectURL(audioBlob);

    currentAudio = new Audio(audioUrl);
    setButtonIcon('⏹️');

    currentAudio.addEventListener('ended', () => {
      isPlaying = false;
      setButtonIcon('🔊');
      URL.revokeObjectURL(audioUrl);
    });
    currentAudio.addEventListener('error', () => {
      isPlaying = false;
      setButtonIcon('🔊');
    });

    await currentAudio.play();

  } catch (error) {
    console.error('[StudyBuddy TTS] Error:', error);
    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(safeText);
    isPlaying = true;
    setButtonIcon('⏹️');
    utterance.onend = () => { isPlaying = false; setButtonIcon('🔊'); };
    window.speechSynthesis.speak(utterance);
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '30px',
    left:         '50%',
    transform:    'translateX(-50%)',
    background:   '#333',
    color:        'white',
    padding:      '10px 18px',
    borderRadius: '8px',
    fontSize:     '13px',
    zIndex:       '2147483647',
    boxShadow:    '0 2px 10px rgba(0,0,0,0.3)',
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Show/hide button based on text selection
document.addEventListener('mouseup', (e) => {
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selectedText || selectedText.length < 2) {
      hideButton();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect  = range.getBoundingClientRect();

    const btnX = Math.min(rect.right - 20, window.innerWidth - 50);
    const btnY = Math.max(rect.top - 50, 10);

    showButton(btnX, btnY);
  }, 10);
});

// Hide when clicking elsewhere
document.addEventListener('mousedown', (e) => {
  if (ttsButton && e.target !== ttsButton) {
    const rect = ttsButton.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top  && e.clientY <= rect.bottom;
    if (!inside) hideButton();
  }
});

export function initTTS() {
  if (document.getElementById('sb-tts-button')) return;
  createTTSButton();
  console.log('[StudyBuddy] TTS module loaded ✅');
}
