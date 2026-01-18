# 💸 Budget Monitor - Shopping Shame Extension

A hilarious Chrome extension that protects your wallet by shaming you when you visit shopping sites!

## What It Does

1. **Replaces Product Images** - All those tempting product photos get swapped with disappointed faces
2. **Transforms Buy Buttons** - "Buy Now" becomes "You're Broke" 
3. **Shame Modal** - Clicking buy shows a guilt-tripping popup before closing the tab
4. **Tracks Your Weakness** - See how many shopping attempts you've made

## Supported Sites

- Amazon
- Shopee
- eBay
- Walmart
- Target
- Best Buy
- Etsy
- AliExpress
- Newegg
- Wayfair
- And many more!

## Installation

### Quick Install (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `budget-monitor` folder
5. The extension is now active! Visit Amazon to test it.

### Optional: Add Custom Icons

1. Open `generate-icons.html` in your browser
2. Download the generated icons
3. Move them to the `icons/` folder
4. Update `manifest.json` to include:

```json
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
},
"action": {
  "default_popup": "popup.html",
  "default_icon": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

5. Reload the extension

## Code Structure & Learning Points

### 📁 File Overview

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration - defines permissions, content scripts, and metadata |
| `content.js` | **DOM Manipulation** - The main script that modifies webpage content |
| `styles.css` | Styling for injected elements (banners, buttons, modals) |
| `background.js` | Service worker - handles tab management and storage |
| `popup.html/css/js` | The extension popup UI |

### 🎓 Key Coding Concepts

#### 1. DOM Manipulation (content.js)

```javascript
// Selecting elements
document.querySelectorAll('img.product-image')

// Modifying attributes
img.src = 'new-image-url.jpg'
img.classList.add('shamed')

// Creating new elements
const banner = document.createElement('div')
banner.innerHTML = '<h1>Warning!</h1>'
document.body.prepend(banner)
```

#### 2. MutationObserver - Watching for Changes

```javascript
// Watch for dynamically loaded content (infinite scroll, SPAs)
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length > 0) {
      // New content added - process it!
      processNewContent()
    }
  })
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})
```

#### 3. Chrome Extension APIs

```javascript
// Send message to background script
chrome.runtime.sendMessage({ action: 'closeTab' })

// Store data persistently
chrome.storage.local.set({ shoppingAttempts: 5 })

// Get stored data
chrome.storage.local.get(['shoppingAttempts'], (result) => {
  console.log(result.shoppingAttempts)
})
```

#### 4. Content Script Injection (manifest.json)

```json
"content_scripts": [{
  "matches": ["*://*.amazon.com/*"],
  "js": ["content.js"],
  "css": ["styles.css"],
  "run_at": "document_idle"
}]
```

### 🔧 Extension Permissions Explained

- `activeTab` - Access the current tab when user interacts
- `scripting` - Inject scripts into web pages  
- `tabs` - Manage browser tabs (close, create, etc.)
- `host_permissions` - Allow content scripts on specific domains

## Customization Ideas

### Add More Shopping Sites

Edit `manifest.json` and add to both `host_permissions` and `content_scripts.matches`:

```json
"*://*.newsite.com/*"
```

### Use Custom Shame Images

In `content.js`, modify the `SHAME_IMAGES` array:

```javascript
const SHAME_IMAGES = [
  'https://your-image-url.com/disappointed-mom.jpg',
  'https://your-image-url.com/sad-wallet.png',
]
```

### Change the Shame Messages

Edit the `showShameModal()` function in `content.js` to customize the text.

## Troubleshooting

**Images not being replaced?**
- Some sites lazy-load images. The extension uses MutationObserver but timing can vary.
- Check the browser console for errors (`F12` → Console tab)

**Extension not loading?**
- Make sure Developer Mode is enabled in `chrome://extensions/`
- Check for errors in the extension card
- Try reloading the extension

**Buttons not transforming?**
- Sites use different button selectors. You may need to add site-specific selectors to `BUY_BUTTON_SELECTORS` in `content.js`

## License

MIT - Feel free to modify and share!

---

*Made with 💔 for your wallet*

