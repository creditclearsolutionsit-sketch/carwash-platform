const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const bookingRoutes = require('./bookingRoutes');
const serviceRoutes = require('./serviceRoutes');
const inventoryRoutes = require('./inventoryRoutes');

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes);
router.use('/inventory', inventoryRoutes);

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