const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
module.exports = sequelize.define('Booking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  customerId: DataTypes.UUID,
  vehicleId: DataTypes.UUID,
  serviceType: DataTypes.STRING
});
