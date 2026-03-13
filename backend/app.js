const express = require('express');
const cors = require('cors');
const authMiddleware = require('./src/middleware/auth.middleware');
const { MODULES, ACTIONS } = require('./src/config/modules.config');

const authRoutes = require('./src/routes/auth.routes');
const roleRoutes = require('./src/routes/role.routes');
const userRoutes = require('./src/routes/user.routes');
const productRoutes = require('./src/routes/product.routes');
const orderRoutes = require('./src/routes/order.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Return static modules list — Angular uses this to build the permission matrix
app.get('/api/modules', authMiddleware, (req, res) => {
  res.json({ modules: MODULES, actions: ACTIONS });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
