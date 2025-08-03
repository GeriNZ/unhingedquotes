const quoteEl = document.getElementById('quote');
const styleEl = document.getElementById('style');
const resultEl = document.getElementById('result');
const transformBtn = document.getElementById('transformBtn');
const paywall = document.getElementById('paywall');

let originalQuote = '';
let transformedCount = 0;

// Fallback quotes in case API fails
const fallbackQuotes = [
  "Stay hungry, stay foolish. - Steve Jobs",
  "The best way to predict the future is to invent it. - Alan Kay",
  "Code is like humor. When you have to explain it, it's bad. - Cory House"
];

// Style configurations with new unhinged options
const styleOptions = {
  
unhinged: {
    name: "Unhinged",
    systemPrompt: "Take this quote and make it completely unhinged and absurd while keeping the core meaning. Add wild exaggerations and surreal elements."
  },
sarcastic: {
    name: "Sarcastic",
    systemPrompt: "Rewrite this quote in a deeply sarcastic tone, dripping with irony and faux inspiration."
  },

  pirate: {
    name: "Pirate",
    systemPrompt: "You are a salty pirate captain. Respond with nautical jargon, curses, and threats to make people walk the plank."
  },
  shakespeare: {
    name: "Shakespeare",
    systemPrompt: "You are William Shakespeare. Respond in iambic pentameter with elaborate metaphors and archaic language."
  },
  cowboy: {
    name: "Cowboy",
    systemPrompt: "You are a grizzled old cowboy. Respond with drawling western slang and references to tumbleweeds."
  },
  robot: {
    name: "Robot",
    systemPrompt: "You are a highly logical AI. Respond with precise technical language and emotionless analysis."
  },
  valleyGirl: {
    name: "Valley Girl",
    systemPrompt: "You are a 90s valley girl. Respond with like, totally exaggerated speech and, oh my god, so many slang terms."
  },
  aliAbdaal: {
    name: "Ali Abdaal",
    systemPrompt: "You are Ali Abdaal, the cheerful British doctor-turned-productivity-YouTuber. You are relatable. You speak in a warm, conversational tone, often drawing from personal experience. You gently motivate the audience with practical, evidence-backed advice, often using storytelling, relatable analogies, and phrases like ‘to be fair’, ‘if I’m honest’, ‘this is game-changing’, and ‘it’s mad, really’. Use British spelling and end with a light encouragement or a question to keep the vibe friendly and open-ended. Sprinkle in a few emojis for warmth 😊💡✨. Extend on the quote when necessary",
    cssClass: "ali-style"
  },
  conspiracyTheorist: {
    name: "Conspiracy Theorist",
    systemPrompt: "You see hidden meanings in everything. Respond with wild speculation about government cover-ups and secret societies.",
    cssClass: "conspiracy-style"
  },
  medievalBard: {
    name: "Medieval Bard",
    systemPrompt: "You are a traveling minstrel from the Middle Ages. Respond in flowery old English with dramatic flair.",
    cssClass: "medieval-style"
  },
  genZInfluencer: {
    name: "Gen Z Influencer",
    systemPrompt: "You're a teenage TikTok star. Respond with slang, abbreviations, and excessive emojis.",
    cssClass: "genz-style"
  }
};

// Initialize style dropdown
function initStyleDropdown() {
  Object.keys(styleOptions).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = styleOptions[key].name;
    styleEl.appendChild(option);
  });
}

// Strategy 1: Try direct HTTP connection
async function tryDirectHttp() {
  try {
    const res = await fetch('http://api.quotable.io/random');
    if (!res.ok) throw new Error('HTTP request failed');
    return await res.json();
  } catch {
    return null;
  }
}

// Strategy 2: Use a reliable CORS proxy
async function tryProxy() {
  try {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const apiUrl = encodeURIComponent('https://api.quotable.io/random');
    const res = await fetch(proxyUrl + apiUrl);
    if (!res.ok) throw new Error('Proxy request failed');
    return await res.json();
  } catch {
    return null;
  }
}

// Strategy 3: Use alternative API
async function tryAlternativeAPI() {
  try {
    const res = await fetch('https://zenquotes.io/api/random');
    if (!res.ok) throw new Error('Alternative API failed');
    const data = await res.json();
    return { content: data[0].q, author: data[0].a };
  } catch {
    return null;
  }
}

async function fetchQuote() {
  let quoteData = await tryDirectHttp() || 
                 await tryProxy() || 
                 await tryAlternativeAPI();

  if (quoteData) {
    quoteEl.textContent = `${quoteData.content} - ${quoteData.author}`;
    originalQuote = `${quoteData.content} - ${quoteData.author}`;
  } else {
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    quoteEl.textContent = fallbackQuotes[randomIndex];
    originalQuote = fallbackQuotes[randomIndex];
  }
}

async function transformQuote() {
  const styleKey = styleEl.value;
  const style = styleOptions[styleKey];
  
  try {
    const response = await fetch('/.netlify/functions/transform-quote', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        quote: originalQuote, 
        styleConfig: style
      })
    });
    
    if (!response.ok) throw new Error('Transformation failed');
    
    const data = await response.json();
    
    // Apply style-specific CSS class
    resultEl.className = '';
    if (style.cssClass) {
      resultEl.classList.add(style.cssClass);
    }
    
    resultEl.textContent = data.transformed;

    transformedCount++;
    if (transformedCount >= 1) {
      transformBtn.disabled = true;
      paywall.style.display = 'block';
    }
  } catch (err) {
    console.error("Error:", err);
    resultEl.textContent = "Failed to transform. Using fallback quote: " + 
      fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }
}

// Initialize
initStyleDropdown();
fetchQuote();
transformBtn.addEventListener('click', transformQuote);