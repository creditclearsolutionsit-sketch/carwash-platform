const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const authRoutes = require('./authRoutes');

router.get('/seed', async (req,res)=>{
  try{
    const adminHash = await bcrypt.hash('Admin@123',10);
    const managerHash = await bcrypt.hash('Manager@123',10);
    const staffHash = await bcrypt.hash('Staff@123',10);

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

    await sequelize.query(`DELETE FROM "Users" WHERE email IN ('admin@carwash.local','manager@carwash.local','staff@carwash.local')`);
    
    await sequelize.query(`INSERT INTO "Users" (name, email, password, password_hash, role, "BranchId", "createdAt", "updatedAt") VALUES ('Admin', 'admin@carwash.local', :h1, :h1, 'admin', 1, NOW(), NOW())`, {replacements:{h1:adminHash}});
    await sequelize.query(`INSERT INTO "Users" (name, email, password, password_hash, role, "BranchId", "createdAt", "updatedAt") VALUES ('Manager', 'manager@carwash.local', :h2, :h2, 'manager', 1, NOW(), NOW())`, {replacements:{h2:managerHash}});
    await sequelize.query(`INSERT INTO "Users" (name, email, password, password_hash, role, "BranchId", "createdAt", "updatedAt") VALUES ('Staff', 'staff@carwash.local', :h3, :h3, 'staff', 1, NOW(), NOW())`, {replacements:{h3:staffHash}});

    res.json({
      ok:true,
      logins:[
        {email:'admin@carwash.local', password:'Admin@123', role:'admin'},
        {email:'manager@carwash.local', password:'Manager@123', role:'manager'},
        {email:'staff@carwash.local', password:'Staff@123', role:'staff'}
      ]
    });
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

router.use('/auth', authRoutes);
module.exports = router;
