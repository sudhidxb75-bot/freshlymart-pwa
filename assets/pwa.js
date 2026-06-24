(function(){
  const PUBLIC_BOTTOM_NAV = `
  <nav class="mobile-bottom-nav" aria-label="Freshly Mart app navigation">
    <a href="index.html" data-nav="home"><span>🏠</span><small>Home</small></a>
    <a href="category.html?cat=all" data-nav="categories"><span>🛒</span><small>Shop</small></a>
    <a href="fresh-items.html" data-nav="freshly"><span>🥬</span><small>Freshly</small></a>
    <a href="cart.html" data-nav="cart"><span>🧺</span><small>Cart</small><b class="bottom-cart-count" data-cart-count>0</b></a>
    <a href="seller-login.html" data-nav="account"><span>👤</span><small>Seller</small></a>
  </nav>`;

  const INSTALL_BANNER = `
  <div class="pwa-install-card" id="pwaInstallCard" hidden>
    <div><strong>Install Freshly Mart</strong><p>Add to home screen for an app-like shopping experience.</p></div>
    <button class="btn small" id="pwaInstallBtn" type="button">Install</button>
    <button class="pwa-close" id="pwaInstallClose" type="button" aria-label="Close">×</button>
  </div>`;

  let deferredPrompt = null;
  const page = location.pathname.split('/').pop() || 'index.html';
  const adminPages = ['admin-login.html','admin-dashboard.html'];

  function isStandalone(){ return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }

  function addMobileNav(){
    if (adminPages.includes(page)) return;
    if (document.querySelector('.mobile-bottom-nav')) return;
    document.body.insertAdjacentHTML('beforeend', PUBLIC_BOTTOM_NAV);
    const nav = document.querySelector('.mobile-bottom-nav');
    if(!nav) return;
    let active = 'home';
    if(page === 'cart.html' || page === 'checkout.html' || page === 'order-success.html') active = 'cart';
    else if(page === 'fresh-items.html') active = 'freshly';
    else if(page === 'category.html' || page === 'product.html' || page === 'local-stores.html') active = 'categories';
    else if(page === 'seller-login.html' || page === 'seller-dashboard.html' || page === 'sell-with-us.html' || page === 'join-hub.html' || page === 'refer.html') active = 'account';
    nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.dataset.nav === active));
  }

  function addInstallBanner(){
    if (adminPages.includes(page) || isStandalone()) return;
    if (document.querySelector('#pwaInstallCard')) return;
    document.body.insertAdjacentHTML('beforeend', INSTALL_BANNER);
    const card = document.getElementById('pwaInstallCard');
    const btn = document.getElementById('pwaInstallBtn');
    const close = document.getElementById('pwaInstallClose');
    close?.addEventListener('click', () => { card.hidden = true; localStorage.setItem('fm_pwa_install_dismissed', Date.now().toString()); });
    btn?.addEventListener('click', async () => {
      if(!deferredPrompt){ card.hidden = true; return; }
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      card.hidden = true;
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    addInstallBanner();
    const last = Number(localStorage.getItem('fm_pwa_install_dismissed') || 0);
    const days = (Date.now() - last) / (1000*60*60*24);
    if(days > 7){
      const card = document.getElementById('pwaInstallCard');
      if(card) card.hidden = false;
    }
  });

  window.addEventListener('appinstalled', () => {
    const card = document.getElementById('pwaInstallCard');
    if(card) card.hidden = true;
  });

  async function registerSW(){
    if('serviceWorker' in navigator){
      try { await navigator.serviceWorker.register('./service-worker.js'); }
      catch(e){ console.warn('Freshly Mart service worker registration failed:', e); }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    addMobileNav();
    addInstallBanner();
    registerSW();
    document.body.classList.add('pwa-ready');
  });
})();