const db = require('../config/db');

// Helper: Generate URL-friendly slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

// ─── GET /api/products ────────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, all = '0', min_price, max_price, in_stock, sort } = req.query;
    const pageNum   = Math.max(1, parseInt(page));
    const limitNum  = Math.min(100, Math.max(1, parseInt(limit)));
    const offset    = (pageNum - 1) * limitNum;

    // Build dynamic WHERE clause
    // Admin dashboard might request "all=1" to view inactive products as well
    let where  = all === '1' ? 'WHERE 1=1' : 'WHERE p.is_active = 1';
    const args = [];

    if (category) {
      where += ' AND c.slug = ?';
      args.push(category);
    }
    if (search && search.trim()) {
      where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      args.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }
    if (min_price && !isNaN(parseFloat(min_price))) {
      where += ' AND p.price >= ?';
      args.push(parseFloat(min_price));
    }
    if (max_price && !isNaN(parseFloat(max_price))) {
      where += ' AND p.price <= ?';
      args.push(parseFloat(max_price));
    }
    if (in_stock === '1') {
      where += ' AND p.stock_qty > 0';
    }

    // Dynamic sorting
    let orderClause = 'ORDER BY p.created_at DESC'; // default is newest
    if (sort === 'price_asc') {
      orderClause = 'ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      orderClause = 'ORDER BY p.price DESC';
    } else if (sort === 'name_asc') {
      orderClause = 'ORDER BY p.name ASC';
    } else if (sort === 'name_desc') {
      orderClause = 'ORDER BY p.name DESC';
    }

    const baseSQL = `
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${where}`;

    // Total count query
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total ${baseSQL}`, args
    );

    // Data query
    const [products] = await db.query(
      `SELECT p.id, p.name, p.slug, p.price, p.stock_qty, p.image_url, p.is_active,
              c.name AS category_name, c.slug AS category_slug, p.category_id
       ${baseSQL}
       ${orderClause}
       LIMIT ? OFFSET ?`,
      [...args, limitNum, offset]
    );

    return res.json({
      error: false,
      data: {
        products,
        total,
        page      : pageNum,
        limit     : limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('[productController.getAllProducts]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── GET /api/products/:id ────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: true, message: 'Invalid product ID.' });
    }

    // Admins can view even inactive products by ID
    const [rows] = await db.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: true, code: 'NOT_FOUND', message: 'Product not found.' });
    }

    return res.json({ error: false, data: { product: rows[0] } });
  } catch (err) {
    console.error('[productController.getProductById]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── GET /api/products/categories ────────────────────────────
const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    return res.json({ error: false, data: { categories } });
  } catch (err) {
    console.error('[productController.getAllCategories]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── ADMIN: POST /api/products ──────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { category_id, name, description, price, stock_qty, image_url } = req.body;

    if (!name || price === undefined || stock_qty === undefined) {
      return res.status(400).json({
        error: true,
        message: 'Name, price, and stock quantity are required fields.'
      });
    }

    const slug = `${slugify(name)}-${Date.now().toString().slice(-4)}`;

    const [result] = await db.query(
      `INSERT INTO products (category_id, name, slug, description, price, stock_qty, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        category_id || null,
        name,
        slug,
        description || null,
        parseFloat(price),
        parseInt(stock_qty),
        image_url || null
      ]
    );

    return res.status(201).json({
      error: false,
      message: 'Product created successfully.',
      data: {
        id: result.insertId,
        name,
        slug,
        price,
        stock_qty
      }
    });
  } catch (err) {
    console.error('[productController.createProduct]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── ADMIN: PUT /api/products/:id ───────────────────────────
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, stock_qty, image_url, is_active } = req.body;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: true, message: 'Invalid product ID.' });
    }

    if (!name || price === undefined || stock_qty === undefined) {
      return res.status(400).json({
        error: true,
        message: 'Name, price, and stock quantity are required fields.'
      });
    }

    // Check if product exists
    const [existing] = await db.query('SELECT id, slug FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Product not found.' });
    }

    // Regenerate slug only if name changes
    let slug = existing[0].slug;
    if (name.toLowerCase() !== existing[0].slug.split('-').slice(0, -1).join(' ').toLowerCase()) {
      slug = `${slugify(name)}-${Date.now().toString().slice(-4)}`;
    }

    await db.query(
      `UPDATE products 
       SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, stock_qty = ?, image_url = ?, is_active = ?
       WHERE id = ?`,
      [
        category_id || null,
        name,
        slug,
        description || null,
        parseFloat(price),
        parseInt(stock_qty),
        image_url || null,
        is_active === undefined ? 1 : parseInt(is_active),
        id
      ]
    );

    return res.json({
      error: false,
      message: 'Product updated successfully.'
    });
  } catch (err) {
    console.error('[productController.updateProduct]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

// ─── ADMIN: DELETE /api/products/:id ────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: true, message: 'Invalid product ID.' });
    }

    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: true, message: 'Product not found.' });
    }

    // Attempt soft delete first (setting is_active = 0) to avoid foreign key violations.
    // If it has order relations, a hard delete will crash. Soft delete is robust.
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);

    return res.json({
      error: false,
      message: 'Product deactivated (soft-deleted) successfully.'
    });
  } catch (err) {
    console.error('[productController.deleteProduct]', err.message);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getAllCategories,
  createProduct,
  updateProduct,
  deleteProduct
};
