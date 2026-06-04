const db = require('../config/db');

// ─── POST /api/orders ─────────────────────────────────────────
const placeOrder = async (req, res) => {
  // Acquire a dedicated connection for the transaction
  const conn = await db.getConnection();
  try {
    const userId = req.user.id;
    const { shipping_name, shipping_addr, shipping_phone } = req.body;

    if (!shipping_name || !shipping_addr) {
      conn.release();
      return res.status(400).json({
        error: true, code: 'VALIDATION_ERROR',
        message: 'Shipping name and address are required.'
      });
    }

    // Fetch all cart items with current stock
    const [cartItems] = await conn.query(
      `SELECT ci.product_id, ci.quantity,
              p.price, p.stock_qty, p.name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      conn.release();
      return res.status(400).json({ error: true, code: 'EMPTY_CART', message: 'Your cart is empty.' });
    }

    // Validate stock for every line item BEFORE touching the DB
    for (const item of cartItems) {
      if (item.stock_qty < item.quantity) {
        conn.release();
        return res.status(400).json({
          error: true, code: 'INSUFFICIENT_STOCK',
          message: `"${item.name}" only has ${item.stock_qty} unit(s) in stock.`
        });
      }
    }

    // ── Begin atomic transaction ───────────────────────────────
    await conn.beginTransaction();

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );

    // 1. Create parent order record
    const [orderResult] = await conn.query(
      `INSERT INTO orders
         (user_id, status, total_amount, shipping_name, shipping_addr, shipping_phone)
       VALUES (?, 'pending', ?, ?, ?, ?)`,
      [userId, totalAmount.toFixed(2), shipping_name, shipping_addr, shipping_phone || null]
    );
    const orderId = orderResult.insertId;

    // 2. Insert order items + deduct stock for each product
    for (const item of cartItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
      await conn.query(
        'UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // 3. Clear user's cart
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    await conn.commit();
    conn.release();

    return res.status(201).json({
      error: false,
      message: 'Order placed successfully.',
      data: { order_id: orderId, total_amount: parseFloat(totalAmount.toFixed(2)) }
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('[orderController.placeOrder]', err.message);
    return res.status(500).json({
      error: true,
      message: 'Order failed. Transaction rolled back. Please try again.'
    });
  }
};

// ─── GET /api/orders ──────────────────────────────────────────
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await db.query(
      `SELECT o.id, o.status, o.total_amount, o.created_at,
              COUNT(oi.id) AS item_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    return res.json({ error: false, data: { orders } });
  } catch (err) {
    console.error('[orderController.getUserOrders]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const userId  = req.user.id;
    const orderId = parseInt(req.params.id);

    const [[order]] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).json({ error: true, code: 'NOT_FOUND', message: 'Order not found.' });
    }

    const [items] = await db.query(
      `SELECT oi.id, oi.quantity, oi.unit_price, oi.subtotal,
              p.name, p.image_url
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    return res.json({ error: false, data: { order, items } });
  } catch (err) {
    console.error('[orderController.getOrderById]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── ADMIN: GET /api/orders/all ──────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.status, o.total_amount, o.created_at, o.shipping_name, o.shipping_addr, o.shipping_phone,
              u.full_name AS user_name, u.email AS user_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );

    return res.json({ error: false, data: { orders } });
  } catch (err) {
    console.error('[orderController.getAllOrders]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── ADMIN: PUT /api/orders/:id/status ────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ error: true, message: 'Invalid order ID.' });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: true,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if order exists
    const [existing] = await db.query('SELECT id FROM orders WHERE id = ?', [orderId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Order not found.' });
    }

    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    return res.json({
      error: false,
      message: 'Order status updated successfully.',
      data: { order_id: orderId, status }
    });
  } catch (err) {
    console.error('[orderController.updateOrderStatus]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
