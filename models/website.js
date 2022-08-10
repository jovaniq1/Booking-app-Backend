const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const websiteSchema = new Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    unique: false,
    required: true,
  },
  domain: {
    type: String,
    unique: true,
    required: true,
  },
  staff: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  customers: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },

  schedule: {
    type: [String],
    default: [],
  },
  visits: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: [String],
    default: [],
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
  },
  lastVisit: { type: Date, default: Date.now },
  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Website', websiteSchema);
