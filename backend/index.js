const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/chat'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/', (req, res) => res.send('FutureEdu API running'));

// Connect to MongoDB and then start the server
const startServer = async () => {
  try {
    // Disable buffering so we don't hang if DB is down
    mongoose.set('bufferCommands', false);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('ETIMEOUT') || err.message.includes('selection timed out')) {
      console.error('👉 TIP: Check if your IP is whitelisted in MongoDB Atlas (0.0.0.0/0 for hosting).');
    }

    // Start the server anyway so the app doesn't crash on Vercel, 
    // but queries will fail with a clear error.
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Server started in limited mode (No DB Connection)`));
  }
};

startServer();
