require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { Branch, User, ServiceCatalog, Customer, Vehicle } = require('../models');

async function seed() {
  await sequelize.sync({ force: false });

  const [branch] = await Branch.findOrCreate({
    where: { name: 'Main Branch' },
    defaults: { address: '123 Main Rd, Johannesburg', phone: '011 000 0000' },
  });

  const password_hash = await bcrypt.hash('Admin@123', 10);
  await User.findOrCreate({
    where: { email: 'admin@carwash.local' },
    defaults: { name: 'Admin', password_hash, role: 'admin', BranchId: branch.id },
  });

  const services = [
    { name: 'Basic Wash', price: 80, duration_minutes: 20, category: 'Exterior' },
    { name: 'Full Valet', price: 250, duration_minutes: 60, category: 'Full Service' },
    { name: 'Interior Detail', price: 180, duration_minutes: 45, category: 'Interior' },
    { name: 'Engine Wash', price: 100, duration_minutes: 25, category: 'Exterior' },
    { name: 'Wax & Polish', price: 220, duration_minutes: 50, category: 'Exterior' },
  ];
  for (const s of services) {
    await ServiceCatalog.findOrCreate({ where: { name: s.name }, defaults: { ...s, BranchId: branch.id } });
  }

  const [cust] = await Customer.findOrCreate({
    where: { phone: '0821234567' },
    defaults: { name: 'Sample Customer', email: 'customer@example.com', BranchId: branch.id },
  });
  await Vehicle.findOrCreate({
    where: { plate_number: 'CA123456' },
    defaults: { make: 'Toyota', model: 'Corolla', color: 'White', vehicle_type: 'sedan', CustomerId: cust.id },
  });

  console.log('Seed complete. Login with admin@carwash.local / Admin@123');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
