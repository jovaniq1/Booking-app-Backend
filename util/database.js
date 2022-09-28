const Sequelize = require('sequelize').Sequelize;

const sequelize = new Sequelize('workoutStats', 'root', '123456', {
  dialect: 'mysql',
  host: '35.224.159.246',
  port: 3306,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });
// const sequelize = new Sequelize(
//   'workoutStats',
//   'root',
//   process.env.MYSQL_PASSWORD,
//   {
//     dialect: 'mysql',
//     host: process.env.MYSQL_HOST,
//   }
// );

module.exports = sequelize;
