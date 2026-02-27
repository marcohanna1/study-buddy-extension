import React from 'react';
import { createRoot } from 'react-dom/client';
import StudyBuddy from './StudyBuddy';
import { initDyslexiaMode } from './dyslexiaMode';
import { initTTS } from './tts';

// Create a container for the Study Buddy
const init = () => {
  // Check if already injected
  if (document.getElementById('study-buddy-root')) {
    return;
  }

  // Initialize dyslexia mode
  initDyslexiaMode();

  // Initialize TTS (floating button on text selection)
  initTTS();

  // Create root element
  const rootElement = document.createElement('div');
  rootElement.id = 'study-buddy-root';
  
  // Add to page
  document.body.appendChild(rootElement);

  // Render React component
  const root = createRoot(rootElement);
  root.render(<StudyBuddy />);
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
