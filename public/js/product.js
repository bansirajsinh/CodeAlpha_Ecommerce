'use strict';
/* product.js — Product detail page logic */

let product = null;
let qty     = 1;

document.addEventListener('DOMContentLoaded', async () => {
  initHeader();
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id || isNaN(parseInt(id))) {
    window.location.href = '/index.html';
    return;
  }
  await loadProduct(id);
});

async function loadProduct(id) {
  const container = document.getElementById('product-container');
  container.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:5rem 0">
      <div class="spin" style="font-size:2.5rem">⏳</div>
      <p style="margin-top:1rem;color:var(--text-muted)">Loading product…</p>
    </div>`;

  try {
    const res = await api.get(`/api/products/${id}`);
    if (res.error) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">😕</div>
          <h3 class="empty-state-title">${res.message}</h3>
          <a href="/index.html" class="btn btn-primary" style="margin-top:1.5rem">← Back to Shop</a>
        </div>`;
      return;
    }

    product = res.data.product;
    qty     = 1;
    renderProduct(product);
  } catch {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><p class="empty-state-title">Failed to load product.</p></div>';
  }
}

function renderProduct(p) {
  const inStock  = parseInt(p.stock_qty) > 0;
  const maxStock = parseInt(p.stock_qty);

  // Update page meta
  document.title = `${p.name} — Aethera`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = p.description ? p.description.slice(0, 155) : p.name;

  // Breadcrumb
  const bcCat = document.getElementById('bc-category');
  const bcProd = document.getElementById('bc-product');
  if (bcCat)  bcCat.textContent  = p.category_name || 'Products';
  if (bcProd) bcProd.textContent = p.name.length > 50 ? p.name.slice(0, 47) + '…' : p.name;

  const container = document.getElementById('product-container');
  container.innerHTML = `
    <!-- Image column -->
    <div class="fade-in">
      <img class="product-detail-img"
           id="prod-img"
           src="${p.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'}"
           alt="${escHtml(p.name)}"
           onload="this.classList.add('loaded')"
           onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'; this.classList.add('loaded')">
    </div>

    <!-- Details column -->
    <div class="fade-in" style="animation-delay:.08s">
      <span class="badge badge-primary" style="margin-bottom:1rem">${escHtml(p.category_name || 'Product')}</span>

      <h1 style="font-size:var(--f3xl);font-weight:800;line-height:1.2;margin-bottom:.25rem">${escHtml(p.name)}</h1>

      <div class="product-detail-price">$${parseFloat(p.price).toFixed(2)}</div>

      <div class="stock-status ${inStock ? 'in-stock' : 'out-stock'}" style="margin-bottom:1rem">
        ${inStock
          ? `✅ In Stock <span style="font-weight:400;color:var(--text-muted)">(${p.stock_qty} available)</span>`
          : '❌ Out of Stock'}
      </div>

      <p style="color:var(--text-muted);line-height:1.75;font-size:.9375rem">${escHtml(p.description || 'No description available.')}</p>

      ${inStock ? `
      <div class="qty-selector">
        <span class="qty-selector-label">Quantity:</span>
        <button class="qty-btn" id="qty-dec" onclick="changeQty(-1)" aria-label="Decrease quantity">−</button>
        <input class="qty-input" id="qty-val" type="number" value="1" min="1" max="${maxStock}" readonly aria-label="Quantity">
        <button class="qty-btn" id="qty-inc" onclick="changeQty(1)"  aria-label="Increase quantity">+</button>
        <span style="font-size:.8rem;color:var(--text-muted)">max ${maxStock}</span>
      </div>` : ''}

      <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.5rem">
        <button class="btn btn-primary btn-lg" id="atc-btn"
                onclick="addToCart()" style="flex:1;min-width:180px"
                ${!inStock ? 'disabled' : ''}>
          ${inStock ? '🛒 Add to Cart' : '❌ Out of Stock'}
        </button>
        <a href="/index.html" class="btn btn-secondary btn-lg">← Back</a>
      </div>
    </div>`;
}

function changeQty(delta) {
  if (!product) return;
  const max = parseInt(product.stock_qty);
  qty = Math.max(1, Math.min(max, qty + delta));
  const inp = document.getElementById('qty-val');
  if (inp) inp.value = qty;
  if (document.getElementById('qty-dec')) document.getElementById('qty-dec').disabled = qty <= 1;
  if (document.getElementById('qty-inc')) document.getElementById('qty-inc').disabled = qty >= max;
}

async function addToCart() {
  if (!auth.isLoggedIn()) {
    toast.info('Please login to add items to cart.');
    setTimeout(() => { window.location.href = '/login.html'; }, 1000);
    return;
  }
  const btn = document.getElementById('atc-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Adding…';

  try {
    const res = await api.post('/api/cart', { product_id: product.id, quantity: qty });
    if (res.error) {
      toast.error(res.message);
    } else {
      toast.success(`${qty} × ${product.name.slice(0, 30)} added to cart!`);
      updateCartBadge();
    }
  } catch {
    toast.error('Failed to add to cart.');
  } finally {
    btn.disabled    = false;
    btn.textContent = '🛒 Add to Cart';
  }
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
