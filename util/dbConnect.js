const mongoose = require('mongoose');

const connectMongo = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    return mongoose
      .connect(process.env.DB_CONNECTION, {
        connectTimeoutMS: 100,
        useUnifiedTopology: true,
      })
      .then(() => console.log('Database connected!'));
  } catch (error) {
    console.log('problem', error);
  }
};

module.exports = connectMongo;
