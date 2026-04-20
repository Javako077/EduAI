const router = require('express').Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const ChatHistory = require('../models/ChatHistory');
const Performance = require('../models/Performance');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

async function callGemini(contents) {
  const { data } = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents }
  );
  const parts = data.candidates[0].content.parts;
  return parts.find(p => p.text)?.text || '';
}

router.post('/chat', auth, async (req, res) => {
  const { question, language = 'English' } = req.body;
  if (!question) return res.status(400).json({ message: 'Question required' });

  // 1. Fetch recent history for context
  const historyDoc = await ChatHistory.findOne({ userId: req.userId });
  const recentMessages = historyDoc?.messages?.slice(-10) || []; // Last 10 messages for context

  // 2. Format history for Gemini (Map 'assistant' to 'model')
  const historyContext = recentMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const systemPrompt = `You are FutureEdu AI Teacher. Explain concepts clearly, step by step, like a patient and knowledgeable teacher. Always respond in ${language}. 
  
  CRITICAL: Return your response ONLY in the following JSON format:
  {
    "answer": "Your detailed context-aware explanation in ${language}",
    "topic": "The main academic subject in 1-2 words"
  }`;

  // 3. Combine context with the new question
  const contents = [
    ...historyContext,
    {
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nStudent: ${question}\nTeacher:` }]
    }
  ];

  try {
    const rawResponse = await callGemini(contents);

    let answer, topic;
    try {
      const jsonStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      answer = parsed.answer || rawResponse;
      topic = parsed.topic || 'General';
    } catch (e) {
      answer = rawResponse;
      topic = 'General';
    }

    // Save new messages to history
    await ChatHistory.findOneAndUpdate(
      { userId: req.userId },
      { $push: { messages: [{ role: 'user', content: question }, { role: 'assistant', content: answer }] } },
      { upsert: true }
    );

    // Track topic in performance
    const perf = await Performance.findOne({ userId: req.userId });
    if (!perf) {
      await Performance.create({ userId: req.userId, topics: [{ name: topic, questionsAsked: 1 }] });
    } else {
      const idx = perf.topics.findIndex(t => t.name === topic);
      if (idx >= 0) perf.topics[idx].questionsAsked += 1;
      else perf.topics.push({ name: topic, questionsAsked: 1 });
      await perf.save();
    }

    res.json({ answer });
  } catch (err) {
    console.error('CHAT ERROR:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI service error', detail: err.response?.data?.error?.message || err.message });
  }
});

router.get('/history', auth, async (req, res) => {
  const history = await ChatHistory.findOne({ userId: req.userId });
  res.json(history?.messages || []);
});

module.exports = router;
