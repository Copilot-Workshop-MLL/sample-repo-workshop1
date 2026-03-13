const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder } = require('../controllers/order.controller');

router.use(authMiddleware);

router.get('/',     checkPermission('orders', 'view'),   getOrders);
router.get('/:id',  checkPermission('orders', 'view'),   getOrder);
router.post('/',    checkPermission('orders', 'create'), createOrder);
router.put('/:id',  checkPermission('orders', 'edit'),   updateOrder);
router.delete('/:id', checkPermission('orders', 'delete'), deleteOrder);

module.exports = router;
