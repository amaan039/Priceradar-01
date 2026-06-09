const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/compare', async (req, res) => {
  try {
    const { query } = req.body;
    const prompt = `You are an India-focused price comparison engine. The user is searching for: "${query}". Find TOP 3 cheapest Indian retailers. Respond ONLY in this exact JSON format (no markdown, no backticks):
{
  "product": "product name",
  "results": [
    {"rank": 1, "site": "Amazon.in", "price": "79999", "currency_symbol": "₹", "url": "https://www.amazon.in/s?k=${encodeURIComponent(query)}", "note": "No Cost EMI available"},
    {"rank": 2, "site": "Flipkart", "price": "81999", "currency_symbol": "₹", "url": "https://www.flipkart.com/search?q=${encodeURIComponent(query)}", "note": "Exchange offer available"},
    {"rank": 3, "site": "Croma", "price": "84990", "currency_symbol": "₹", "url": "https://www.croma.com/searchB?q=${encodeURIComponent(query)}", "note": "Free delivery"}
  ],
  "note": "Summary of best deal."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
        })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ result: text });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));