const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
module.exports = sequelize.define('JobCard', { id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, bookingId: DataTypes.UUID, assignedTo: DataTypes.UUID, status: DataTypes.STRING });
