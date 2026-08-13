const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Try to load auth routes if file exists
try {
  const authRoutes = require('./authRoutes');
  router.use('/auth', authRoutes);
} catch(e) { console.log('authRoutes not loaded', e.message); }

// TEMP SEED - DELETE AFTER LOGIN WORKS
router.get('/seed', async (req, res) => {
  try {
    const hash = await bcrypt.hash('Admin@123', 10);
    await User.destroy({ where: { email: 'admin@carwash.local' } });
    const user = await User.create({ name: 'Admin', email: 'admin@carwash.local', password: hash, role: 'admin' });
    res.json({ message: 'Admin created', email: user.email });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;