const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaffSchema = new Schema({
  staffInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
  },
  offerServices: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Service',
    default: [],
  },
  schedule: {
    type: String,
    default: '',
  },
  currentAppointments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Appointment',
    default: [],
  },

  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Staff', StaffSchema);
/* 
    -
-   
    -
    -
    -
    -
    -
-
-   

*/
