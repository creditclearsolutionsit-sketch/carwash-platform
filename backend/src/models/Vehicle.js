const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
module.exports = sequelize.define('Vehicle', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  plate: DataTypes.STRING,
  model: DataTypes.STRING,
  customerId: DataTypes.UUID
});
