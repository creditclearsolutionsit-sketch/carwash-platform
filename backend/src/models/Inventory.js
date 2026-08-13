const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
module.exports = sequelize.define('Inventory', { id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, item: DataTypes.STRING, qty: DataTypes.INTEGER });
