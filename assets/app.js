
/* Freshly Mart V5.8 - Payment & Receipt Automation */
const FM_CONFIG = {
  // STEP 1: deploy FreshlyMart_AppsScript.gs as Web App and paste URL below.
  // Example: https://script.google.com/macros/s/AKfycbxxxx/exec
  BACKEND_URL: 'https://script.google.com/macros/s/AKfycbwVABV1TZ9zq3KjqQtF6xkK1m6G4GGTch50Cx71D-PTZt7zRHPT9in_wKWMRVX3zw8uhg/exec',
  FRESHLY_URL: 'https://freshly-online.com',
  ADMIN_WHATSAPP: '918921696649',
  SUPPORT_WHATSAPP: '918921696649',
  UPI_ID: '',
  UPI_QR_IMAGE: '',
  DEFAULT_DELIVERY_CHARGE: 40,
  CURRENCY: '₹'
};


const FM_DEFAULT_BANNERS = [
  {BannerID:'BNR001', Title:'Freshly Mart', Subtitle:'Freshness, essentials and local deals — delivered through trusted Freshly Hubs.', ImageURL:'', Button1Text:'Shop Now', Button1Link:'category.html?cat=all', Button2Text:'Fresh Items', Button2Link:'fresh-items.html', BannerType:'Hero', DisplayOrder:1, Status:'Active', BackgroundColor:'#0b7a3b', BackgroundColor2:'#0f9960', TextColor:'#ffffff', Icon:'🛒'},
  {BannerID:'BNR002', Title:'Fresh Items by Freshly', Subtitle:'Fresh fish, meat, fruits, vegetables and food items are handled by Freshly for freshness and quality control.', ImageURL:'', Button1Text:'Order on Freshly', Button1Link:'fresh-items.html', Button2Text:'Know More', Button2Link:'fresh-items.html', BannerType:'Hero', DisplayOrder:2, Status:'Active', BackgroundColor:'#075985', BackgroundColor2:'#0ea5e9', TextColor:'#ffffff', Icon:'🐟'},
  {BannerID:'BNR003', Title:'Special Weekly Offers', Subtitle:'Promote grocery, daily essentials, home products and local store offers through backend-managed banners.', ImageURL:'', Button1Text:'View Deals', Button1Link:'category.html?cat=deals', Button2Text:'Grocery', Button2Link:'category.html?cat=grocery', BannerType:'Hero', DisplayOrder:3, Status:'Active', BackgroundColor:'#b45309', BackgroundColor2:'#f59e0b', TextColor:'#ffffff', Icon:'🏷️'},
  {BannerID:'BNR004', Title:'Sell on Freshly Mart', Subtitle:'Sellers can onboard, submit products, update stock and go live only after Freshly Mart approval.', ImageURL:'', Button1Text:'Sell With Us', Button1Link:'sell-with-us.html', Button2Text:'Seller Login', Button2Link:'seller-login.html', BannerType:'Hero', DisplayOrder:4, Status:'Active', BackgroundColor:'#1e3a8a', BackgroundColor2:'#2563eb', TextColor:'#ffffff', Icon:'🏪'},
  {BannerID:'BNR005', Title:'Join Freshly Hub Network', Subtitle:'Earn as a hub partner by supporting pickup, delivery, replacements and return handling in your area.', ImageURL:'', Button1Text:'Join Hub', Button1Link:'join-hub.html', Button2Text:'Refer & Earn', Button2Link:'refer.html', BannerType:'Hero', DisplayOrder:5, Status:'Active', BackgroundColor:'#14532d', BackgroundColor2:'#22c55e', TextColor:'#ffffff', Icon:'🚚'}
];

const FM_CATEGORIES = [
  {slug:'fresh-items', name:'Fresh Items', type:'redirect', icon:'🥬', line:'Fish, meat, fruits, vegetables and food by Freshly'},
  {slug:'grocery', name:'Grocery', type:'marketplace', icon:'🛒', line:'Rice, oil, spices, pulses and more'},
  {slug:'daily-essentials', name:'Daily Essentials', type:'marketplace', icon:'🧼', line:'Home and personal needs'},
  {slug:'home-products', name:'Home Products', type:'marketplace', icon:'🏠', line:'Kitchen, storage and household items'},
  {slug:'fashion', name:'Fashion', type:'marketplace', icon:'👗', line:'Local boutiques and apparel sellers'},
  {slug:'stationery', name:'Stationery', type:'marketplace', icon:'✏️', line:'School, office and art supplies'},
  {slug:'electronics-accessories', name:'Electronics Accessories', type:'marketplace', icon:'🔌', line:'Chargers, cables, covers and gadgets'},
  {slug:'wellness', name:'Wellness Products', type:'marketplace', icon:'🧘', line:'Yoga, lifestyle and wellness products'},
  {slug:'local-stores', name:'Local Stores', type:'stores', icon:'🏪', line:'Shop from approved local sellers'},
  {slug:'deals', name:'Deals', type:'marketplace', icon:'🏷️', line:'Freshly Mart and seller offers'}
];

const SAMPLE_PRODUCTS = [
  {ProductID:'P001', ProductName:'Coconut Oil 1L', Category:'grocery', Unit:'1 bottle', MRP:190, SellingPrice:165, Stock:25, StockStatus:'Live', DisplaySellerName:'Freshly Mart', Rating:4.5, Reviews:22, ImageURL:'', Description:'Approved grocery product sourced through Freshly Mart suppliers.'},
  {ProductID:'P002', ProductName:'Notebook Combo Pack', Category:'stationery', Unit:'5 books', MRP:250, SellingPrice:199, Stock:12, StockStatus:'Live', DisplaySellerName:'Calicut Stationery Partner', Rating:4.3, Reviews:9, ImageURL:'', Description:'School and office stationery from approved partner store.'},
  {ProductID:'P003', ProductName:'Cotton Towel Set', Category:'home-products', Unit:'2 pieces', MRP:399, SellingPrice:329, Stock:6, StockStatus:'Low Stock', DisplaySellerName:'Freshly Mart', Rating:4.2, Reviews:11, ImageURL:'', Description:'Home product delivered through Freshly Hub.'},
  {ProductID:'P004', ProductName:'USB-C Charging Cable', Category:'electronics-accessories', Unit:'1 piece', MRP:299, SellingPrice:199, Stock:0, StockStatus:'Out of Stock', DisplaySellerName:'Mobile Accessories Partner', Rating:4.0, Reviews:7, ImageURL:'', Description:'Accessory-only electronics listing. Warranty details should be shown.'},
  {ProductID:'P005', ProductName:'Yoga Mat', Category:'wellness', Unit:'1 piece', MRP:799, SellingPrice:649, Stock:8, StockStatus:'Live', DisplaySellerName:'Freshly Mart Wellness', Rating:4.6, Reviews:18, ImageURL:'', Description:'Wellness product without medical claims.'},
  {ProductID:'P006', ProductName:'Women Kurti', Category:'fashion', Unit:'1 piece', MRP:999, SellingPrice:749, Stock:4, StockStatus:'Live', DisplaySellerName:'Local Boutique Partner', Rating:4.1, Reviews:5, ImageURL:'', Description:'Fashion item by approved partner store. Return rules apply.'}
];

const SAMPLE_STORES = [
  {StoreName:'Calicut Stationery Partner', Category:'Stationery', Area:'Kozhikode', Pincode:'673008', DeliveryAvailable:'Yes', PickupAvailable:'Yes'},
  {StoreName:'Mobile Accessories Partner', Category:'Electronics Accessories', Area:'Kunnamangalam', Pincode:'673571', DeliveryAvailable:'Yes', PickupAvailable:'Yes'},
  {StoreName:'Local Boutique Partner', Category:'Fashion', Area:'Peringolam', Pincode:'673571', DeliveryAvailable:'Yes', PickupAvailable:'No'}
];


const SAMPLE_PINCODE_AREAS = [
  {Pincode:'673571', AreaName:'Kunnamangalam', City:'Kozhikode', HubID:'SAMPLE_HUB_001', HubName:'TEST Kunnamangalam Hub', PickupAvailable:'Yes', HomeDeliveryAvailable:'Yes', DeliveryCharge:40, MinimumOrder:300, CutOffTime:'03:00 PM', Slots:[{SlotName:'Evening Delivery', StartTime:'05:00 PM', EndTime:'08:00 PM', CutOffTime:'03:00 PM'}]},
  {Pincode:'673571', AreaName:'Peringolam', City:'Kozhikode', HubID:'SAMPLE_HUB_003', HubName:'TEST Peringolam Hub', PickupAvailable:'Yes', HomeDeliveryAvailable:'No', DeliveryCharge:0, MinimumOrder:250, CutOffTime:'04:00 PM', Slots:[{SlotName:'Hub Pickup', StartTime:'04:00 PM', EndTime:'07:00 PM', CutOffTime:'04:00 PM'}]},
  {Pincode:'673008', AreaName:'Medical College', City:'Kozhikode', HubID:'SAMPLE_HUB_002', HubName:'TEST Medical College Hub', PickupAvailable:'Yes', HomeDeliveryAvailable:'Yes', DeliveryCharge:50, MinimumOrder:300, CutOffTime:'02:30 PM', Slots:[{SlotName:'Same Day Evening', StartTime:'05:00 PM', EndTime:'08:00 PM', CutOffTime:'02:30 PM'}]}
];

const FORM_ACTIONS = {
  sellerForm: 'saveSeller',
  hubForm: 'saveHub',
  referForm: 'saveReferral',
  contactForm: 'saveContact',
  returnForm: 'saveReturn',
  reviewForm: 'saveReview',
  productSubmissionForm: 'saveProductSubmission',
  stockUpdateForm: 'updateStock',
  approveSellerForm: 'approveSeller',
  approveProductForm: 'approveProduct',
  rejectProductForm: 'rejectProduct',
  paymentProofForm: 'savePaymentProof',
  verifyPaymentForm: 'verifyPayment',
  generateReceiptForm: 'generateReceipt',
  generatePaymentAutomationForm: 'generatePaymentAutomation',
  markSettlementPaidForm: 'markSettlementPaid',
  addExpenseForm: 'addExpense'
};

const FM_ADMIN_ACTIONS = new Set(['approveSeller','approveProduct','rejectProduct','verifyPayment','generateReceipt','generatePaymentAutomation','markSettlementPaid','addExpense']);

function $(q, root=document){ return root.querySelector(q); }
function $all(q, root=document){ return [...root.querySelectorAll(q)]; }
function money(n){ return `${FM_CONFIG.CURRENCY}${Number(n||0).toLocaleString('en-IN')}`; }
const FM_PAYMENT_MODES = ['UPI Online','UPI on Delivery','UPI at Hub Pickup'];
function isPickupOption(v){ return String(v||'').toLowerCase().includes('pickup'); }
function updatePaymentOptionsForDelivery(form){
  const delivery = form?.querySelector('[name="DeliveryOption"]');
  const payment = form?.querySelector('[name="PaymentMode"]');
  if(!delivery || !payment) return;
  const pickup = isPickupOption(delivery.value);
  [...payment.options].forEach(opt=>{
    opt.disabled = pickup ? opt.value === 'UPI on Delivery' : opt.value === 'UPI at Hub Pickup';
  });
  if(payment.selectedOptions[0]?.disabled){ payment.value = pickup ? 'UPI at Hub Pickup' : 'UPI Online'; }
}

async function loadPaymentSettings(){
  try{
    const res = await apiGet('paymentSettings');
    if(res.ok && res.payment){
      FM_CONFIG.UPI_ID = res.payment.UPIID || FM_CONFIG.UPI_ID;
      FM_CONFIG.UPI_QR_IMAGE = res.payment.UPIQRCodeImageURL || FM_CONFIG.UPI_QR_IMAGE;
    }
  }catch(e){}
  renderUPIPaymentBox();
}

function makeUPILink(amount=0, note='Freshly Mart Order'){
  if(!FM_CONFIG.UPI_ID) return '';
  const params = new URLSearchParams({pa:FM_CONFIG.UPI_ID, pn:'Freshly Mart', tn:note, cu:'INR'});
  if(amount) params.set('am', String(Number(amount).toFixed(2)));
  return 'upi://pay?' + params.toString();
}

function renderUPIPaymentBox(amount=0){
  const box = $('#upiPaymentBox');
  if(!box) return;
  const upi = FM_CONFIG.UPI_ID || 'Set UPIID in Settings sheet';
  const qr = FM_CONFIG.UPI_QR_IMAGE ? `<img class="upi-qr" src="${FM_CONFIG.UPI_QR_IMAGE}" alt="Freshly Mart UPI QR">` : '<div class="upi-qr placeholder">QR</div>';
  const link = makeUPILink(amount, 'Freshly Mart Order');
  box.innerHTML = `<div class="payment-box-inner"><div>${qr}</div><div><h3>Pay only to Freshly Mart UPI</h3><p><strong>UPI ID:</strong> ${upi}</p><p>No cash payment. Hubs and delivery partners only verify payment made to Freshly Mart.</p>${link?`<a class="btn secondary" href="${link}">Open UPI App</a>`:''}<p class="fineprint">After payment, enter UPI reference / transaction ID before submitting or share it with Freshly Mart support for verification.</p></div></div>`;
}

function renderOrderSuccess(){
  const el = $('#lastOrderSummary');
  if(!el) return;
  let data = null;
  try{ data = JSON.parse(localStorage.getItem('fm_last_order') || 'null'); }catch(e){}
  if(!data){ el.innerHTML = '<div class="notice">Order submitted. Receipt will be available after Freshly Mart verifies payment.</div>'; return; }
  el.innerHTML = `<div class="dash-card"><h3>Order ${data.OrderID||''}</h3><p><strong>Grand Total:</strong> ${money(data.GrandTotal||0)}</p><p><strong>Payment:</strong> ${data.PaymentMode||''}</p><p><strong>Status:</strong> ${data.PaymentStatus||'Pending verification'}</p><p><strong>UPI Reference:</strong> ${data.UPIReference||'Pending'}</p><p>Payment receipt will be generated automatically after Freshly Mart verifies the UPI payment.</p></div>`;
}

function slugToTitle(slug){ return (slug||'all').split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' '); }
function cart(){ try{return JSON.parse(localStorage.getItem('fm_cart')||'[]')}catch(e){return []} }
function saveCart(items){ localStorage.setItem('fm_cart', JSON.stringify(items)); updateCartCount(); }
function updateCartCount(){ $all('[data-cart-count]').forEach(el=>el.textContent = cart().reduce((s,i)=>s+Number(i.qty||1),0)); }
function setStatus(formId, msg, ok=true){ const el = document.querySelector(`[data-form-status="${formId}"]`); if(el){ el.textContent=msg; el.className='form-status '+(ok?'success':'error'); } }
function isBackendReady(){ return FM_CONFIG.BACKEND_URL && FM_CONFIG.BACKEND_URL.startsWith('https://script.google.com/'); }

async function apiGet(action, params={}){
  if(!isBackendReady()) throw new Error('Backend URL is not configured. Paste your Apps Script Web App URL in assets/app.js.');
  const url = new URL(FM_CONFIG.BACKEND_URL);
  url.searchParams.set('action', action);
  Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));
  const res = await fetch(url.toString(), {method:'GET', redirect:'follow'});
  const text = await res.text();
  try{return JSON.parse(text)}catch(e){return {ok:false, raw:text}}
}

async function apiPost(action, payload={}){
  if(!isBackendReady()){
    const localKey = 'fm_demo_submissions';
    const rows = JSON.parse(localStorage.getItem(localKey)||'[]');
    rows.push({action, payload, DateTime:new Date().toISOString()});
    localStorage.setItem(localKey, JSON.stringify(rows));
    return {ok:true, demo:true, message:'Saved in browser demo mode. Paste Apps Script Web App URL in assets/app.js to save in Google Sheets.'};
  }
  const res = await fetch(FM_CONFIG.BACKEND_URL, {
    method:'POST',
    redirect:'follow',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body: JSON.stringify({action, ...payload})
  });
  const text = await res.text();
  try{return JSON.parse(text)}catch(e){return {ok:false, message:'Invalid backend response', raw:text};}
}

function formDataObj(form){
  const data = Object.fromEntries(new FormData(form).entries());
  Object.keys(data).forEach(k => { if(typeof data[k] === 'string') data[k] = data[k].trim(); });
  return data;
}

function wireForms(){
  Object.keys(FORM_ACTIONS).forEach(formId=>{
    const form = document.getElementById(formId);
    if(!form) return;
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const action = FORM_ACTIONS[formId];
      setStatus(formId, 'Submitting...', true);
      try{
        const payload = formDataObj(form);
        payload.SourcePage = location.pathname.split('/').pop() || 'index.html';
        if(FM_ADMIN_ACTIONS.has(action)){
          payload.AdminToken = localStorage.getItem('fm_admin_token') || '';
        }
        const result = await apiPost(action, payload);
        if(result.ok){
          setStatus(formId, result.message || 'Submitted successfully.', true);
          if(!['stockUpdateForm','approveSellerForm','approveProductForm','rejectProductForm'].includes(formId)) form.reset();
          if(formId.includes('approve') || formId.includes('reject')) loadAdminData();
        } else {
          setStatus(formId, result.message || 'Submission failed.', false);
        }
      }catch(err){ setStatus(formId, err.message, false); }
    });
  });
}

function wireLoginForms(){
  const sellerLogin = $('#sellerLoginForm');
  if(sellerLogin){
    sellerLogin.addEventListener('submit', e=>{
      e.preventDefault();
      const data = formDataObj(sellerLogin);
      localStorage.setItem('fm_seller_id', data.SellerID);
      localStorage.setItem('fm_seller_name', data.BusinessName || data.SellerID);
      location.href = 'seller-dashboard.html';
    });
  }
  const adminLogin = $('#adminLoginForm');
  if(adminLogin){
    adminLogin.addEventListener('submit', async e=>{
      e.preventDefault();
      if(!isBackendReady()){
        setStatus('adminLoginForm','Admin login requires Apps Script backend. Paste the Web App URL in assets/app.js first.',false);
        return;
      }
      setStatus('adminLoginForm','Checking admin access...',true);
      try{
        const data = formDataObj(adminLogin);
        const res = await apiPost('adminLogin', data);
        if(res.ok && res.AdminToken){
          localStorage.setItem('fm_admin_token', res.AdminToken);
          location.href='admin-dashboard.html';
        } else {
          setStatus('adminLoginForm', res.message || 'Incorrect admin code.', false);
        }
      }catch(err){ setStatus('adminLoginForm', err.message, false); }
    });
  }
  const sellerLogout = $('[data-seller-logout]');
  if(sellerLogout) sellerLogout.addEventListener('click',()=>{ localStorage.removeItem('fm_seller_id'); localStorage.removeItem('fm_seller_name'); location.href='seller-login.html'; });
  const adminLogout = $('[data-admin-logout]');
  if(adminLogout) adminLogout.addEventListener('click',()=>{ localStorage.removeItem('fm_admin_token'); location.href='admin-login.html'; });
}


async function getBanners(){
  try{
    const res = await apiGet('banners');
    if(res.ok && Array.isArray(res.banners) && res.banners.length) return res.banners;
  }catch(e){}
  return FM_DEFAULT_BANNERS;
}

function bannerSlide(b){
  const bg1 = b.BackgroundColor || '#0b7a3b';
  const bg2 = b.BackgroundColor2 || b.BackgroundColor || '#0f9960';
  const text = b.TextColor || '#ffffff';
  const img = b.ImageURL ? `<img src="${b.ImageURL}" alt="${b.Title}">` : `<div class="slide-emoji">${b.Icon || '🛒'}</div>`;
  const b1 = b.Button1Text && b.Button1Link ? `<a class="btn" href="${b.Button1Link}">${b.Button1Text}</a>` : '';
  const b2 = b.Button2Text && b.Button2Link ? `<a class="btn secondary" href="${b.Button2Link}">${b.Button2Text}</a>` : '';
  return `<article class="slide" style="--slide-bg:${bg1};--slide-bg2:${bg2};--slide-text:${text}"><div><span class="badge-light">${b.BannerType || 'Freshly Mart'}</span><h2>${b.Title || ''}</h2><p>${b.Subtitle || ''}</p><div class="slide-actions">${b1}${b2}</div></div><div class="slide-visual">${img}</div></article>`;
}

async function renderHeroSlider(){
  const track = $('#heroSliderTrack');
  const dots = $('#heroSliderDots');
  if(!track || !dots) return;
  let banners = await getBanners();
  banners = banners.filter(b => String(b.Status||'Active').toLowerCase() !== 'hidden')
                   .sort((a,b)=>Number(a.DisplayOrder||99)-Number(b.DisplayOrder||99));
  if(!banners.length) banners = FM_DEFAULT_BANNERS;
  track.innerHTML = banners.map(bannerSlide).join('');
  dots.innerHTML = banners.map((_,i)=>`<button type="button" data-slide-dot="${i}" aria-label="Go to banner ${i+1}"></button>`).join('');
  let current = 0;
  let timer;
  const go = (idx)=>{
    current = (idx + banners.length) % banners.length;
    track.style.transform = `translateX(-${current*100}%)`;
    dots.querySelectorAll('button').forEach((d,i)=>d.classList.toggle('active', i===current));
  };
  const next = ()=>go(current+1);
  const start = ()=>{ clearInterval(timer); timer=setInterval(next, 4500); };
  const prevBtn = $('[data-slider-prev]');
  const nextBtn = $('[data-slider-next]');
  if(prevBtn) prevBtn.onclick=()=>{go(current-1);start();};
  if(nextBtn) nextBtn.onclick=()=>{next();start();};
  dots.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{go(Number(btn.dataset.slideDot));start();});
  const shell = $('#heroSlider');
  if(shell){ shell.addEventListener('mouseenter',()=>clearInterval(timer)); shell.addEventListener('mouseleave',start); }
  go(0); if(banners.length>1) start();
}

function renderCategories(){
  const el = $('#homeCategories'); if(!el) return;
  el.innerHTML = FM_CATEGORIES.map(c=>`<a class="category-card" href="${c.type==='redirect'?'fresh-items.html':c.type==='stores'?'local-stores.html':'category.html?cat='+c.slug}"><span>${c.icon}</span><h3>${c.name}</h3><p>${c.line}</p></a>`).join('');
}

function productCard(p){
  const stock = String(p.StockStatus||'Live').toLowerCase();
  const out = stock.includes('out') || Number(p.Stock||0) <= 0;
  const img = p.ImageURL ? `<img src="${p.ImageURL}" alt="${p.ProductName}">` : '🛍️';
  return `<div class="product-card"><a href="product.html?id=${encodeURIComponent(p.ProductID)}" class="product-img">${img}</a><div class="product-body"><div class="product-title">${p.ProductName}</div><div><span class="price">${money(p.SellingPrice)}</span>${p.MRP?`<span class="mrp">${money(p.MRP)}</span>`:''}</div><div class="seller">Sold by: ${p.DisplaySellerName||'Freshly Mart'}</div><div class="rating">★ ${p.Rating||'New'} ${p.Reviews?`(${p.Reviews})`:''}</div><div class="stock"><span class="status-pill ${out?'out':''}">${out?'Out of Stock':p.StockStatus||'Live'}</span></div><button class="btn secondary" ${out?'disabled':''} onclick='FM.addToCart(${JSON.stringify(p).replaceAll("'", "&apos;")})'>${out?'Notify Me':'Add to Cart'}</button></div></div>`;
}

async function getProducts(){
  try{ const res = await apiGet('products'); if(res.ok && Array.isArray(res.products)) return res.products; }catch(e){}
  return SAMPLE_PRODUCTS;
}

async function renderFeatured(){
  const el = $('#featuredProducts'); if(!el) return;
  const products = await getProducts();
  el.innerHTML = products.slice(0,8).map(productCard).join('') || '<div class="empty">No products found.</div>';
}

async function renderCategoryPage(){
  const el = $('#categoryProducts'); if(!el) return;
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat') || 'all';
  $('#categoryTitle').textContent = cat === 'all' ? 'All Products' : slugToTitle(cat);
  const catFilter = $('#categoryFilter');
  if(catFilter){ catFilter.innerHTML = '<option value="all">All Categories</option>'+FM_CATEGORIES.filter(c=>c.type==='marketplace').map(c=>`<option value="${c.slug}">${c.name}</option>`).join(''); catFilter.value = cat; }
  const products = await getProducts();
  function apply(){
    const search = ($('#productSearch')?.value||'').toLowerCase();
    const selectedCat = $('#categoryFilter')?.value || cat;
    const stockFilter = $('#stockFilter')?.value || 'all';
    let list = products.filter(p=> selectedCat==='all' || p.Category===selectedCat || p.Category===slugToTitle(selectedCat));
    if(search) list = list.filter(p => String(p.ProductName).toLowerCase().includes(search));
    if(stockFilter==='live') list = list.filter(p => !String(p.StockStatus).toLowerCase().includes('out') && Number(p.Stock)>0);
    if(stockFilter==='low') list = list.filter(p => String(p.StockStatus).toLowerCase().includes('low'));
    if(stockFilter==='out') list = list.filter(p => String(p.StockStatus).toLowerCase().includes('out') || Number(p.Stock)<=0);
    el.innerHTML = list.map(productCard).join('') || '<div class="empty">No matching products found.</div>';
  }
  ['productSearch','categoryFilter','stockFilter'].forEach(id=>{ const node=$('#'+id); if(node) node.addEventListener('input',apply); if(node) node.addEventListener('change',apply); });
  apply();
}

async function renderProductPage(){
  const el = $('#productDetail'); if(!el) return;
  const id = new URLSearchParams(location.search).get('id');
  const products = await getProducts();
  const p = products.find(x=>x.ProductID===id) || products[0];
  if(!p){ el.innerHTML='<div class="empty">Product not found.</div>'; return; }
  const img = p.ImageURL ? `<img src="${p.ImageURL}" alt="${p.ProductName}">` : '🛍️';
  const out = String(p.StockStatus||'').toLowerCase().includes('out') || Number(p.Stock||0)<=0;
  el.innerHTML = `<div class="product-img">${img}</div><div><span class="badge">Approved Marketplace Product</span><h1>${p.ProductName}</h1><p class="lead">${p.Description||''}</p><p><span class="price">${money(p.SellingPrice)}</span>${p.MRP?`<span class="mrp">${money(p.MRP)}</span>`:''}</p><p><strong>Sold by:</strong> ${p.DisplaySellerName||'Freshly Mart'}</p><p><strong>Delivered by:</strong> Freshly Hub</p><p><strong>Stock:</strong> <span class="status-pill ${out?'out':''}">${out?'Out of Stock':p.StockStatus||'Live'}</span></p><button class="btn" ${out?'disabled':''} onclick='FM.addToCart(${JSON.stringify(p).replaceAll("'", "&apos;")})'>${out?'Currently Out of Stock':'Add to Cart'}</button><button class="btn secondary" onclick="location.href='returns.html'">Return Policy</button><div class="policy-box" style="margin-top:20px"><h3>Rate after purchase</h3><form id="reviewForm" class="form-grid"><input type="hidden" name="ProductID" value="${p.ProductID}"><input type="hidden" name="SellerID" value="${p.SellerID||''}"><div class="field"><label>Order ID</label><input name="OrderID" required></div><div class="field"><label>Name</label><input name="CustomerName" required></div><div class="field"><label>Product Rating</label><select name="ProductRating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div><div class="field"><label>Seller Rating</label><select name="SellerRating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div><div class="field"><label>Delivery Rating</label><select name="DeliveryRating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div><div class="field"><label>Phone</label><input name="Phone"></div><div class="field full"><label>Review</label><textarea name="ReviewText"></textarea></div><div class="field full"><button class="btn" type="submit">Submit Verified Review</button><div class="form-status" data-form-status="reviewForm"></div></div></form></div></div>`;
  $('#productReviews').innerHTML = `<div class="review"><strong>★ ${p.Rating || 'New'}</strong><p>Reviews are displayed after verified purchase and Freshly Mart moderation.</p></div>`;
  wireForms();
}

function addToCart(p){
  const items = cart();
  const existing = items.find(i=>i.ProductID===p.ProductID);
  if(existing) existing.qty += 1; else items.push({ProductID:p.ProductID, ProductName:p.ProductName, SellingPrice:p.SellingPrice, DisplaySellerName:p.DisplaySellerName, qty:1});
  saveCart(items);
  alert('Added to cart');
}

function renderCart(){
  const el = $('#cartList'); if(!el) return;
  const items = cart();
  if(!items.length){ el.innerHTML='<div class="empty">Your cart is empty.</div>'; $('#cartTotal').textContent='0'; return; }
  el.innerHTML = items.map((i,idx)=>`<div class="cart-item"><div><strong>${i.ProductName}</strong><br><small>Sold by ${i.DisplaySellerName||'Freshly Mart'}</small></div><div>Qty: <button onclick="FM.changeQty(${idx},-1)">−</button> ${i.qty} <button onclick="FM.changeQty(${idx},1)">+</button></div><div>${money(Number(i.SellingPrice)*Number(i.qty))} <button onclick="FM.removeCart(${idx})">Remove</button></div></div>`).join('');
  $('#cartTotal').textContent = items.reduce((s,i)=>s+Number(i.SellingPrice||0)*Number(i.qty||1),0).toLocaleString('en-IN');
}
function changeQty(idx, delta){ const items=cart(); if(!items[idx]) return; items[idx].qty=Math.max(1,Number(items[idx].qty||1)+delta); saveCart(items); renderCart(); renderCheckout(); }
function removeCart(idx){ const items=cart(); items.splice(idx,1); saveCart(items); renderCart(); renderCheckout(); }

function renderCheckout(){
  const el = $('#checkoutItems'); if(!el) return;
  const items = cart();
  el.innerHTML = items.length ? items.map(i=>`<div class="cart-item"><div><strong>${i.ProductName}</strong><br><small>${i.qty} × ${money(i.SellingPrice)}</small></div><div>${money(Number(i.SellingPrice)*Number(i.qty))}</div></div>`).join('') : '<div class="empty">Cart is empty. Add products before checkout.</div>';
  const subtotal = items.reduce((s,i)=>s+Number(i.SellingPrice||0)*Number(i.qty||1),0);
  renderUPIPaymentBox(subtotal);
}


function cleanPincode(pin){ return String(pin||'').replace(/\D/g,'').slice(0,6); }

function demoPincodeResponse(pin){
  const p = cleanPincode(pin);
  if(!/^\d{6}$/.test(p)) return {ok:false, serviceable:false, pincode:p, message:'Please enter a valid 6-digit pincode.', hubs:[]};
  const hubs = SAMPLE_PINCODE_AREAS.filter(h=>h.Pincode===p);
  return hubs.length ? {ok:true, serviceable:true, pincode:p, message:'Freshly Mart is available for this pincode.', hubs, defaultHub:hubs[0], demo:true} : {ok:true, serviceable:false, pincode:p, message:'Freshly Mart is not available for this pincode yet.', hubs:[], demo:true};
}

async function checkPincode(pin){
  const p = cleanPincode(pin);
  if(!/^\d{6}$/.test(p)) return {ok:false, serviceable:false, pincode:p, message:'Please enter a valid 6-digit pincode.', hubs:[]};
  if(isBackendReady()){
    try{
      const res = await apiGet('checkPincode', {pincode:p});
      if(res && (res.ok || res.serviceable !== undefined)) return res;
    }catch(e){ return {ok:false, serviceable:false, pincode:p, message:e.message, hubs:[]}; }
  }
  return demoPincodeResponse(p);
}

function savePincodeSelection(res, hub){
  if(!res || !res.serviceable || !hub) return;
  localStorage.setItem('fm_pincode', res.pincode || hub.Pincode || '');
  localStorage.setItem('fm_hub', JSON.stringify(hub));
}

function getSavedHub(){ try{return JSON.parse(localStorage.getItem('fm_hub')||'null')}catch(e){return null} }

function pincodeResultHtml(res){
  if(!res) return '';
  if(!res.ok && !res.serviceable) return `<div class="notice error">${res.message || 'Pincode check failed.'}</div>`;
  if(!res.serviceable) return `<div class="notice error"><strong>Not serviceable yet.</strong><br>${res.message || 'Freshly Mart is not available in this area yet.'}<br><a href="contact.html">Register your area / contact support</a></div>`;
  const hubs = res.hubs || [];
  const cards = hubs.map((h,idx)=>`<div class="hub-result ${idx===0?'selected':''}" data-hub-choice="${idx}"><strong>${h.HubName || 'Freshly Hub'}</strong><br><small>${h.AreaName || ''} ${h.City?'- '+h.City:''}</small><br><small>Pickup: ${h.PickupAvailable || 'Yes'} | Home Delivery: ${h.HomeDeliveryAvailable || 'No'} | Charge: ${money(h.DeliveryCharge||0)}</small>${h.CutOffTime?`<br><small>Cut-off: ${h.CutOffTime}</small>`:''}</div>`).join('');
  return `<div class="notice success"><strong>Available in ${res.pincode}.</strong><br>${res.message || 'Freshly Mart is available.'}<div class="hub-result-wrap">${cards}</div><a class="btn secondary small" href="category.html?cat=all">Start Shopping</a></div>`;
}

async function handlePincodeCheck(pin, targetEl){
  const res = await checkPincode(pin);
  if(targetEl) targetEl.innerHTML = pincodeResultHtml(res);
  if(res.serviceable && res.hubs && res.hubs.length){
    savePincodeSelection(res, res.hubs[0]);
    if(targetEl){
      targetEl.querySelectorAll('[data-hub-choice]').forEach(card=>card.addEventListener('click',()=>{
        targetEl.querySelectorAll('.hub-result').forEach(x=>x.classList.remove('selected'));
        card.classList.add('selected');
        savePincodeSelection(res, res.hubs[Number(card.dataset.hubChoice)]);
      }));
    }
  }
  return res;
}

function populateCheckoutHub(hub){
  const form = $('#checkoutForm'); if(!form || !hub) return;
  let hubId = form.querySelector('input[name="HubID"]');
  let hubName = form.querySelector('input[name="HubName"]');
  if(!hubId){ hubId=document.createElement('input'); hubId.type='hidden'; hubId.name='HubID'; form.appendChild(hubId); }
  if(!hubName){ hubName=document.createElement('input'); hubName.type='hidden'; hubName.name='HubName'; form.appendChild(hubName); }
  hubId.value = hub.HubID || '';
  hubName.value = hub.HubName || '';
  const slot = form.querySelector('select[name="DeliverySlot"]');
  const slots = hub.Slots || [];
  if(slot && slots.length){ slot.innerHTML = slots.map(s=>`<option value="${s.SlotName}">${s.SlotName}${s.StartTime?` (${s.StartTime} - ${s.EndTime||''})`:''}</option>`).join(''); }
  const area = form.querySelector('[name="Area"]'); if(area && !area.value) area.value = hub.AreaName || '';
}

function wireCheckout(){
  const form = $('#checkoutForm'); if(!form) return;
  const pincodeInput = form.querySelector('[name="Pincode"]');
  const deliveryOption = form.querySelector('[name="DeliveryOption"]');
  const paymentMode = form.querySelector('[name="PaymentMode"]');
  const statusBox = form.querySelector('[data-form-status="checkoutForm"]');

  async function refreshCheckoutPincode(){
    const pin = pincodeInput?.value || '';
    if(!pin) return null;
    if(statusBox) statusBox.textContent = 'Checking pincode and hub availability...';
    const res = await checkPincode(pin);
    if(res.serviceable && res.hubs && res.hubs.length){
      const saved = getSavedHub();
      const hub = saved && saved.Pincode===res.pincode ? saved : res.hubs[0];
      savePincodeSelection(res, hub);
      populateCheckoutHub(hub);
      if(statusBox){ statusBox.className='form-status success'; statusBox.textContent = `Serviceable by ${hub.HubName}. Delivery charge: ${money(hub.DeliveryCharge||0)}. ${hub.HomeDeliveryAvailable==='No'?'Home delivery not available; choose Pickup from Hub.':''}`; }
    }else if(statusBox){
      statusBox.className='form-status error'; statusBox.textContent = res.message || 'This pincode is not serviceable.';
    }
    return res;
  }

  if(pincodeInput) pincodeInput.addEventListener('change', refreshCheckoutPincode);
  if(deliveryOption) deliveryOption.addEventListener('change', ()=>{ const hub=getSavedHub(); if(hub) populateCheckoutHub(hub); updatePaymentOptionsForDelivery(form); });
  updatePaymentOptionsForDelivery(form);
  if(pincodeInput && pincodeInput.value) refreshCheckoutPincode();

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const items = cart();
    if(!items.length){ setStatus('checkoutForm','Cart is empty.',false); return; }
    const data = formDataObj(form);
    if(!FM_PAYMENT_MODES.includes(data.PaymentMode)){ setStatus('checkoutForm','Please select a valid Freshly Mart UPI payment option. Cash/COD is not allowed.',false); return; }
    if(isPickupOption(data.DeliveryOption) && data.PaymentMode === 'UPI on Delivery'){ setStatus('checkoutForm','For hub pickup, choose Pay Online by UPI or UPI at Hub Pickup.',false); return; }
    if(!isPickupOption(data.DeliveryOption) && data.PaymentMode === 'UPI at Hub Pickup'){ setStatus('checkoutForm','UPI at Hub Pickup is only for pickup orders. Choose Pay Online by UPI or UPI on Delivery.',false); return; }
    const pinResult = await checkPincode(data.Pincode);
    if(!pinResult.serviceable || !pinResult.hubs || !pinResult.hubs.length){ setStatus('checkoutForm', pinResult.message || 'This pincode is not serviceable.', false); return; }
    let selectedHub = getSavedHub();
    if(!selectedHub || selectedHub.Pincode !== pinResult.pincode) selectedHub = pinResult.hubs[0];
    const isPickup = String(data.DeliveryOption||'').toLowerCase().includes('pickup');
    if(!isPickup && String(selectedHub.HomeDeliveryAvailable||'').toLowerCase() !== 'yes'){
      setStatus('checkoutForm','Home delivery is not available for this hub. Please choose Pickup from Hub.',false); return;
    }
    const productTotal = items.reduce((s,i)=>s+Number(i.SellingPrice||0)*Number(i.qty||1),0);
    const deliveryCharge = isPickup ? 0 : Number(selectedHub.DeliveryCharge || 0);
    const payload = {...data, HubID:selectedHub.HubID||'', HubName:selectedHub.HubName||'', Area:data.Area || selectedHub.AreaName || '', Items: JSON.stringify(items), ProductTotal: productTotal, DeliveryCharge: deliveryCharge, GrandTotal: productTotal+deliveryCharge};
    setStatus('checkoutForm','Submitting order...',true);
    try{
      const res = await apiPost('saveOrder', payload);
      if(res.ok){
        setStatus('checkoutForm', res.message || 'Order submitted.', true);
        const orderId = res.OrderID || 'NEW';
        const lines = ['Freshly Mart Order', '', `Order ID: ${orderId}`, `Customer: ${data.CustomerName}`, `Phone: ${data.Phone}`, `Pincode: ${data.Pincode}`, `Hub: ${res.HubName || selectedHub.HubName || ''}`, `Address: ${data.Address}`, `Delivery: ${data.DeliveryOption}`, `Slot: ${res.DeliverySlot || data.DeliverySlot}`, '', 'Items:', ...items.map((i,n)=>`${n+1}. ${i.ProductName} x ${i.qty} - ${money(Number(i.SellingPrice)*Number(i.qty))}`), '', `Product Total: ${money(productTotal)}`, `Delivery Charge: ${money(Number(res.DeliveryCharge ?? deliveryCharge))}`, `Grand Total: ${money(Number(res.GrandTotal ?? productTotal+deliveryCharge))}`, `Payment: ${data.PaymentMode}`, `UPI Reference: ${data.UPIReference || 'Pending'}`, 'Payment Rule: No cash. Customer must pay only to Freshly Mart UPI / QR.', '', 'END OF ORDER'];
        const wa = `https://wa.me/${FM_CONFIG.ADMIN_WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
        localStorage.setItem('fm_last_order', JSON.stringify({OrderID:orderId, GrandTotal:Number(res.GrandTotal ?? productTotal+deliveryCharge), PaymentMode:data.PaymentMode, PaymentStatus:res.PaymentStatus || 'Pending verification', UPIReference:data.UPIReference || '', HubName:res.HubName || selectedHub.HubName || ''}));
        saveCart([]);
        window.open(wa, '_blank');
        setTimeout(()=>location.href='order-success.html?orderId='+encodeURIComponent(orderId), 700);
      } else setStatus('checkoutForm', res.message || 'Order failed.', false);
    }catch(err){ setStatus('checkoutForm', err.message, false); }
  });
}

function renderStores(){
  const el = $('#storeList'); if(!el) return;
  const render = async ()=>{
    const pin = cleanPincode($('#storePincode')?.value || localStorage.getItem('fm_pincode') || '');
    if($('#storePincode') && pin) $('#storePincode').value = pin;
    let list = [];
    if(isBackendReady()){
      try{ const res = await apiGet('localStores', {pincode:pin}); if(res.ok && Array.isArray(res.stores)) list = res.stores; }catch(e){}
    }
    if(!list.length) list = SAMPLE_STORES.filter(s=>!pin || String(s.Pincode).includes(pin));
    el.innerHTML = list.map(s=>`<div class="store-card"><h3>${s.StoreName}</h3><p>${s.Category} • ${s.Area} • ${s.Pincode}</p><p>Delivery: ${s.DeliveryAvailable || 'Yes'} | Pickup: ${s.PickupAvailable || 'Yes'}</p><a class="btn secondary" href="category.html?cat=${String(s.Category).toLowerCase().replaceAll(' ','-')}">View Products</a></div>`).join('') || '<div class="empty">No stores found for this pincode.</div>';
  };
  const btn = $('[data-store-filter]'); if(btn) btn.addEventListener('click',render); render();
}

function wireGeneral(){
  updateCartCount();
  $all('[data-freshly-link]').forEach(a=>a.href=FM_CONFIG.FRESHLY_URL);
  const support = $('#supportNumber'); if(support) support.textContent = '+'+FM_CONFIG.SUPPORT_WHATSAPP;
  const w = $('[data-whatsapp-support]'); if(w) w.href = `https://wa.me/${FM_CONFIG.SUPPORT_WHATSAPP}`;
  const searchBtn = $('[data-search-btn]'); if(searchBtn) searchBtn.addEventListener('click',()=>{ const q=$('#globalSearch')?.value||''; location.href='category.html?cat=all&q='+encodeURIComponent(q); });

  const savedPin = localStorage.getItem('fm_pincode') || '';
  if($('#homePincode') && savedPin) $('#homePincode').value = savedPin;
  if($('#checkoutForm input[name="Pincode"]') && savedPin) $('#checkoutForm input[name="Pincode"]').value = savedPin;

  const pinBtn = $('[data-check-pincode]');
  if(pinBtn) pinBtn.addEventListener('click', async ()=>{
    const pin=$('#homePincode')?.value||'';
    const resultEl = $('#pincodeResult');
    if(resultEl) resultEl.innerHTML = '<div class="notice soft">Checking Freshly Hub service areas...</div>';
    await handlePincodeCheck(pin, resultEl);
  });
  const locBtn = $('[data-location-btn]');
  if(locBtn) locBtn.addEventListener('click', async ()=>{
    const pin=prompt('Enter your pincode');
    if(pin){
      const res = await handlePincodeCheck(pin, null);
      alert(res.message || (res.serviceable ? 'Pincode saved.' : 'Not serviceable yet.'));
    }
  });

  $all('[data-seller-field]').forEach(el=>el.value = localStorage.getItem('fm_seller_id') || '');
  const sellerIdentity = $('#sellerIdentity'); if(sellerIdentity) sellerIdentity.textContent = localStorage.getItem('fm_seller_name') || localStorage.getItem('fm_seller_id') || 'Not logged in';
  if(location.pathname.endsWith('seller-dashboard.html') && !localStorage.getItem('fm_seller_id')){ /* allow viewing but show notice */ }
  if(location.pathname.endsWith('admin-dashboard.html') && !localStorage.getItem('fm_admin_token')){
    location.href = 'admin-login.html';
    return;
  }
}

function wireTabs(){
  $all('.tab').forEach(btn=>btn.addEventListener('click',()=>{
    $all('.tab').forEach(b=>b.classList.remove('active'));
    $all('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.tab);
    if(target) target.classList.add('active');
  }));
}

async function loadAdminData(){
  if(!$('#adminStats')) return;
  if(!isBackendReady()){
    $('#adminStats').innerHTML = `<div class="dash-card"><h3>Backend Required</h3><p>Admin dashboard is disabled until Apps Script Web App URL is pasted in assets/app.js.</p></div><div class="dash-card"><h3>Private Access</h3><p>Admin links are removed from the public website. Use admin-login.html privately.</p></div><div class="dash-card"><h3>Setup Required</h3><p>Run setupFreshlyMart() in Google Sheets Apps Script.</p></div>`;
    ['pendingSellerList','pendingProductList','returnList','reviewList'].forEach(id=>{ const el=$('#'+id); if(el) el.innerHTML='<div class="empty">Connect backend and login as admin to load live data.</div>'; });
    return;
  }
  const AdminToken = localStorage.getItem('fm_admin_token') || '';
  if(!AdminToken){ location.href='admin-login.html'; return; }
  try{
    const res = await apiGet('adminSummary', {AdminToken});
    if(!res.ok && String(res.message||'').toLowerCase().includes('admin')){ localStorage.removeItem('fm_admin_token'); location.href='admin-login.html'; return; }
    if(res.ok){
      $('#adminStats').innerHTML = `<div class="dash-card"><h3>Pending Sellers</h3><p>${res.counts.PendingSellers||0}</p></div><div class="dash-card"><h3>Pending Products</h3><p>${res.counts.PendingProducts||0}</p></div><div class="dash-card"><h3>Returns</h3><p>${res.counts.Returns||0}</p></div>`;
      renderAdminList('pendingSellerList', res.pendingSellers||[], 'SellerID', 'BusinessName', 'approveSeller');
      renderAdminList('pendingProductList', res.pendingProducts||[], 'SubmissionID', 'ProductName', 'approveProduct');
      renderAdminList('returnList', res.returns||[], 'ReturnID', 'ProductName', null);
      renderAdminList('reviewList', res.reviews||[], 'ReviewID', 'ReviewText', null);
    }
  }catch(e){ $('#adminStats').innerHTML = `<div class="notice error">${e.message}</div>`; }
}

function renderAdminList(id, rows, keyField, titleField, approveAction){
  const el = $('#'+id); if(!el) return;
  if(!rows.length){ el.innerHTML='<div class="empty">No records found.</div>'; return; }
  el.innerHTML = rows.map(r=>{
    const compliance = (r.GSTStatus || r.FSSAIStatus || r.ComplianceRelaxation || r.FSSAIRequired || r.GSTValidated) ? `<p><strong>GST:</strong> ${r.GSTStatus||r.GSTValidated||''} ${r.GSTNumber?'• '+r.GSTNumber:''}</p><p><strong>FSSAI:</strong> ${r.FSSAIStatus||r.FSSAIValidated||''} ${r.FSSAINumber?'• '+r.FSSAINumber:''}</p><p><strong>Relaxation:</strong> ${r.ComplianceRelaxation||'No'} ${r.RelaxationFor?('• '+r.RelaxationFor):''}</p>` : '';
    return `<div class="admin-row"><h3>${r[titleField]||r[keyField]}</h3><p><strong>${keyField}:</strong> ${r[keyField]||''}</p><p><strong>Status:</strong> ${r.Status||r.ApprovalStatus||r.ReturnStatus||'Pending'}</p>${compliance}${approveAction?`<button class="btn secondary" onclick="FM.quickAdmin('${approveAction}','${r[keyField]}')">Approve</button>`:''}</div>`;
  }).join('');
}

async function quickAdmin(action, id){
  const payload = action==='approveSeller'?{SellerID:id}:{SubmissionID:id};
  payload.AdminToken = localStorage.getItem('fm_admin_token') || '';
  const res = await apiPost(action, payload);
  if(!res.ok && String(res.message||'').toLowerCase().includes('admin')){ localStorage.removeItem('fm_admin_token'); location.href='admin-login.html'; return; }
  alert(res.message || (res.ok?'Done':'Failed'));
  loadAdminData();
}

window.FM = {addToCart, changeQty, removeCart, quickAdmin, checkPincode};
document.addEventListener('DOMContentLoaded', ()=>{
  wireGeneral(); wireForms(); wireLoginForms(); wireCheckout(); wireTabs();
  loadPaymentSettings();
  renderHeroSlider();
  renderCategories(); renderFeatured(); renderCategoryPage(); renderProductPage(); renderCart(); renderCheckout(); renderStores(); renderOrderSuccess(); loadAdminData();
});
