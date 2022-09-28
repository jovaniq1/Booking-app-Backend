const Sequelize = require('sequelize').Sequelize;

const sequelize = new Sequelize(
  'workoutStats',
  'root',
  process.env.MYSQL_PASSWORD,
  {
    dialect: 'mysql',
    host: process.env.MYSQL_HOST,
  }
);

module.exports = sequelize;
