const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');

try {
  const authRoutes = require('./authRoutes');
  router.use('/auth', authRoutes);
} catch(e) {}

router.get('/seed', async (req, res) => {
  try {
    // Recreate Users table correctly as UUID
    await sequelize.query(`DROP TABLE IF EXISTS "Users" CASCADE;`);
    const { User } = require('../models');
    await User.sync({ force: true });

    const user = await User.create({ 
      name: 'Admin', 
      email: 'admin@carwash.local', 
      password: 'Admin@123',
      role: 'admin' 
    });
    
    res.json({ ok: true, email: user.email, id: user.id, message: 'Admin created - LOGIN NOW' });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

module.exports = router;