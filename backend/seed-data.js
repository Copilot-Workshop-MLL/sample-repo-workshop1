/**
 * Seed products and orders sample data
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_db';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Product.deleteMany({});
  await Order.deleteMany({});

  const products = await Product.insertMany([
    { name: 'Wireless Mouse',       sku: 'SKU-001', price: 29.99,  category: 'Electronics', stock: 150, description: 'Ergonomic wireless mouse with USB receiver' },
    { name: 'Mechanical Keyboard',  sku: 'SKU-002', price: 89.99,  category: 'Electronics', stock: 75,  description: 'TKL mechanical keyboard with blue switches' },
    { name: 'USB-C Hub',            sku: 'SKU-003', price: 49.99,  category: 'Electronics', stock: 200, description: '7-in-1 USB-C hub with HDMI and card reader' },
    { name: 'Laptop Stand',         sku: 'SKU-004', price: 39.99,  category: 'Accessories', stock: 120, description: 'Adjustable aluminium laptop stand' },
    { name: 'Webcam HD 1080p',      sku: 'SKU-005', price: 69.99,  category: 'Electronics', stock: 60,  description: 'Full HD webcam with built-in microphone' },
    { name: 'Desk Lamp LED',        sku: 'SKU-006', price: 24.99,  category: 'Furniture',   stock: 90,  description: 'LED desk lamp with adjustable brightness' },
    { name: 'Noise-Cancelling Headphones', sku: 'SKU-007', price: 129.99, category: 'Electronics', stock: 40, description: 'Over-ear ANC headphones with 30hr battery' },
    { name: 'Monitor 27"',          sku: 'SKU-008', price: 299.99, category: 'Electronics', stock: 25,  description: '27-inch 4K IPS monitor, 60Hz' },
    { name: 'Office Chair',         sku: 'SKU-009', price: 199.99, category: 'Furniture',   stock: 30,  description: 'Ergonomic mesh office chair with lumbar support' },
    { name: 'Whitebaord Marker Set',sku: 'SKU-010', price: 9.99,   category: 'Stationery',  stock: 500, description: 'Pack of 12 assorted dry-erase markers' },
  ]);

  console.log(`Inserted ${products.length} products`);

  const orders = await Order.insertMany([
    {
      orderNumber: 'ORD-2026-001', customer: 'Alice Johnson', customerEmail: 'alice@example.com',
      status: 'delivered',
      items: [{ productName: 'Wireless Mouse', quantity: 2, unitPrice: 29.99 }, { productName: 'Laptop Stand', quantity: 1, unitPrice: 39.99 }],
      total: 99.97,
    },
    {
      orderNumber: 'ORD-2026-002', customer: 'Bob Smith', customerEmail: 'bob@example.com',
      status: 'processing',
      items: [{ productName: 'Mechanical Keyboard', quantity: 1, unitPrice: 89.99 }, { productName: 'USB-C Hub', quantity: 1, unitPrice: 49.99 }],
      total: 139.98,
    },
    {
      orderNumber: 'ORD-2026-003', customer: 'Carol White', customerEmail: 'carol@example.com',
      status: 'shipped',
      items: [{ productName: 'Monitor 27"', quantity: 1, unitPrice: 299.99 }],
      total: 299.99,
    },
    {
      orderNumber: 'ORD-2026-004', customer: 'David Lee', customerEmail: 'david@example.com',
      status: 'pending',
      items: [{ productName: 'Webcam HD 1080p', quantity: 1, unitPrice: 69.99 }, { productName: 'Desk Lamp LED', quantity: 2, unitPrice: 24.99 }],
      total: 119.97,
    },
    {
      orderNumber: 'ORD-2026-005', customer: 'Eve Martinez', customerEmail: 'eve@example.com',
      status: 'delivered',
      items: [{ productName: 'Noise-Cancelling Headphones', quantity: 1, unitPrice: 129.99 }, { productName: 'Office Chair', quantity: 1, unitPrice: 199.99 }],
      total: 329.98,
    },
    {
      orderNumber: 'ORD-2026-006', customer: 'Frank Brown', customerEmail: 'frank@example.com',
      status: 'cancelled',
      items: [{ productName: 'USB-C Hub', quantity: 3, unitPrice: 49.99 }],
      total: 149.97, notes: 'Customer requested cancellation',
    },
    {
      orderNumber: 'ORD-2026-007', customer: 'Grace Kim', customerEmail: 'grace@example.com',
      status: 'processing',
      items: [{ productName: 'Whitebaord Marker Set', quantity: 5, unitPrice: 9.99 }, { productName: 'Desk Lamp LED', quantity: 1, unitPrice: 24.99 }],
      total: 74.94,
    },
  ]);

  console.log(`Inserted ${orders.length} orders`);
  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
