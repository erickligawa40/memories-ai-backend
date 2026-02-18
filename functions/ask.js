const fs = require('fs');
const path = require('path');

// Load pages.json
const pagesPath = path.join(__dirname, '../pages.json');
let pagesData = {};
try {
  pagesData = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
} catch (err) {
  console.error('Failed to load pages.json:', err);
}

// Simple keyword matching
function findBestPage(query) {
  const lowerQuery = query.toLowerCase();
  let bestScore = 0;
  let bestPage = null;

  for (const page of Object.values(pagesData)) {
    const score = page.keywords.reduce((acc, keyword) => acc + (lowerQuery.includes(keyword.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestPage = page;
    }
  }
  return bestPage;
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: 'Method Not Allowed', headers };
  }

  let question = '';
  try {
    question = JSON.parse(event.body).question || '';
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }), headers };
  }

  if (!question.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Question is required' }), headers };
  }

  const page = findBestPage(question);

  return {
    statusCode: 200,
    body: JSON.stringify({
      answer: page ? page.content : "I don’t have enough information from this website to answer that accurately."
    }),
    headers
  };
};
