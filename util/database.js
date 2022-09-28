const Sequelize = require('sequelize').Sequelize;

// const sequelize = new Sequelize('workoutStats', 'root', '123456', {
//   dialect: 'mysql',
//   host: '35.224.159.246',
// });

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
