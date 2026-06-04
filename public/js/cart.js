'use strict';
/* cart.js — Shopping cart page logic */

document.addEventListener('DOMContentLoaded', () => {
  if (!auth.isLoggedIn()) {
    window.location.href = '/login.html';
    return;
  }
  initHeader();
  loadCart();
  initCheckoutModal();
});

// ── Load & render cart ───────────────────────────────────────
async function loadCart() {
  const wrap = document.getElementById('cart-content');
  wrap.innerHTML = `
    <div style="text-align:center;padding:4rem 0">
      <div class="spin" style="font-size:2.5rem">⏳</div>
      <p style="margin-top:1rem;color:var(--text-muted)">Loading your cart…</p>
    </div>`;

  try {
    const res = await api.get('/api/cart');
    if (res.error) { toast.error(res.message); return; }

    const { items, total, itemCount } = res.data;

    if (itemCount === 0) {
      wrap.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛒</div>
          <h3 class="empty-state-title">Your cart is empty</h3>
          <p class="empty-state-subtitle">You haven't added any products yet</p>
          <a href="/index.html" class="btn btn-primary" style="margin-top:1.25rem">🛍 Start Shopping</a>
        </div>`;
      document.getElementById('summary-section').innerHTML = '';
      return;
    }

    renderCart(items);
    renderSummary(total);
    updateCartBadge();
  } catch {
    document.getElementById('cart-content').innerHTML =
      '<div class="empty-state"><p>Failed to load cart.</p></div>';
  }
}

function renderCart(items) {
  const wrap = document.getElementById('cart-content');
  wrap.innerHTML = `<div class="cart-items-list">${items.map(item => `
    <div class="cart-item fade-in" id="ci-${item.product_id}">
      <img class="cart-item-img"
           src="${item.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'}"
           alt="${escHtml(item.name)}"
           onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'"
           onclick="location.href='/product.html?id=${item.product_id}'"
           style="cursor:pointer">
      <div class="cart-item-details">
        <div class="cart-item-name"
             onclick="location.href='/product.html?id=${item.product_id}'"
             style="cursor:pointer">${escHtml(item.name)}</div>
        <div class="cart-item-unit">$${parseFloat(item.price).toFixed(2)} each</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty(${item.product_id}, ${item.quantity - 1})">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQty(${item.product_id}, ${item.quantity + 1})">+</button>
          <button class="btn btn-danger btn-sm" style="margin-left:.5rem"
                  onclick="removeItem(${item.product_id})">🗑 Remove</button>
        </div>
      </div>
      <div class="cart-item-subtotal">$${parseFloat(item.subtotal).toFixed(2)}</div>
    </div>`).join('')}</div>`;
}

function renderSummary(total) {
  const tax = total * 0.08;
  document.getElementById('summary-section').innerHTML = `
    <div class="order-summary fade-in">
      <h3 class="order-summary-title">Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><span>$${parseFloat(total).toFixed(2)}</span></div>
      <div class="summary-row"><span>Shipping</span><span style="color:var(--success)">FREE</span></div>
      <div class="summary-row"><span>Tax (8% est.)</span><span>$${tax.toFixed(2)}</span></div>
      <div class="summary-row total">
        <span>Total</span>
        <span>$${(total + tax).toFixed(2)}</span>
      </div>
      <button class="btn btn-primary btn-full btn-lg" style="margin-top:1.5rem" onclick="openCheckout()">
        🔒 Proceed to Checkout
      </button>
      <a href="/index.html" class="btn btn-secondary btn-full" style="margin-top:.75rem;text-align:center">
        ← Continue Shopping
      </a>
    </div>`;
}

// ── Quantity update / remove ─────────────────────────────────
async function updateQty(productId, newQty) {
  if (newQty < 1) { removeItem(productId); return; }
  try {
    const res = await api.put(`/api/cart/${productId}`, { quantity: newQty });
    if (res.error) { toast.error(res.message); return; }
    loadCart();
  } catch { toast.error('Failed to update quantity.'); }
}

async function removeItem(productId) {
  try {
    const res = await api.del(`/api/cart/${productId}`);
    if (res.error) { toast.error(res.message); return; }
    toast.success('Item removed.');
    loadCart();
  } catch { toast.error('Failed to remove item.'); }
}

// ── Checkout modal ───────────────────────────────────────────
function initCheckoutModal() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn           = form.querySelector('[type="submit"]');
    const shipping_name = document.getElementById('ship-name').value.trim();
    const shipping_addr = document.getElementById('ship-addr').value.trim();
    const shipping_phone= document.getElementById('ship-phone').value.trim();

    if (!shipping_name || !shipping_addr) {
      toast.error('Shipping name and address are required.');
      return;
    }

    btn.disabled    = true;
    btn.textContent = '⏳ Placing Order…';

    try {
      const res = await api.post('/api/orders', { shipping_name, shipping_addr, shipping_phone });
      if (res.error) {
        toast.error(res.message);
      } else {
        closeCheckout();
        document.getElementById('cart-content').innerHTML = `
          <div class="empty-state fade-in">
            <div style="font-size:4rem">🎉</div>
            <h3 class="empty-state-title">Order Placed!</h3>
            <p class="empty-state-subtitle">Order ID: <strong style="color:var(--primary-light)">#${res.data.order_id}</strong></p>
            <p class="empty-state-subtitle">Total: <strong>$${res.data.total_amount.toFixed(2)}</strong></p>
            <a href="/orders.html" class="btn btn-primary" style="margin-top:1.5rem">View My Orders</a>
          </div>`;
        document.getElementById('summary-section').innerHTML = '';
        updateCartBadge();
        toast.success('Order placed successfully!');
      }
    } catch {
      toast.error('Order failed. Please try again.');
    } finally {
      btn.disabled    = false;
      btn.textContent = '✅ Place Order';
    }
  });
}

function openCheckout()  { document.getElementById('checkout-modal').classList.add('open'); }
function closeCheckout() { document.getElementById('checkout-modal').classList.remove('open'); }

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
