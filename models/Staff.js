const mongoose = require('mongoose');

const StaffSchema = mongoose.Schema({
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
  OfferServices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: [],
    },
  ],

  dateCreated: { type: Date, default: Date.now },
});

const Staff = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
module.exports = Staff;
//   services: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Service',
//       required: true,
//     },
//   ],
// bookings: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Booking',
//     },
//   ],
