/* ═══════════════════════════════════════════════════════
   admin.js — Interactive Admin Hub Controller script
   Handles catalog listing, adding/updating products,
   inline inventory edits, and order status updates.
   ═══════════════════════════════════════════════════════ */

'use strict';

let categories = [];
let productsList = [];

// ── Check Admin Permissions ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const user = auth.getUser();
  if (!auth.isLoggedIn() || !user || user.role !== 'admin') {
    toast.error('Access denied. Administrator privileges required.');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1500);
    return;
  }

  initHeader();
  initDashboard();
});

// ── Switch Tabs ──────────────────────────────────────────────
window.switchTab = function(tabId) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(sec => {
    sec.classList.remove('active');
  });
  
  // Deactivate all buttons
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Activate target section
  const targetSec = document.getElementById(tabId);
  if (targetSec) targetSec.classList.add('active');

  // Activate clicked button
  // Find which button has onclick pointing to this tabId
  const activeBtn = Array.from(document.querySelectorAll('.admin-tab-btn')).find(btn => 
    btn.getAttribute('onclick').includes(tabId)
  );
  if (activeBtn) activeBtn.classList.add('active');
};

// ── Dashboard Initializer ────────────────────────────────────
async function initDashboard() {
  await loadCategories();
  loadProducts();
  loadOrders();
}

// ── Fetch Categories ─────────────────────────────────────────
async function loadCategories() {
  try {
    const res = await api.get('/api/products/categories');
    if (!res.error) {
      categories = res.data.categories;
      
      // Populate select option dropdown in product modal form
      const select = document.getElementById('form-category');
      if (select) {
        // Keep first default disabled item
        select.innerHTML = '<option value="" disabled selected>Select category...</option>';
        categories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = cat.name;
          select.appendChild(opt);
        });
      }
    }
  } catch (err) {
    console.error('Failed to load categories', err);
    toast.error('Failed to load category taxonomy.');
  }
}

// ── Fetch and Render Products ────────────────────────────────
async function loadProducts() {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;

  try {
    // Request "all=1" so we get inactive/deleted items as well
    const res = await api.get('/api/products?limit=100&all=1');
    if (res.error) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-error)">${res.message}</td></tr>`;
      return;
    }

    productsList = res.data.products;
    document.getElementById('product-stats').textContent = `Showing all ${productsList.length} items catalogued in the system.`;

    if (productsList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">No products found in inventory.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    productsList.forEach(p => {
      const tr = document.createElement('tr');
      tr.id = `prod-row-${p.id}`;

      // Status Pill
      const statusPill = p.is_active
        ? '<span class="badge-status status-active">Active</span>'
        : '<span class="badge-status status-inactive">Inactive</span>';

      // Action button based on state
      const toggleActionBtn = p.is_active
        ? `<button onclick="toggleProductActive(${p.id}, 0)" class="btn btn-secondary btn-sm" style="background:rgba(239, 68, 68, 0.1);color:#ef4444;border-color:rgba(239, 68, 68, 0.2)">Deactivate</button>`
        : `<button onclick="toggleProductActive(${p.id}, 1)" class="btn btn-secondary btn-sm" style="background:rgba(16, 185, 129, 0.1);color:#10b981;border-color:rgba(16, 185, 129, 0.2)">Activate</button>`;

      tr.innerHTML = `
        <td><img src="${p.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'}" class="admin-product-thumb" alt="${p.name}"></td>
        <td>
          <div style="font-weight:600;color:var(--text-heading,#fff)">${p.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">ID: ${p.id} · Slug: ${p.slug}</div>
        </td>
        <td>${p.category_name || 'Uncategorized'}</td>
        <td>
          <input type="number" step="0.01" min="0.01" class="admin-inline-input" id="price-inline-${p.id}" value="${parseFloat(p.price).toFixed(2)}" aria-label="Inline Price">
        </td>
        <td>
          <input type="number" min="0" class="admin-inline-input" id="stock-inline-${p.id}" value="${p.stock_qty}" aria-label="Inline Stock">
        </td>
        <td>${statusPill}</td>
        <td>
          <div class="admin-actions">
            <button onclick="saveInlineEdits(${p.id})" class="btn btn-primary btn-sm" style="padding:0.25rem 0.5rem;font-size:0.75rem">Save</button>
            <button onclick="editProductDetail(${p.id})" class="btn btn-secondary btn-sm" style="padding:0.25rem 0.5rem;font-size:0.75rem">Edit</button>
            ${toggleActionBtn}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Failed to load products list', err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-error)">Failed to retrieve products catalog.</td></tr>';
  }
}

// ── Inline Save (Price & Stock) ──────────────────────────────
window.saveInlineEdits = async function(id) {
  const priceInput = document.getElementById(`price-inline-${id}`);
  const stockInput = document.getElementById(`stock-inline-${id}`);
  if (!priceInput || !stockInput) return;

  const newPrice = parseFloat(priceInput.value);
  const newStock = parseInt(stockInput.value);

  if (isNaN(newPrice) || newPrice <= 0) {
    toast.error('Price must be a positive number.');
    return;
  }
  if (isNaN(newStock) || newStock < 0) {
    toast.error('Stock quantity cannot be negative.');
    return;
  }

  const p = productsList.find(item => item.id === id);
  if (!p) return;

  try {
    const res = await api.put(`/api/products/${id}`, {
      category_id: p.category_id,
      name: p.name,
      description: p.description,
      price: newPrice,
      stock_qty: newStock,
      image_url: p.image_url,
      is_active: p.is_active
    });

    if (!res.error) {
      toast.success('Inventory saved successfully.');
      loadProducts(); // Reload to refresh internal list bindings
    } else {
      toast.error(res.message);
    }
  } catch (err) {
    console.error('Failed to update inline inventory', err);
    toast.error('Database connection error occurred.');
  }
};

// ── Soft Delete/Toggle Deactivation ──────────────────────────
window.toggleProductActive = async function(id, targetState) {
  try {
    const p = productsList.find(item => item.id === id);
    if (!p) return;

    let res;
    if (targetState === 0) {
      // Deactivate (Uses DELETE endpoint)
      res = await api.del(`/api/products/${id}`);
    } else {
      // Re-activate (Uses PUT update endpoint)
      res = await api.put(`/api/products/${id}`, {
        category_id: p.category_id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock_qty: p.stock_qty,
        image_url: p.image_url,
        is_active: 1
      });
    }

    if (!res.error) {
      toast.success(targetState === 0 ? 'Product deactivated successfully.' : 'Product activated successfully.');
      loadProducts();
    } else {
      toast.error(res.message);
    }
  } catch (err) {
    console.error('Failed to toggle product status', err);
    toast.error('Failed to process catalog status update.');
  }
};

// ── Modal Form Controls ──────────────────────────────────────
window.openProductModal = function() {
  document.getElementById('modal-title').textContent = 'Add New Product';
  document.getElementById('form-product-id').value = '';
  document.getElementById('product-form').reset();
  
  // Hide active checklist for new creation
  document.getElementById('form-active-row').style.display = 'none';
  document.getElementById('form-active').checked = true;
  document.getElementById('btn-save-submit').textContent = 'Save Product';

  document.getElementById('product-modal').classList.add('show');
};

window.closeProductModal = function() {
  document.getElementById('product-modal').classList.remove('show');
};

// ── Open Form in Edit Mode ───────────────────────────────────
window.editProductDetail = async function(id) {
  try {
    const res = await api.get(`/api/products/${id}`);
    if (res.error) {
      toast.error(res.message);
      return;
    }

    const p = res.data.product;

    document.getElementById('modal-title').textContent = `Edit Details: Product #${p.id}`;
    document.getElementById('form-product-id').value = p.id;
    document.getElementById('form-name').value = p.name;
    document.getElementById('form-category').value = p.category_id || '';
    document.getElementById('form-price').value = p.price;
    document.getElementById('form-stock').value = p.stock_qty;
    document.getElementById('form-image').value = p.image_url || '';
    document.getElementById('form-description').value = p.description || '';
    
    // Show active toggles for edits
    document.getElementById('form-active-row').style.display = 'flex';
    document.getElementById('form-active').checked = p.is_active === 1;
    document.getElementById('btn-save-submit').textContent = 'Update Product';

    document.getElementById('product-modal').classList.add('show');
  } catch (err) {
    console.error('Failed to load product details for form', err);
    toast.error('Failed to load product metadata drawer.');
  }
};

// ── Save Form Submit ─────────────────────────────────────────
window.saveProduct = async function(event) {
  event.preventDefault();

  const id = document.getElementById('form-product-id').value;
  const payload = {
    name: document.getElementById('form-name').value.trim(),
    category_id: parseInt(document.getElementById('form-category').value),
    price: parseFloat(document.getElementById('form-price').value),
    stock_qty: parseInt(document.getElementById('form-stock').value),
    image_url: document.getElementById('form-image').value.trim() || null,
    description: document.getElementById('form-description').value.trim() || null
  };

  if (!payload.name || isNaN(payload.price) || isNaN(payload.stock_qty)) {
    toast.error('Please fill in all mandatory fields correctly.');
    return;
  }

  try {
    let res;
    if (id) {
      // Edit mode
      payload.is_active = document.getElementById('form-active').checked ? 1 : 0;
      res = await api.put(`/api/products/${id}`, payload);
    } else {
      // Create mode
      res = await api.post('/api/products', payload);
    }

    if (!res.error) {
      toast.success(id ? 'Product details updated.' : 'New product catalogued.');
      closeProductModal();
      loadProducts();
    } else {
      toast.error(res.message);
    }
  } catch (err) {
    console.error('Failed to submit product form', err);
    toast.error('Communication error with server database.');
  }
};

// ── Fetch & Render Orders ────────────────────────────────────
async function loadOrders() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  try {
    const res = await api.get('/api/orders/all');
    if (res.error) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-error)">${res.message}</td></tr>`;
      return;
    }

    const orders = res.data.orders;
    
    // Stats calculation
    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
    document.getElementById('order-stats').textContent = `Total Transactions: ${orders.length} · Pending Fulfillment: ${pendingOrdersCount} orders`;

    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">No customer order rows found in the system.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    orders.forEach(o => {
      const tr = document.createElement('tr');
      const date = new Date(o.created_at).toLocaleString();

      // Format current status badge
      const statusBadge = `<span class="badge-status status-${o.status}" id="status-badge-${o.id}">${o.status}</span>`;

      // Build Status dropdown selector
      const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      let dropdownOptions = '';
      statuses.forEach(s => {
        const selected = o.status === s ? 'selected' : '';
        dropdownOptions += `<option value="${s}" ${selected}>${s}</option>`;
      });

      tr.innerHTML = `
        <td style="font-weight:600;color:var(--color-primary,#6366f1)">#${o.id}</td>
        <td>${date}</td>
        <td>
          <div style="font-weight:500;color:#fff">${o.shipping_name || o.user_name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${o.user_email}</div>
        </td>
        <td>
          <div style="font-size:0.85rem">${o.shipping_addr || 'No address'}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">Phone: ${o.shipping_phone || 'N/A'}</div>
        </td>
        <td style="font-weight:700;color:#fff">$${parseFloat(o.total_amount).toFixed(2)}</td>
        <td>${statusBadge}</td>
        <td>
          <select class="select-status" onchange="updateStatus(${o.id}, this.value)" aria-label="Change Status">
            ${dropdownOptions}
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Failed to fetch orders log', err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-error)">Failed to retrieve transaction databases.</td></tr>';
  }
}

// ── Update Order Status Dropdown Handler ──────────────────────
window.updateStatus = async function(orderId, newStatus) {
  try {
    const res = await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
    if (!res.error) {
      toast.success(`Order #${orderId} changed to ${newStatus}.`);
      
      // Instantly update badge state visually
      const badge = document.getElementById(`status-badge-${orderId}`);
      if (badge) {
        badge.textContent = newStatus;
        badge.className = `badge-status status-${newStatus}`;
      }
      
      // Reload stats numbers
      loadOrders();
    } else {
      toast.error(res.message);
    }
  } catch (err) {
    console.error('Failed to submit status update', err);
    toast.error('Network disconnect. Failed to save status.');
  }
};
