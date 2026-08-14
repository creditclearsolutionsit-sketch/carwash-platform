const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.STRING, defaultValue: 'admin' },
  BranchId: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'Users',
  hooks: {
    beforeCreate: async (user) => {
      // hash password if it's plain text
      if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      // keep both columns in sync
      if (user.password && !user.password_hash) {
        user.password_hash = user.password;
      }
      if (user.password_hash && !user.password) {
        user.password = user.password_hash;
      }
      if (user.password && user.password_hash && user.password !== user.password_hash) {
        // if one is hashed and other not, sync to hashed version
        if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
          user.password_hash = user.password;
        } else {
          user.password = user.password_hash;
        }
      }
    }
  }
});

module.exports = User;
