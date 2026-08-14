router.get('/seed', async (req,res)=>{
  try{
    const bcrypt = require('bcryptjs');
    const { Branch, User } = require('../models');
    const sequelize = require('../config/db');

    const hash = await bcrypt.hash('Admin@123',10);
    console.log('HASH:', hash);

    const [branch] = await Branch.findOrCreate({
      where: { name: 'Main Branch' },
      defaults: { address: '123 Main Rd' }
    });

    await sequelize.query(`DELETE FROM "Users" WHERE email='admin@carwash.local'`);

    await User.create({
      name: 'Admin',
      email: 'admin@carwash.local',
      password_hash: hash,
      role: 'admin',
      BranchId: branch.id
    });

    res.json({ok:true, message:'Admin created with RAW SQL - login now', hash});
  }catch(e){
    console.error(e);
    res.status(500).json({error:e.message, stack:e.stack});
  }
});