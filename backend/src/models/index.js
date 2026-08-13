const sequelize = require('../config/db');
const User = require('./User');
const Customer = require('./Customer');
const Vehicle = require('./Vehicle');
const Booking = require('./Booking');
const Service = require('./Service');
const Inventory = require('./Inventory');
const JobCard = require('./JobCard');
const Employee = require('./Employee');
const Invoice = require('./Invoice');
const Message = require('./Message');

const bcrypt = require('bcryptjs');
const { User } = require('../models');
User.hasMany(Customer, { foreignKey: 'createdBy' });
Customer.belongsTo(User, { foreignKey: 'createdBy' });

Customer.hasMany(Vehicle, { foreignKey: 'customerId' });
Vehicle.belongsTo(Customer, { foreignKey: 'customerId' });

Customer.hasMany(Booking, { foreignKey: 'customerId' });
Booking.belongsTo(Customer, { foreignKey: 'customerId' });

Vehicle.hasMany(Booking, { foreignKey: 'vehicleId' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

Booking.hasOne(JobCard, { foreignKey: 'bookingId' });
JobCard.belongsTo(Booking, { foreignKey: 'bookingId' });

Booking.hasOne(Invoice, { foreignKey: 'bookingId' });
Invoice.belongsTo(Booking, { foreignKey: 'bookingId' });

User.hasMany(JobCard, { foreignKey: 'assignedTo' });
JobCard.belongsTo(User, { foreignKey: 'assignedTo' });

module.exports = {
  sequelize,
  User,
  Customer,
  Vehicle,
  Booking,
  Service,
  Inventory,
  JobCard,
  Employee,
  Invoice,
  Message,
};
router.get('/seed', async (req, res) => {
  try {
    const hash = await bcrypt.hash('Admin@123', 10);
    await User.destroy({where:{email:'admin@carwash.local'}});
    const user = await User.create({name:'Admin', email:'admin@carwash.local', password:hash, role:'admin'});
    res.json({message:'Admin created', user: user.email});
  } catch(e){ res.status(500).json({error:e.message}); }
});