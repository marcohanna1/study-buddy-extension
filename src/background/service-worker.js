// Background service worker - handles API calls to Google Gemini

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
// Get API key from storage
async function getApiKey() {
  const result = await chrome.storage.sync.get(['geminiApiKey']);
  return result.geminiApiKey || '';
}

// Call Google Gemini API
async function callGemini(prompt, apiKey, maxTokens = 1024) {
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: maxTokens,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Parse the error into something human-readable
    if (response.status === 400) throw new Error('BAD_REQUEST');
    if (response.status === 401 || response.status === 403) throw new Error('BAD_API_KEY');
    if (response.status === 429) throw new Error('RATE_LIMIT');
    if (response.status >= 500) throw new Error('SERVER_ERROR');
    throw new Error(`API_ERROR:${response.status}`);
  }

  const data = await response.json();
  
  // Check for content blocking
  if (data.candidates?.[0]?.finishReason === 'SAFETY') {
    throw new Error('SAFETY_BLOCK');
  }
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || text.trim().length < 2) throw new Error('EMPTY_RESPONSE');
  
  return text;
}

// Handle summarization
async function handleSummarize(pageContent, language, readingLevel) {
  const apiKey = await getApiKey();

  const levelGuide = {
    'Elementary':    'Use very simple words and short sentences. Explain like the reader is 10 years old.',
    'Middle School': 'Use clear, straightforward language. Avoid jargon.',
    'High School':   'Use standard language. Some technical terms are fine if explained briefly.',
    'College':       'Use precise, academic language. Technical terms are fine.',
  }[readingLevel] || 'Use standard language.';

  const prompt = `You are a concise study assistant. Create a brief, scannable summary of this webpage.

RULES:
- Maximum 150 words
- Use 3-5 bullet points
- Focus on KEY facts and main ideas only
- Skip introductions and filler
- Do NOT write an intro sentence — start directly with the first bullet point
- ${levelGuide}
- Write in ${language}

Content:
${pageContent.slice(0, 8000)}

Summary in ${language}:`;

  const summary = await callGemini(prompt, apiKey, 800);
  return { summary };
}


async function handleChat(message, pageContent, language, readingLevel, conversationHistory) {
  const apiKey = await getApiKey();

  const levelGuide = {
    'Elementary':    'Use very simple words. Explain like the reader is 10 years old. Short sentences.',
    'Middle School': 'Use clear, plain language. Avoid jargon.',
    'High School':   'Use standard language. Brief explanations of technical terms if needed.',
    'College':       'Use precise, academic language. Technical terms are fine.',
  }[readingLevel] || 'Use standard language.';

  // Detect if the user is asking for a summary so we apply proper formatting rules
  const summaryKeywords = ['summarize', 'summary', 'sum up', 'overview', 'tldr', 'tl;dr', 'key points', 'main points'];
  const isSummaryRequest = summaryKeywords.some(kw => message.toLowerCase().includes(kw));

  const summaryInstruction = isSummaryRequest
    ? 'If asked to summarize, respond with 3-5 bullet points, max 150 words, key facts only. No intro sentence, just the bullets.'
    : '';

  const recentHistory = (conversationHistory || []).slice(-6);
  const historyText = recentHistory
    .map(msg => `${msg.role === 'user' ? 'Student' : 'Buddy'}: ${msg.content.slice(0, 300)}`)
    .join('\n');

  const pageSnippet = pageContent.slice(0, 400);

  const prompt = `You are Study Buddy, a friendly AI tutor. Be concise. Reply in ${language}. ${levelGuide} ${summaryInstruction}

Page context: ${pageSnippet}

${historyText ? `Conversation so far:\n${historyText}\n` : ''}Student: ${message}
Buddy:`;

  const reply = await callGemini(prompt, apiKey);
  return { reply: reply.trim() };
}


// AWS API Configuration
const AWS_API_BASE = 'https://f3a0j5vbp3.execute-api.us-east-1.amazonaws.com/prod';

// Get or create unique user ID for this extension installation
async function getUserID() {
  const result = await chrome.storage.local.get(['userID']);
  if (result.userID) {
    return result.userID;
  }
  
  // Generate new unique ID
  const newUserID = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  await chrome.storage.local.set({ userID: newUserID });
  return newUserID;
}

// Save summary to AWS
async function saveSummary(summary, url, title, type = 'summary') {
  try {
    const userID = await getUserID();
    
    const data = {
      userID: userID,
      type: type,
      content: summary,
      pageUrl: url,
      pageTitle: title
    };
    
    const response = await fetch(`${AWS_API_BASE}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      return { success: true, timestamp: result.timestamp };
    } else {
      throw new Error(result.error || 'Failed to save');
    }
  } catch (error) {
    console.error('Error saving to AWS:', error);
    return { success: false, error: error.message };
  }
}

// Get saved summaries from AWS
async function getSummaries() {
  try {
    const userID = await getUserID();
    
    const response = await fetch(`${AWS_API_BASE}/history?userID=${userID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Transform AWS data format to match what the popup expects
      const summaries = result.items.map(item => ({
        summary: item.content,
        url: item.pageUrl,
        title: item.pageTitle,
        timestamp: new Date(item.timestamp).toISOString(),
        type: item.type || 'summary'
      }));
      
      return { summaries };
    } else {
      throw new Error(result.error || 'Failed to fetch');
    }
  } catch (error) {
    console.error('Error fetching from AWS:', error);
    return { summaries: [] };
  }
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      let response;

      switch (request.action) {
        case 'summarize':
          response = await handleSummarize(request.pageContent, request.language, request.readingLevel);
          break;

        case 'chat':
          response = await handleChat(
            request.message,
            request.pageContent,
            request.language,
            request.readingLevel,
            request.conversationHistory
          );
          break;

        case 'saveSummary':
          response = await saveSummary(
            request.summary,
            request.url,
            request.title,
            request.type || 'summary'
          );
          break;

        case 'getSummaries':
          response = await getSummaries();
          break;

        default:
          response = { error: 'Unknown action' };
      }

      sendResponse(response);
    } catch (error) {
      console.error('Background script error:', error);
      // Translate error codes into user-friendly messages
      const errorMessages = {
        'NO_API_KEY':    'No API key set — open Settings (⚙️) and add your Gemini key.',
        'BAD_API_KEY':   'Invalid API key — double-check it in Settings (⚙️).',
        'RATE_LIMIT':    'Rate limit hit — you\'ve made too many requests. Wait a minute and try again.',
        'SERVER_ERROR':  'Gemini server error — try again in a moment.',
        'SAFETY_BLOCK':  'Response blocked by Gemini\'s safety filter.',
        'EMPTY_RESPONSE':'Gemini returned an empty response — try rephrasing.',
        'BAD_REQUEST':   'Request error — try a shorter question.',
      };
      const friendly = errorMessages[error.message] || `Error: ${error.message}`;
      sendResponse({ error: friendly });
    }
  })();

  return true; // Keep message channel open for async response
});

console.log('Study Buddy background service worker loaded!');
