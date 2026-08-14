const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

try { router.use('/auth', require('./authRoutes')); } catch(e){}

router.get('/seed', async (req,res)=>{
  try{
    await sequelize.query(`DROP TABLE IF EXISTS "Users" CASCADE;`);
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await sequelize.query(`
      CREATE TABLE "Users" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "role" VARCHAR(255) DEFAULT 'admin',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);
    const hash = await bcrypt.hash('Admin@123',10);
    await sequelize.query(`INSERT INTO "Users" ("id","name","email","password","role","createdAt","updatedAt") VALUES (uuid_generate_v4(), 'Admin','admin@carwash.local','${hash}','admin', NOW(), NOW())`);
    res.json({ok:true,message:'Admin created with raw SQL - login now'});
  }catch(e){ res.status(500).json({error:e.message,stack:e.stack}); }
});

module.exports=router;