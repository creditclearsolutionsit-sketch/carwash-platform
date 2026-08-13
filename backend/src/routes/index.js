const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Auth routes - this file MUST exist
try {
  const authRoutes = require('./authRoutes');
  router.use('/auth', authRoutes);
  console.log('authRoutes loaded');
} catch(e) {
  console.log('authRoutes missing:', e.message);
  // Fallback login without file
  const { login } = require('../controllers/authController');
  router.post('/auth/login', login);
}

// TEMP SEED
router.get('/seed', async (req, res) => {
  try {
    const hash = await bcrypt.hash('Admin@123', 10);
    await User.destroy({ where: { email: 'admin@carwash.local' } });
    const user = await User.create({ name: 'Admin', email: 'admin@carwash.local', password: hash, role: 'admin' });
    res.json({ message: 'Admin created', email: user.email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;