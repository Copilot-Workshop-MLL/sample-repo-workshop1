const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity:    { type: Number, required: true, min: 1 },
  unitPrice:   { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber:  { type: String, required: true, unique: true },
    customer:     { type: String, required: true, trim: true },
    customerEmail:{ type: String, trim: true },
    items:        [orderItemSchema],
    total:        { type: Number, required: true, min: 0 },
    status:       {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    notes:        { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
