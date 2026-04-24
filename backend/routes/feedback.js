const router = require('express').Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

router.post('/', auth, async (req, res) => {
  try {
    const { type, rating, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message required' });
    const user = await User.findById(req.userId).select('name email');
    const fb = await Feedback.create({
      userId: req.userId,
      name: user?.name,
      email: user?.email,
      type, rating, message
    });
    res.status(201).json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine', auth, async (req, res) => {
  const list = await Feedback.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(list);
});

module.exports = router;
