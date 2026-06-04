'use strict';
/* orders.js — Order history page logic */

document.addEventListener('DOMContentLoaded', () => {
  if (!auth.isLoggedIn()) {
    window.location.href = '/login.html';
    return;
  }
  initHeader();
  loadOrders();
});

// ── Status badge config ──────────────────────────────────────
const STATUS = {
  pending   : { cls: 'badge-warning', label: '⏳ Pending' },
  processing: { cls: 'badge-info',    label: '🔄 Processing' },
  shipped   : { cls: 'badge-purple',  label: '🚚 Shipped' },
  delivered : { cls: 'badge-success', label: '✅ Delivered' },
  cancelled : { cls: 'badge-danger',  label: '❌ Cancelled' }
};

// ── Load orders list ─────────────────────────────────────────
async function loadOrders() {
  const container = document.getElementById('orders-container');
  container.innerHTML = `
    <div style="text-align:center;padding:4rem 0">
      <div class="spin" style="font-size:2.5rem">⏳</div>
      <p style="margin-top:1rem;color:var(--text-muted)">Loading orders…</p>
    </div>`;

  try {
    const res = await api.get('/api/orders');
    if (res.error) { toast.error(res.message); return; }

    const { orders } = res.data;

    if (!orders.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <h3 class="empty-state-title">No orders yet</h3>
          <p class="empty-state-subtitle">Your order history will appear here once you make a purchase</p>
          <a href="/index.html" class="btn btn-primary" style="margin-top:1.25rem">🛍 Start Shopping</a>
        </div>`;
      return;
    }

    container.innerHTML = `<div class="orders-list">${orders.map((o, i) => renderOrderCard(o, i)).join('')}</div>`;
  } catch {
    container.innerHTML = '<div class="empty-state"><p>Failed to load orders.</p></div>';
  }
}

function renderOrderCard(o, idx) {
  const s    = STATUS[o.status] || { cls: 'badge-muted', label: o.status };
  const date = new Date(o.created_at).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' });

  return `
    <div class="order-card fade-in" style="animation-delay:${idx * 0.055}s">
      <div class="order-card-header" onclick="toggleOrder(${o.id})" role="button" tabindex="0"
           onkeypress="if(event.key==='Enter')toggleOrder(${o.id})"
           aria-expanded="false" id="hdr-${o.id}">
        <span class="order-id">#${o.id}</span>
        <span style="font-size:.8375rem;color:var(--text-muted)">${date}</span>
        <span class="badge ${s.cls}">${s.label}</span>
        <span style="font-size:.8rem;color:var(--text-muted)">${o.item_count} item${o.item_count !== 1 ? 's' : ''}</span>
        <span style="font-weight:800;color:var(--primary-light)">$${parseFloat(o.total_amount).toFixed(2)}</span>
        <span id="arr-${o.id}" style="color:var(--text-muted);font-size:.75rem;margin-left:auto">▼</span>
      </div>
      <div class="order-card-body" id="body-${o.id}"></div>
    </div>`;
}

// ── Toggle order details (lazy load) ────────────────────────
const loadedOrders = new Set();

async function toggleOrder(orderId) {
  const body = document.getElementById(`body-${orderId}`);
  const arr  = document.getElementById(`arr-${orderId}`);
  const hdr  = document.getElementById(`hdr-${orderId}`);

  const isOpen = body.classList.contains('open');

  if (isOpen) {
    body.classList.remove('open');
    arr.textContent = '▼';
    hdr.setAttribute('aria-expanded', 'false');
    return;
  }

  body.classList.add('open');
  arr.textContent = '▲';
  hdr.setAttribute('aria-expanded', 'true');

  // Already fetched — just show
  if (loadedOrders.has(orderId)) return;

  body.innerHTML = `<div style="padding:1rem;color:var(--text-muted);font-size:.875rem">Loading items…</div>`;

  try {
    const res = await api.get(`/api/orders/${orderId}`);
    if (res.error) {
      body.innerHTML = `<div style="padding:1rem;color:var(--danger)">${res.message}</div>`;
      return;
    }

    const { items } = res.data;
    body.innerHTML = items.map(it => `
      <div class="order-item-row">
        <img class="order-item-img"
             src="${it.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'}"
             alt="${escHtml(it.name)}"
             onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'">
        <div style="flex:1">
          <div style="font-weight:600;font-size:.9rem">${escHtml(it.name)}</div>
          <div style="font-size:.8rem;color:var(--text-muted)">
            ${it.quantity} × $${parseFloat(it.unit_price).toFixed(2)}
          </div>
        </div>
        <div style="font-weight:800;color:var(--primary-light);white-space:nowrap">
          $${parseFloat(it.subtotal).toFixed(2)}
        </div>
      </div>`).join('');

    loadedOrders.add(orderId);
  } catch {
    body.innerHTML = '<div style="padding:1rem;color:var(--danger)">Failed to load items.</div>';
  }
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
