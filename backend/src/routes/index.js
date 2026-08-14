const express = require('express');
const router = express.Router();
const { User } = require('../models');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

try {
  const authRoutes = require('./authRoutes');
  router.use('/auth', authRoutes);
} catch(e) {}

router.get('/seed', async (req, res) => {
  try {
    // Fix the broken id column
    await sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname='public' AND sequencename='Users_id_seq') THEN
          CREATE SEQUENCE "Users_id_seq";
        END IF;
      END $$;
    `);
    await sequelize.query(`ALTER TABLE "Users" ALTER COLUMN "id" SET DEFAULT nextval('"Users_id_seq"');`);
    await sequelize.query(`ALTER SEQUENCE "Users_id_seq" OWNED BY "Users"."id";`);
    await sequelize.query(`SELECT setval('"Users_id_seq"', COALESCE((SELECT MAX("id") FROM "Users"), 0) + 1, false);`);

    await User.destroy({ where: { email: 'admin@carwash.local' } });
    
    const user = await User.create({ 
      name: 'Admin', 
      email: 'admin@carwash.local', 
      password: 'Admin@123',
      role: 'admin' 
    });
    
    res.json({ ok: true, email: user.email, id: user.id, message: 'Admin created - NOW LOGIN' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

module.exports = router;