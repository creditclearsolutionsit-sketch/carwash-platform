const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- LOGIN BYPASS ---
router.post('/auth/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const [rows] = await sequelize.query(`SELECT * FROM "Users" WHERE email=:email LIMIT 1`, {replacements:{email}});
    const user = rows[0];
    if(!user) return res.status(401).json({error:'Invalid'});
    const hash = user.password_hash || user.password;
    const ok = await bcrypt.compare(password, hash);
    if(!ok) return res.status(401).json({error:'Invalid'});
    const token = jwt.sign({id:user.id,email:user.email,role:user.role}, process.env.JWT_SECRET||'carwash_secret_key_123', {expiresIn:'7d'});
    res.json({token, user});
  }catch(e){ res.status(500).json({error:e.message}); }
});

// --- CUSTOMERS BYPASS ---
router.get('/customers', async (req,res)=>{
  try{
    const [rows] = await sequelize.query(`SELECT * FROM "Customers" ORDER BY "createdAt" DESC`);
    res.json(rows);
  }catch(e){
    // if table doesn't exist, create it
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Customers" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255),
        email VARCHAR(255),
        notes TEXT,
        "BranchId" INTEGER DEFAULT 1,
        "loyaltyPoints" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const [rows] = await sequelize.query(`SELECT * FROM "Customers" ORDER BY "createdAt" DESC`);
    res.json(rows);
  }
});

router.post('/customers', async (req,res)=>{
  try{
    const { name, phone, email, notes } = req.body;
    if(!name) return res.status(400).json({error:'Name required'});
    const [result] = await sequelize.query(`
      INSERT INTO "Customers" (id, name, phone, email, notes, "BranchId", "loyaltyPoints", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), :name, :phone, :email, :notes, 1, 0, NOW(), NOW())
      RETURNING *
    `, {replacements:{name, phone: phone||'', email: email||'', notes: notes||''}});
    res.json(result[0]);
  }catch(e){
    console.error(e);
    res.status(500).json({error:e.message});
  }
});

// --- SEED (keep for now) ---
router.get('/seed', async (req,res)=>{
  try{
    const hash = await bcrypt.hash('Admin@123',10);
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await sequelize.query(`DROP TABLE IF EXISTS "Users" CASCADE`);
    await sequelize.query(`CREATE TABLE "Users" (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(255) DEFAULT 'admin', "BranchId" INTEGER, "createdAt" TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL)`);
    await sequelize.query(`CREATE TABLE IF NOT EXISTS "Branches" (id SERIAL PRIMARY KEY, name VARCHAR(255), address VARCHAR(255), "createdAt" TIMESTAMPTZ, "updatedAt" TIMESTAMPTZ)`);
    await sequelize.query(`INSERT INTO "Branches" (id, name, address, "createdAt", "updatedAt") VALUES (1,'Main Branch','123 Main Rd',NOW(),NOW()) ON CONFLICT (id) DO NOTHING`);
    await sequelize.query(`INSERT INTO "Users" (name,email,password,password_hash,role,"BranchId","createdAt","updatedAt") VALUES ('Admin','admin@carwash.local',:h,:h,'admin',1,NOW(),NOW())`, {replacements:{h:hash}});
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Customers" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255),
        email VARCHAR(255),
        notes TEXT,
        "BranchId" INTEGER DEFAULT 1,
        "loyaltyPoints" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    res.json({ok:true});
  }catch(e){ res.status(500).json({error:e.message}); }
});

const authRoutes = require('./authRoutes');
router.use('/auth', authRoutes);

module.exports = router;
