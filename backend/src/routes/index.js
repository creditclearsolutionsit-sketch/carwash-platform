const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const authRoutes = require('./authRoutes');

router.get('/seed', async (req,res)=>{
  try{
    const hash = await bcrypt.hash('Admin@123',10);
    await sequelize.query(`DROP TABLE IF EXISTS "Users" CASCADE`);
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
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
    res.json({ok:true, logins:[{email:'admin@carwash.local', password:'Admin@123'}]});
  }catch(e){ res.status(500).json({error:e.message, stack:e.stack}); }
});

router.use('/auth', authRoutes);
module.exports = router;
