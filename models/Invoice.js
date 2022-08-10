const mongoose = require('mongoose');

const InvoiceSchema = mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    require: true,
  },
  total: {
    type: Number,
    default: 0,
  },
  dateCreated: { type: Date, default: Date.now },
});

const Invoice =
  mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

module.exports = Invoice;
