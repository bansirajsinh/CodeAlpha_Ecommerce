const express = require('express');
const router  = express.Router();
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const {
  placeOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');

// All order routes are protected by authMiddleware
router.use(authMiddleware);

// POST /api/orders - place a new order
router.post('/', placeOrder);

// GET /api/orders - get customer's order history
router.get('/', getUserOrders);

// ADMIN: GET /api/orders/all - get all orders in system (MUST be before /:id)
router.get('/all', isAdmin, getAllOrders);

// GET /api/orders/:id - get specific order details
router.get('/:id', getOrderById);

// ADMIN: PUT /api/orders/:id/status - update order status
router.put('/:id/status', isAdmin, updateOrderStatus);

module.exports = router;
