const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
module.exports = sequelize.define('Invoice', { id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, bookingId: DataTypes.UUID, amount: DataTypes.FLOAT });
