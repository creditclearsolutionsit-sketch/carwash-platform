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
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(255) DEFAULT 'admin',
        "BranchId" INTEGER,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);

    await sequelize.query(`CREATE TABLE IF NOT EXISTS "Branches" (id SERIAL PRIMARY KEY, name VARCHAR(255), address VARCHAR(255), "createdAt" TIMESTAMP, "updatedAt" TIMESTAMP)`);
    await sequelize.query(`INSERT INTO "Branches" (id, name, address, "createdAt", "updatedAt") VALUES (1, 'Main Branch', '123 Main Rd', NOW(), NOW()) ON CONFLICT (id) DO NOTHING`);

    await sequelize.query(
      `INSERT INTO "Users" (name, email, password, password_hash, role, "BranchId", "createdAt", "updatedAt") VALUES ('Admin', 'admin@carwash.local', :hash, :hash, 'admin', 1, NOW(), NOW())`,
      { replacements: { hash } }
    );

    res.json({ok:true, message:'Admin created with BOTH columns - login now'});
  }catch(e){
    console.error(e);
    res.status(500).json({error:e.message, stack:e.stack});
  }
});

router.use('/auth', authRoutes);
module.exports = router;
