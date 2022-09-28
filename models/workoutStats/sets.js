const Sequelize = require('sequelize');
const sequelize = require('../../util/database');

const Sets = sequelize.define('sets', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  reps: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  weight: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Sets;
