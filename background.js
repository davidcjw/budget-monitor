// Budget Monitor - Background Service Worker
// Handles tab management and extension coordination

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'closeTab') {
    // Close the tab that sent the message
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});

// Track shopping attempts for fun stats
let shoppingAttempts = 0;
let moneySaved = 0;

// Listen for tab updates to track visits
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const shoppingSites = [
      'shopee.sg',
      'amazon.sg',
      'amazon.com',
      'ebay.com',
      'walmart.com',
      'target.com',
      'bestbuy.com',
      'etsy.com',
      'aliexpress.com',
      'wish.com',
      'newegg.com',
      'wayfair.com',
      'zappos.com',
      'nordstrom.com',
      'macys.com',
      'costco.com',
      'homedepot.com',
      'lowes.com',
      'shein.com',
      'asos.com',
      'zara.com',
    ];
    
    const isShoppingSite = shoppingSites.some(site => tab.url.includes(site));
    
    if (isShoppingSite) {
      shoppingAttempts++;
      // Estimate average cart value
      moneySaved += Math.floor(Math.random() * 100) + 20;
      
      // Store stats
      chrome.storage.local.set({
        shoppingAttempts,
        moneySaved,
        lastVisit: new Date().toISOString()
      });
      
      console.log(`💸 Budget Monitor: Shopping attempt #${shoppingAttempts} blocked! ~$${moneySaved} saved total`);
    }
  }
});

// Initialize stats from storage on startup
chrome.storage.local.get(['shoppingAttempts', 'moneySaved'], (result) => {
  if (result.shoppingAttempts) shoppingAttempts = result.shoppingAttempts;
  if (result.moneySaved) moneySaved = result.moneySaved;
});

