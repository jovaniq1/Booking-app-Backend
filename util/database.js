const Sequelize = require('sequelize').Sequelize;
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(
  'workoutStats',
  'root',
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    port: 3306,
    dialectOptions: {
      ssl: {
        require: true,
        key: fs.readFileSync(__dirname + '/certs/client-key.pem'),
        cert: fs.readFileSync(__dirname + '/certs/client-cert.pem'),
        ca: fs.readFileSync(__dirname + '/certs/server-ca.pem'),
      },
    },
    pool: {
      max: 5,
      min: 0,
      idle: 1, // Keep this very low or it'll make all Lambda requests take longer
    },
  }
);

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
