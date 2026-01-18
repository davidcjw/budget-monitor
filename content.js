// Budget Monitor - Shopping Shame Extension
// DOM Manipulation Magic ✨

// Disappointed Guy Fieri images (using placeholder service with fun text overlays)
const SHAME_IMAGES = [
  'https://i.imgflip.com/1wz3as.jpg', // Disappointed Guy Fieri
  'https://media.giphy.com/media/3o7TKxZzyBk4IlS7Is/giphy.gif', // Guy Fieri shaking head
  'https://media.giphy.com/media/l0HlPtbGpcnqa0fja/giphy.gif', // Disapproving look
];

// Fallback SVG when images can't load (creates a "disappointed" placeholder)
const FALLBACK_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect fill="#1a1a2e" width="200" height="200"/>
  <circle cx="100" cy="80" r="50" fill="#e94560"/>
  <circle cx="80" cy="70" r="8" fill="#1a1a2e"/>
  <circle cx="120" cy="70" r="8" fill="#1a1a2e"/>
  <path d="M 70 100 Q 100 85 130 100" stroke="#1a1a2e" stroke-width="4" fill="none"/>
  <text x="100" y="160" text-anchor="middle" fill="#e94560" font-family="Impact" font-size="16">YOU'RE BROKE</text>
  <text x="100" y="180" text-anchor="middle" fill="#fff" font-family="Arial" font-size="12">- Your Wallet</text>
</svg>
`)}`;

// Buy button variations to look for
const BUY_BUTTON_SELECTORS = [
  // Amazon
  '#buy-now-button',
  '#add-to-cart-button',
  'input[name="submit.buy-now"]',
  '[data-action="buy-now"]',
  '.a-button-buybox',
  '#buyNow',
  
  // Shopee
  '.btn-solid-primary',
  '.shopee-button-solid--primary',
  'button[class*="btn-solid-primary"]',
  '[class*="add-to-cart-btn"]',
  '.cart-drawer__checkout-btn',
  '[data-sqe="add-to-cart"]',
  '.product-briefing button[class*="btn"]',
  '.stardust-button--primary',
  
  // Generic patterns
  '[class*="buy-now"]',
  '[class*="buyNow"]',
  '[class*="add-to-cart"]',
  '[class*="addToCart"]',
  '[class*="add_to_cart"]',
  '[class*="checkout"]',
  '[class*="purchase"]',
  
  // Button text matching
  'button',
  'input[type="submit"]',
  'a[class*="btn"]',
  '[role="button"]',
];

// Product image selectors
const IMAGE_SELECTORS = [
  // Amazon
  '#landingImage',
  '#imgBlkFront',
  '.s-image',
  '[data-image-source-density]',
  '.a-dynamic-image',
  
  // Shopee - be aggressive with these
  'img[src*="down.img.susercontent.com"]',
  'img[src*="cf.shopee"]',
  'img[src*="f.shopee"]',
  'img[src*="shopeemobile"]',
  '[class*="ofs-image"] img',
  '[class*="_2-PfPE"] img',
  '[class*="image-carousel"] img',
  '[class*="product-image"] img',
  '[class*="item-card"] img',
  
  // Generic product images
  '[class*="product-image"]',
  '[class*="productImage"]',
  '[class*="product_image"]',
  '[class*="item-image"]',
  '[class*="itemImage"]',
  'img[class*="gallery"]',
  '.product img',
  '[data-testid*="product"] img',
  '[data-testid*="image"]',
  
  // Common patterns
  'img[src*="product"]',
  'img[src*="item"]',
  'img[alt*="product"]',
];

// Track what we've already modified
const modifiedElements = new WeakSet();

// Get a random shame image
function getRandomShameImage() {
  return SHAME_IMAGES[Math.floor(Math.random() * SHAME_IMAGES.length)];
}

// Check if this is a Shopee product image URL
function isShopeeProductImage(src) {
  if (!src) return false;
  return src.includes('down.img.susercontent.com') ||
         src.includes('cf.shopee') ||
         src.includes('f.shopee') ||
         src.includes('shopeemobile');
}

// Check if image should be replaced
function shouldReplaceImage(img) {
  // Skip if already modified
  if (modifiedElements.has(img)) return false;
  if (img.tagName !== 'IMG') return false;
  
  // For Shopee images, be more aggressive (ignore size check since they lazy load)
  if (isShopeeProductImage(img.src)) return true;
  
  // Check natural dimensions (actual image size) or rendered dimensions
  const width = img.naturalWidth || img.width || img.offsetWidth;
  const height = img.naturalHeight || img.height || img.offsetHeight;
  
  // Skip very tiny images (likely icons), but be lenient
  if (width > 0 && height > 0 && width < 40 && height < 40) return false;
  
  return true;
}

// Replace a single image
function replaceImage(img) {
  if (modifiedElements.has(img)) return;
  modifiedElements.add(img);
  
  // Store original for potential restoration
  img.dataset.originalSrc = img.src;
  img.dataset.originalSrcset = img.srcset || '';
  
  // Replace with shame image
  const shameImg = getRandomShameImage();
  img.src = shameImg;
  img.srcset = '';
  
  // Handle ALL lazy loading attributes (Shopee uses many)
  const lazyAttrs = ['data-src', 'data-lazy-src', 'data-original', 'data-srcset', 'data-lazy'];
  lazyAttrs.forEach(attr => {
    if (img.hasAttribute(attr)) {
      img.setAttribute(attr, shameImg);
    }
  });
  
  // Remove loading=lazy to prevent browser from reloading original
  img.removeAttribute('loading');
  
  // Add shame styling
  img.classList.add('budget-monitor-shamed');
  
  // Prevent the image from being replaced back
  img.style.setProperty('content', 'none', 'important');
  
  // Fallback if image fails to load
  img.onerror = function() {
    this.src = FALLBACK_SVG;
  };
  
  console.log('💸 Budget Monitor: Replaced product image with shame!');
}

// Replace product images with disappointed faces
function replaceProductImages() {
  // First, try specific selectors
  IMAGE_SELECTORS.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(img => {
        if (shouldReplaceImage(img)) {
          replaceImage(img);
        }
      });
    } catch (e) {
      // Selector might be invalid on some pages
    }
  });
  
  // For Shopee specifically, also scan ALL images and check their src
  if (window.location.hostname.includes('shopee')) {
    document.querySelectorAll('img').forEach(img => {
      if (isShopeeProductImage(img.src) && shouldReplaceImage(img)) {
        replaceImage(img);
      }
    });
  }
}

// Check if text indicates a buy button
function isBuyButtonText(text) {
  const buyPatterns = [
    /buy\s*now/i,
    /add\s*to\s*cart/i,
    /add\s*to\s*bag/i,
    /purchase/i,
    /checkout/i,
    /place\s*order/i,
    /complete\s*order/i,
    /proceed\s*to/i,
    /shop\s*now/i,
    /order\s*now/i,
    /get\s*it\s*now/i,
  ];
  
  return buyPatterns.some(pattern => pattern.test(text));
}

// Transform buy buttons into shame buttons
function transformBuyButtons() {
  BUY_BUTTON_SELECTORS.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(button => {
        if (modifiedElements.has(button)) return;
        
        const text = button.innerText || button.value || '';
        const ariaLabel = button.getAttribute('aria-label') || '';
        
        // Check if this is actually a buy button
        if (!isBuyButtonText(text) && !isBuyButtonText(ariaLabel)) return;
        
        modifiedElements.add(button);
        
        // Store original
        button.dataset.originalText = text;
        button.dataset.originalValue = button.value || '';
        
        // Transform the button
        if (button.tagName === 'INPUT') {
          button.value = "💸 YOU'RE BROKE 💸";
        } else {
          button.innerHTML = "💸 YOU'RE BROKE 💸";
        }
        
        // Add shame styling
        button.classList.add('budget-monitor-broke-button');
        
        // Override click to close tab
        button.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          // Show shame message
          showShameModal();
          
          return false;
        };
        
        // Remove other click handlers
        button.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          showShameModal();
        }, true);
        
        console.log('💸 Budget Monitor: Transformed buy button into shame button!');
      });
    } catch (e) {
      // Selector might be invalid
    }
  });
}

// Show a shame modal before closing
function showShameModal() {
  // Remove existing modal if any
  const existing = document.getElementById('budget-monitor-shame-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'budget-monitor-shame-modal';
  modal.innerHTML = `
    <div class="shame-overlay"></div>
    <div class="shame-content">
      <div class="shame-emoji">😤💸🔥</div>
      <h1>HOLD UP, BIG SPENDER!</h1>
      <p class="shame-subtitle">Your wallet is filing for a restraining order</p>
      <div class="shame-stats">
        <div class="stat">
          <span class="stat-number">$0.00</span>
          <span class="stat-label">Your Budget</span>
        </div>
        <div class="stat">
          <span class="stat-number">∞</span>
          <span class="stat-label">Things You "Need"</span>
        </div>
      </div>
      <p class="shame-message">
        Remember: That thing you "absolutely need" will still exist tomorrow.<br>
        Your savings account, however, might not.
      </p>
      <div class="shame-buttons">
        <button class="shame-btn shame-btn-close">
          😔 Fine, Close This Tab
        </button>
        <button class="shame-btn shame-btn-stay">
          🤡 I'll Just Look (lies)
        </button>
      </div>
      <p class="shame-footer">- Brought to you by your future self</p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Button handlers
  modal.querySelector('.shame-btn-close').onclick = () => {
    chrome.runtime.sendMessage({ action: 'closeTab' });
  };
  
  modal.querySelector('.shame-btn-stay').onclick = () => {
    modal.classList.add('shame-exit');
    setTimeout(() => modal.remove(), 300);
  };
  
  modal.querySelector('.shame-overlay').onclick = () => {
    modal.classList.add('shame-exit');
    setTimeout(() => modal.remove(), 300);
  };
  
  // Animate in
  requestAnimationFrame(() => {
    modal.classList.add('shame-visible');
  });
}

// Add site-wide shame banner
function addShameBanner() {
  if (document.getElementById('budget-monitor-banner')) return;
  
  const banner = document.createElement('div');
  banner.id = 'budget-monitor-banner';
  banner.innerHTML = `
    <span class="banner-icon">🚨</span>
    <span class="banner-text">
      <strong>BUDGET ALERT:</strong> Shopping site detected! Your wallet is watching... 👀
    </span>
    <span class="banner-icon">💸</span>
  `;
  
  document.body.prepend(banner);
}

// Initialize the extension
function init() {
  console.log('💸 Budget Monitor: Activated! Protecting your wallet...');
  
  // Add the shame banner
  addShameBanner();
  
  // Initial pass
  replaceProductImages();
  transformBuyButtons();
  
  // Watch for dynamic content (SPAs, infinite scroll, lazy loading)
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    
    mutations.forEach(mutation => {
      // Check for new nodes
      if (mutation.addedNodes.length > 0) {
        shouldProcess = true;
      }
      // Also check for src attribute changes (lazy loading)
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        const img = mutation.target;
        if (img.tagName === 'IMG' && !modifiedElements.has(img)) {
          if (isShopeeProductImage(img.src) || shouldReplaceImage(img)) {
            replaceImage(img);
          }
        }
      }
    });
    
    if (shouldProcess) {
      // Debounce to avoid hammering the DOM
      clearTimeout(window.budgetMonitorTimeout);
      window.budgetMonitorTimeout = setTimeout(() => {
        replaceProductImages();
        transformBuyButtons();
      }, 100);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'data-src']
  });
  
  // For Shopee: also run replacements after a delay since it loads slowly
  if (window.location.hostname.includes('shopee')) {
    setTimeout(replaceProductImages, 1000);
    setTimeout(replaceProductImages, 2000);
    setTimeout(replaceProductImages, 3000);
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

