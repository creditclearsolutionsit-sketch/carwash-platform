const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');

try {
  const authRoutes = require('./authRoutes');
  router.use('/auth', authRoutes);
} catch(e) {}

router.get('/seed', async (req, res) => {
  try {
    const hash = await bcrypt.hash('Admin@123', 10);
    await User.destroy({ where: { email: 'admin@carwash.local' } });
    // Use plain password so hook hashes it ONCE
    const user = await User.create({ 
      name: 'Admin', 
      email: 'admin@carwash.local', 
      password: 'Admin@123',
      role: 'admin' 
    });
    res.json({ ok: true, email: user.email, message: 'Admin created - now login' });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

module.exports = router;