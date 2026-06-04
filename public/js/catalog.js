'use strict';
/* catalog.js — Product catalog / home page logic */

let state = {
  page: 1,
  category: '',
  search: '',
  totalPages: 1,
  sort: 'newest',
  minPrice: '',
  maxPrice: '',
  inStock: false
};
let searchTimer;

document.addEventListener('DOMContentLoaded', async () => {
  initHeader();
  await loadCategories();
  initFilters();
  await loadProducts();
  initSearch();
  initBackToTop();
});

// ── Load & render category tabs ──────────────────────────────
async function loadCategories() {
  try {
    const res = await api.get('/api/products/categories');
    if (res.error) return;
    const wrap = document.getElementById('category-tabs');
    res.data.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className    = 'category-tab';
      btn.dataset.slug = cat.slug;
      btn.textContent  = cat.name;
      btn.addEventListener('click', () => selectCategory(cat.slug, cat.name, btn));
      wrap.appendChild(btn);
    });
  } catch { /* silent */ }
}

function selectCategory(slug, name, clickedBtn) {
  state.category = slug;
  state.page     = 1;
  document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
  clickedBtn.classList.add('active');
  document.getElementById('section-title').textContent = slug ? name : 'All Products';
  loadProducts();
}

// ── Initialize sorting and price/stock filters ───────────────
function initFilters() {
  const sortSelect = document.getElementById('sort-select');
  const minPriceInput = document.getElementById('min-price-input');
  const maxPriceInput = document.getElementById('max-price-input');
  const stockToggle = document.getElementById('stock-toggle');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      state.page = 1;
      loadProducts();
    });
  }

  // Price inputs change with debounce
  let priceTimer;
  const onPriceChange = () => {
    clearTimeout(priceTimer);
    priceTimer = setTimeout(() => {
      state.minPrice = minPriceInput ? minPriceInput.value : '';
      state.maxPrice = maxPriceInput ? maxPriceInput.value : '';
      state.page = 1;
      loadProducts();
    }, 450);
  };

  if (minPriceInput) minPriceInput.addEventListener('input', onPriceChange);
  if (maxPriceInput) maxPriceInput.addEventListener('input', onPriceChange);

  if (stockToggle) {
    stockToggle.addEventListener('change', (e) => {
      state.inStock = e.target.checked;
      state.page = 1;
      loadProducts();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      state.sort = 'newest';
      state.minPrice = '';
      state.maxPrice = '';
      state.inStock = false;
      state.page = 1;

      if (sortSelect) sortSelect.value = 'newest';
      if (minPriceInput) minPriceInput.value = '';
      if (maxPriceInput) maxPriceInput.value = '';
      if (stockToggle) stockToggle.checked = false;

      loadProducts();
    });
  }
}

// ── Search ───────────────────────────────────────────────────
function initSearch() {
  const inp = document.getElementById('search-input');
  if (!inp) return;
  inp.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page   = 1;
      loadProducts();
    }, 380);
  });
}

// ── Load products from API ───────────────────────────────────
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  showSkeletons(grid, 8);

  try {
    let url = `/api/products?page=${state.page}&limit=12`;
    if (state.category) url += `&category=${encodeURIComponent(state.category)}`;
    if (state.search)   url += `&search=${encodeURIComponent(state.search)}`;
    if (state.sort)     url += `&sort=${encodeURIComponent(state.sort)}`;
    if (state.minPrice) url += `&min_price=${encodeURIComponent(state.minPrice)}`;
    if (state.maxPrice) url += `&max_price=${encodeURIComponent(state.maxPrice)}`;
    if (state.inStock)  url += `&in_stock=1`;

    const res = await api.get(url);
    if (res.error) { showError(grid, res.message); return; }

    const { products, total, totalPages } = res.data;
    state.totalPages = totalPages;

    const countEl = document.getElementById('section-count');
    if (countEl) countEl.textContent = `${total} product${total !== 1 ? 's' : ''} found`;

    if (!products.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No products found</h3>
          <p class="empty-state-subtitle">Try a different search term or category</p>
        </div>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    renderCards(products, grid);
    renderPagination(state.page, totalPages);
  } catch {
    showError(grid, 'Failed to load products. Check your connection.');
  }
}

// ── Render product cards ─────────────────────────────────────
function renderCards(products, grid) {
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();

  products.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'product-card fade-in';
    div.style.animationDelay = `${i * 0.045}s`;

    const imgSrc = p.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600';
    const outOfStock = parseInt(p.stock_qty) === 0;

    div.innerHTML = `
      <div class="product-card-img-wrapper"
           role="button" tabindex="0"
           onclick="location.href='/product.html?id=${p.id}'"
           onkeypress="if(event.key==='Enter')location.href='/product.html?id=${p.id}'">
        <img class="product-card-img"
             src="${imgSrc}" alt="${escHtml(p.name)}" loading="lazy"
             onload="this.classList.add('loaded')"
             onerror="this.src='https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'; this.classList.add('loaded')">
      </div>
      <div class="product-card-body"
           onclick="location.href='/product.html?id=${p.id}'"
           style="cursor:pointer">
        <div class="product-card-category">${escHtml(p.category_name || 'General')}</div>
        <div class="product-card-name">${escHtml(p.name)}</div>
        <div class="product-card-price">$${parseFloat(p.price).toFixed(2)}</div>
      </div>
      <div class="product-card-footer">
        <button class="btn btn-primary"
                id="atc-${p.id}"
                onclick="addToCart(${p.id}, this)"
                ${outOfStock ? 'disabled' : ''}>
          ${outOfStock ? '❌ Out of Stock' : '🛒 Add to Cart'}
        </button>
      </div>`;
    frag.appendChild(div);
  });

  grid.appendChild(frag);
}

// ── Add to cart ──────────────────────────────────────────────
async function addToCart(productId, btn) {
  if (!auth.isLoggedIn()) {
    toast.info('Please login to add items to cart.');
    setTimeout(() => { window.location.href = '/login.html'; }, 1000);
    return;
  }

  const orig = btn.textContent;
  btn.disabled    = true;
  btn.textContent = '⏳ Adding…';

  try {
    const res = await api.post('/api/cart', { product_id: productId, quantity: 1 });
    if (res.error) {
      toast.error(res.message);
    } else {
      toast.success('Added to cart!');
      updateCartBadge();
    }
  } catch {
    toast.error('Could not add to cart.');
  } finally {
    btn.disabled    = false;
    btn.textContent = orig;
  }
}

// ── Pagination ───────────────────────────────────────────────
function renderPagination(page, total) {
  const wrap = document.getElementById('pagination');
  if (!wrap) return;
  if (total <= 1) { wrap.innerHTML = ''; return; }

  const pages = [];
  pages.push(`<button class="page-btn" onclick="goPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>← Prev</button>`);

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= page - 2 && i <= page + 2)) {
      pages.push(`<button class="page-btn${i === page ? ' active' : ''}" onclick="goPage(${i})">${i}</button>`);
    } else if (i === page - 3 || i === page + 3) {
      pages.push(`<span style="color:var(--text-dim);align-self:center;padding:0 .25rem">…</span>`);
    }
  }

  pages.push(`<button class="page-btn" onclick="goPage(${page + 1})" ${page === total ? 'disabled' : ''}>Next →</button>`);
  wrap.innerHTML = pages.join('');
}

function goPage(n) {
  if (n < 1 || n > state.totalPages) return;
  state.page = n;
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Helpers ──────────────────────────────────────────────────
function showSkeletons(grid, count) {
  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-text w-75" style="margin-top:.875rem"></div>
      <div class="skeleton skeleton-text w-50"></div>
      <div class="skeleton skeleton-text w-35"></div>
      <div class="skeleton skeleton-btn"></div>
    </div>`).join('');
}

function showError(grid, msg) {
  grid.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">⚠️</div>
      <p class="empty-state-title">${msg}</p>
    </div>`;
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
}
