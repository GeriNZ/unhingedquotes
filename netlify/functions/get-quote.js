import https from 'https';
import fetch from 'node-fetch';

// Configure agent to handle SSL issues
const agent = new https.Agent({ rejectUnauthorized: false });

// List of backup API endpoints
const API_ENDPOINTS = [
  'https://stoic-quotes.com/api/quote',  // Most reliable fallback
  'https://zenquotes.io/api/random',
  'https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en'
];

// Local fallback quotes
const FALLBACK_QUOTES = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { content: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { content: "Stay hungry, stay foolish.", author: "Steve Jobs" }
];

export const handler = async () => {
  // Try each API endpoint in order
  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, { agent, timeout: 3000 });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      // Format response based on API
      let quote;
      if (endpoint.includes('stoic')) {
        quote = { content: data.text, author: data.author };
      } else if (endpoint.includes('zenquotes')) {
        quote = { content: data[0].q, author: data[0].a };
      } else {
        quote = { content: data.quoteText, author: data.quoteAuthor || "Unknown" };
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify(quote)
      };
      
    } catch (error) {
      console.log(`Failed to fetch from ${endpoint}:`, error.message);
      // Try next endpoint
    }
  }

  // If all APIs failed, use local fallback
  const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return {
    statusCode: 200,
    body: JSON.stringify(FALLBACK_QUOTES[randomIndex])
  };
};