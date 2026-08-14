const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- BYPASS LOGIN - uses raw SQL, no User model ---
router.post('/auth/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    // find user with raw SQL that works with BOTH schemas
    const [rows] = await sequelize.query(
      `SELECT * FROM "Users" WHERE email = :email LIMIT 1`,
      { replacements: { email } }
    );
    const user = rows[0];
    if(!user) return res.status(401).json({error:'Invalid email or password'});

    // try both columns
    const hashToCheck = user.password_hash || user.password;
    if(!hashToCheck) return res.status(401).json({error:'No password set'});

    const ok = await bcrypt.compare(password, hashToCheck);
    if(!ok) return res.status(401).json({error:'Invalid email or password'});

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'carwash_secret_key_123',
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  }catch(e){
    console.error('LOGIN ERROR', e);
    res.status(500).json({error:e.message});
  }
});

// --- SEED that creates BOTH columns ---
router.get('/seed', async (req,res)=>{
  try{
    const hash = await bcrypt.hash('Admin@123',10);
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await sequelize.query(`DROP TABLE IF EXISTS "Users" CASCADE`);
    await sequelize.query(`
      CREATE TABLE "Users" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(255) DEFAULT 'admin',
        "BranchId" INTEGER,
        "createdAt" TIMESTAMPTZ NOT NULL,
        "updatedAt" TIMESTAMPTZ NOT NULL
      )
    `);
    await sequelize.query(`CREATE TABLE IF NOT EXISTS "Branches" (id SERIAL PRIMARY KEY, name VARCHAR(255), address VARCHAR(255), "createdAt" TIMESTAMPTZ, "updatedAt" TIMESTAMPTZ)`);
    await sequelize.query(`INSERT INTO "Branches" (id, name, address, "createdAt", "updatedAt") VALUES (1,'Main Branch','123 Main Rd',NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
    await sequelize.query(`INSERT INTO "Users" (name,email,password,password_hash,role,"BranchId","createdAt","updatedAt") VALUES ('Admin','admin@carwash.local',:h,:h,'admin',1,NOW(),NOW())`, {replacements:{h:hash}});
    res.json({ok:true, message:'Seeded with raw-SQL login bypass', login:{email:'admin@carwash.local', password:'Admin@123'}});
  }catch(e){
    res.status(500).json({error:e.message, stack:e.stack});
  }
});

const authRoutes = require('./authRoutes');
router.use('/auth', authRoutes);

module.exports = router;
