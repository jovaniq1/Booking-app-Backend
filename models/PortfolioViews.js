const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const portfolioSchema = new Schema({
  visits: {
    type: Number,
    default: 0,
  },
  lastVisit: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
