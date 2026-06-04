const db = require('../config/db');

// ─── GET /api/cart ────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await db.query(
      `SELECT ci.product_id,
              ci.quantity,
              p.name,
              p.price,
              p.image_url,
              p.stock_qty,
              ROUND(ci.quantity * p.price, 2) AS subtotal
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.added_at DESC`,
      [userId]
    );

    const total     = items.reduce((s, i) => s + parseFloat(i.subtotal), 0);
    const itemCount = items.length;

    return res.json({
      error: false,
      data : { items, total: parseFloat(total.toFixed(2)), itemCount }
    });
  } catch (err) {
    console.error('[cartController.getCart]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── POST /api/cart ───────────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const userId               = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: true, message: 'product_id is required.' });
    }
    const qty = Math.max(1, parseInt(quantity));

    // Verify product exists and has sufficient stock
    const [[product]] = await db.query(
      'SELECT id, stock_qty FROM products WHERE id = ? AND is_active = 1',
      [product_id]
    );
    if (!product) {
      return res.status(404).json({ error: true, message: 'Product not found.' });
    }
    if (product.stock_qty < qty) {
      return res.status(400).json({
        error: true, code: 'INSUFFICIENT_STOCK',
        message: `Only ${product.stock_qty} unit(s) available.`
      });
    }

    // Upsert: insert or increment quantity if the row already exists
    await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, product_id, qty]
    );

    return res.json({ error: false, message: 'Item added to cart.' });
  } catch (err) {
    console.error('[cartController.addToCart]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── PUT /api/cart/:productId ─────────────────────────────────
const updateCartItem = async (req, res) => {
  try {
    const userId    = req.user.id;
    const productId = parseInt(req.params.productId);
    const quantity  = parseInt(req.body.quantity);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: true, message: 'Quantity must be at least 1.' });
    }

    const [result] = await db.query(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: true, message: 'Cart item not found.' });
    }

    return res.json({ error: false, message: 'Cart updated.' });
  } catch (err) {
    console.error('[cartController.updateCartItem]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── DELETE /api/cart/:productId ──────────────────────────────
const removeFromCart = async (req, res) => {
  try {
    const userId    = req.user.id;
    const productId = parseInt(req.params.productId);

    await db.query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    return res.json({ error: false, message: 'Item removed from cart.' });
  } catch (err) {
    console.error('[cartController.removeFromCart]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
