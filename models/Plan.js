const mongoose = require('mongoose');

const PlanSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  plan: {
    type: Number,
    unique: false,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  cost: {
    type: Number,
    default: 0,
  },
  dateCreated: { type: Date, default: Date.now },
});

const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
module.exports = Plan;
