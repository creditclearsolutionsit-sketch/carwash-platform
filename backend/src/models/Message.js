const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
module.exports = sequelize.define('Message', { id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, content: DataTypes.TEXT });
