const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const Branch = sequelize.define('Branch', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  address: DataTypes.STRING,
  phone: DataTypes.STRING,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'manager', 'cashier', 'attendant'), defaultValue: 'attendant' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  email: DataTypes.STRING,
  loyalty_points: { type: DataTypes.INTEGER, defaultValue: 0 },
  notes: DataTypes.TEXT,
});

const Vehicle = sequelize.define('Vehicle', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  make: DataTypes.STRING,
  model: DataTypes.STRING,
  color: DataTypes.STRING,
  plate_number: { type: DataTypes.STRING, allowNull: false },
  vehicle_type: { type: DataTypes.ENUM('sedan', 'suv', 'bakkie', 'truck', 'motorcycle', 'other'), defaultValue: 'sedan' },
});

const ServiceCatalog = sequelize.define('ServiceCatalog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 30 },
  category: DataTypes.STRING,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  scheduled_at: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'), defaultValue: 'pending' },
  source: { type: DataTypes.ENUM('walk_in', 'phone', 'whatsapp', 'web', 'app'), defaultValue: 'walk_in' },
  notes: DataTypes.TEXT,
});

const JobCard = sequelize.define('JobCard', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  job_number: { type: DataTypes.STRING, unique: true },
  status: { type: DataTypes.ENUM('queued', 'in_progress', 'quality_check', 'completed', 'delivered'), defaultValue: 'queued' },
  started_at: DataTypes.DATE,
  completed_at: DataTypes.DATE,
  before_photo_url: DataTypes.STRING,
  after_photo_url: DataTypes.STRING,
});

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  full_name: { type: DataTypes.STRING, allowNull: false },
  position: DataTypes.STRING,
  phone: DataTypes.STRING,
  id_number: DataTypes.STRING,
  hire_date: DataTypes.DATEONLY,
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const InventoryItem = sequelize.define('InventoryItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  sku: DataTypes.STRING,
  unit: { type: DataTypes.STRING, defaultValue: 'unit' },
  quantity_on_hand: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  reorder_level: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  cost_per_unit: DataTypes.DECIMAL(10, 2),
});

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  method: { type: DataTypes.ENUM('cash', 'card', 'eft', 'wallet'), defaultValue: 'cash' },
  status: { type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'), defaultValue: 'paid' },
  reference: DataTypes.STRING,
});

// Associations
Branch.hasMany(User); User.belongsTo(Branch);
Branch.hasMany(Customer); Customer.belongsTo(Branch);
Branch.hasMany(Booking); Booking.belongsTo(Branch);
Branch.hasMany(Employee); Employee.belongsTo(Branch);
Branch.hasMany(InventoryItem); InventoryItem.belongsTo(Branch);
Branch.hasMany(ServiceCatalog); ServiceCatalog.belongsTo(Branch);

Customer.hasMany(Vehicle); Vehicle.belongsTo(Customer);
Customer.hasMany(Booking); Booking.belongsTo(Customer);

Vehicle.hasMany(Booking); Booking.belongsTo(Vehicle);

ServiceCatalog.belongsToMany(Booking, { through: 'BookingServices' });
Booking.belongsToMany(ServiceCatalog, { through: 'BookingServices' });

Booking.hasOne(JobCard); JobCard.belongsTo(Booking);
Employee.hasMany(JobCard); JobCard.belongsTo(Employee);

Booking.hasOne(Payment); Payment.belongsTo(Booking);
User.hasMany(Payment, { foreignKey: 'processed_by' });

module.exports = {
  sequelize, Branch, User, Customer, Vehicle, ServiceCatalog,
  Booking, JobCard, Employee, InventoryItem, Payment,
};
