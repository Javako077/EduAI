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

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  console.log(`Body:`, JSON.stringify(req.body));
  const oldJson = res.json;
  res.json = function (data) {
    console.log(`[${new Date().toISOString()}] Response ${res.statusCode}:`, JSON.stringify(data).substring(0, 200));
    return oldJson.apply(res, arguments);
  };
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/chat'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/', (req, res) => res.send('FutureEdu API running'));

// Validate required environment variables
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'MAILERSEND_API_KEY', 'MAILERSEND_SENDER'];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.error(`🚨 CRITICAL: Environment variable ${env} is missing!`);
  }
});


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  if (err.message.includes('ETIMEOUT') || err.message.includes('selection timed out')) {
    console.error('👉 TIP: Check if your IP is whitelisted in MongoDB Atlas (0.0.0.0/0 for hosting).');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server if run directly (e.g. nodemon), otherwise export for serverless (Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
}

module.exports = app;
