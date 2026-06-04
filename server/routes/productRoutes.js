const express = require('express');
const router  = express.Router();
const {
  getAllProducts,
  getProductById,
  getAllCategories,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// GET /api/products/categories  — MUST be before /:id to avoid "categories" being treated as an ID
router.get('/categories', getAllCategories);

// GET /api/products?category=&search=&page=&limit=
router.get('/', getAllProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

// ADMIN: Manage Products
router.post('/', authMiddleware, isAdmin, createProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router;
