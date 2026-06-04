const express        = require('express');
const router         = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} = require('../controllers/cartController');

// All cart routes are protected — must be logged in
router.use(authMiddleware);

// GET    /api/cart
router.get('/',              getCart);

// POST   /api/cart
router.post('/',             addToCart);

// PUT    /api/cart/:productId
router.put('/:productId',    updateCartItem);

// DELETE /api/cart/:productId
router.delete('/:productId', removeFromCart);

module.exports = router;
