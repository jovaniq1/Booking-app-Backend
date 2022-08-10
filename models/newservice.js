const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
  },
  serviceName: {
    type: String,
    unique: false,
    require: true,
  },
  description: {
    type: String,
  },
  duration: {
    type: Number,
    default: 0,
  },
  cost: {
    type: Number,
    default: 0,
  },
  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Service', serviceSchema);
