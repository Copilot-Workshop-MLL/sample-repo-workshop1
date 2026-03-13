const Product = require('../models/Product');

// GET /api/products
const getProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// POST /api/products
const createProduct = async (req, res) => {
  const { name, description, price, category, stock, sku } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ message: 'Name and price are required' });
  }
  const product = await Product.create({ name, description, price, category, stock, sku });
  res.status(201).json(product);
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
