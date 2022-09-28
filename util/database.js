const Sequelize = require('sequelize').Sequelize;

const sequelize = new Sequelize('workoutStats', 'root', '123456', {
  host: '35.224.159.246',
  dialect: 'mysql',
  port: 3306,
  define: {
    charset: 'utf8mb4',
    // collate: 'utf8mb4_unicode_ci'
  },
  dialectOptions: {
    charset: 'utf8mb4',
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

console.log('---process.env', process.env);
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
