const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  website: {
    type: Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  staff: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
  },

  status: {
    type: String,
    enum: {
      values: ['pending', 'approve', 'cancel'],
      message: '{VALUE} is not a valid',
    },
    default: 'pending',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
