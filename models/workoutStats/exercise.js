const Sequelize = require('sequelize');
const sequelize = require('../../util/database');

const Exercise = sequelize.define('exercise', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Exercise;
