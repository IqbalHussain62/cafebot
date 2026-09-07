require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));
app.use(express.json());

// Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Simple in-memory session storage
const sessions = {};

// Load menu data
function loadMenu() {
  try {
    const menuPath = path.join(__dirname, '../data/menu.json');
    return JSON.parse(fs.readFileSync(menuPath, 'utf8'));
  } catch (err) {
    return {
      cafe_name: "CafeBot Cafe",
      items: [
        { id: 1, name: "Espresso", price: 2.5, category: "Coffee" },
        { id: 2, name: "Cappuccino", price: 3.5, category: "Coffee" },
        { id: 3, name: "Latte", price: 3.8, category: "Coffee" },
        { id: 4, name: "Croissant", price: 2.0, category: "Pastry" },
        { id: 5, name: "Sandwich", price: 5.5, category: "Food" }
      ]
    };
  }
}

// Load system prompt
function loadSystemPrompt() {
  try {
    const promptPath = path.join(__dirname, '../prompts/system-prompt.md');
    return fs.readFileSync(promptPath, 'utf8');
  } catch (err) {
    return `You are CafeBot, a friendly assistant for a small cafe. 
Help customers with the menu and taking orders. 
Be polite, clear, and helpful. 
Only use items from the menu. 
Do not invent prices or items.`;
  }
}

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'CafeBot backend is running',
    message: 'Welcome to CafeBot API'
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set' });
    }

    // Initialize session if needed
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        messages: [],
        order: []
      };
    }

    const session = sessions[sessionId];
    const menu = loadMenu();
    const systemPrompt = loadSystemPrompt();

    // Add user message
    session.messages.push({ role: 'user', content: message });

    // Keep only last 10 messages
    if (session.messages.length > 10) {
      session.messages = session.messages.slice(-10);
    }

    const response = await anthropic.messages.create({
      model: process.env.AI_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: parseInt(process.env.AI_MAX_TOKENS) || 600,
      system: systemPrompt + `\n\nCurrent Menu:\n${JSON.stringify(menu, null, 2)}`,
      messages: session.messages
    });

    const botReply = response.content[0].text;

    // Save bot reply
    session.messages.push({ role: 'assistant', content: botReply });

    res.json({
      reply: botReply,
      sessionId,
      order: session.order
    });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ 
      error: 'Something went wrong',
      details: error.message 
    });
  }
});

// Get current order
app.get('/api/order', (req, res) => {
  const sessionId = req.query.sessionId || 'default';
  const session = sessions[sessionId] || { order: [] };
  res.json({ order: session.order });
});

// Simple orders list for dashboard
app.get('/api/orders', (req, res) => {
  res.json({ orders: [] }); // Placeholder - can be improved later
});

// Start server
app.listen(PORT, () => {
  console.log(`CafeBot backend running on port ${PORT}`);
});