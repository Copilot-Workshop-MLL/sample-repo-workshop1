const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');

router.use(authMiddleware);

router.get('/',     checkPermission('products', 'view'),   getProducts);
router.get('/:id',  checkPermission('products', 'view'),   getProduct);
router.post('/',    checkPermission('products', 'create'), createProduct);
router.put('/:id',  checkPermission('products', 'edit'),   updateProduct);
router.delete('/:id', checkPermission('products', 'delete'), deleteProduct);

module.exports = router;
