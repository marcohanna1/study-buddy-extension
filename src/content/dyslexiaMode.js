const STYLE_ID = "sb-dyslexia-style";
const CLASS_ID = "sb-dyslexia-enabled";

function ensureStyleTag() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;

  const fontUrl = chrome.runtime.getURL("fonts/OpenDyslexic-Regular.otf");

  style.textContent = `
    @font-face {
      font-family: "OpenDyslexic";
      src: url("${fontUrl}") format("opentype");
      font-weight: normal;
      font-style: normal;
    }

    /* Apply only when toggled */
    body.${CLASS_ID}, body.${CLASS_ID} * {
      font-family: "OpenDyslexic", Arial, sans-serif !important;
      letter-spacing: 0.12em !important;
      line-height: 1.6 !important;
    }
  `;

  document.head.appendChild(style);
}

function setEnabled(enabled) {
  ensureStyleTag();
  document.body.classList.toggle(CLASS_ID, !!enabled);
}

export function initDyslexiaMode() {
  // Handle popup toggle messages
  chrome.runtime.onMessage.addListener((request) => {
    if (request?.action === "toggleDyslexia") {
      setEnabled(!!request.enabled);
    }
  });

  // Handle window events from StudyBuddy buttons
  window.addEventListener('sb:toggle-dyslexia', () => {
    const isCurrentlyEnabled = document.body.classList.contains(CLASS_ID);
    setEnabled(!isCurrentlyEnabled);
  });

  // Auto-apply from storage on page load
  chrome.storage.sync.get(["dyslexiaEnabled"], ({ dyslexiaEnabled }) => {
    setEnabled(!!dyslexiaEnabled);
  });
}
