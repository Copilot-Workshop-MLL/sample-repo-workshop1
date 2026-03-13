const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    price:       { type: Number, required: true, min: 0 },
    category:    { type: String, trim: true, default: 'General' },
    stock:       { type: Number, default: 0, min: 0 },
    sku:         { type: String, trim: true, unique: true },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
