const fs = require('fs');
const path = require('path');

// Load pages.json once
const pagesPath = path.join(__dirname, '../pages.json');
let pagesData = {};
try {
  pagesData = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
  console.log('Pages loaded.');
} catch (err) {
  console.error('Failed to load pages.json:', err);
}

// Simple keyword scoring
function findBestPage(query) {
  const lowerQuery = query.toLowerCase();
  let bestScore = 0;
  let bestPage = null;

  for (const page of Object.values(pagesData)) {
    let score = page.keywords.reduce(
      (acc, keyword) => acc + (lowerQuery.includes(keyword.toLowerCase()) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestPage = page;
    }
  }

  return bestPage;
}

// Netlify Function Handler
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let question = '';
  try {
    question = JSON.parse(event.body).question || '';
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!question.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Question is required' }) };
  }

  const page = findBestPage(question);

  return {
    statusCode: 200,
    body: JSON.stringify({
      answer: page ? page.content : "I don’t have enough information from this website to answer that accurately."
    })
  };
};
