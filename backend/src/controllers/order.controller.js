const Order = require('../models/Order');

// GET /api/orders
const getOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

// POST /api/orders
const createOrder = async (req, res) => {
  const { orderNumber, customer, customerEmail, items, total, status, notes } = req.body;
  if (!orderNumber || !customer || !items || total == null) {
    return res.status(400).json({ message: 'orderNumber, customer, items and total are required' });
  }
  const order = await Order.create({ orderNumber, customer, customerEmail, items, total, status, notes });
  res.status(201).json(order);
};

// PUT /api/orders/:id
const updateOrder = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'Order deleted' });
};

module.exports = { getOrders, getOrder, createOrder, updateOrder, deleteOrder };
