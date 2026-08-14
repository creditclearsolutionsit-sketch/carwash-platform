const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const authRoutes = require('./authRoutes');

router.get('/seed', async (req,res)=>{
  try{
    const hash = await bcrypt.hash('Admin@123',10);

    // create Branch table if needed and get id
    await sequelize.query(`CREATE TABLE IF NOT EXISTS "Branches" (id SERIAL PRIMARY KEY, name VARCHAR(255), address VARCHAR(255), "createdAt" TIMESTAMP, "updatedAt" TIMESTAMP)`);
    const [branchResult] = await sequelize.query(`INSERT INTO "Branches" (name, address, "createdAt", "updatedAt") VALUES ('Main Branch','123 Main Rd',NOW(),NOW()) ON CONFLICT DO NOTHING RETURNING id`);
    let branchId = branchResult[0]?.id;
    if(!branchId){
      const [rows] = await sequelize.query(`SELECT id FROM "Branches" WHERE name='Main Branch' LIMIT 1`);
      branchId = rows[0]?.id || 1;
    }

    await sequelize.query(`DELETE FROM "Users" WHERE email='admin@carwash.local'`);
    await sequelize.query(
      `INSERT INTO "Users" (id, name, email, password_hash, role, "BranchId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), 'Admin', 'admin@carwash.local', :hash, 'admin', :branchId, NOW(), NOW())`,
      { replacements: { hash, branchId } }
    );
    res.json({ok:true, message:'Admin created - login now with Admin@123', branchId});
  }catch(e){
    console.error(e);
    res.status(500).json({error:e.message, stack:e.stack});
  }
});

router.use('/auth', authRoutes);
module.exports = router;
