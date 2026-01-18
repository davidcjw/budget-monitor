// Budget Monitor - Popup Script
// Display stats and handle UI interactions

document.addEventListener('DOMContentLoaded', () => {
  // Load stats from storage
  chrome.storage.local.get(['shoppingAttempts', 'moneySaved'], (result) => {
    const attempts = result.shoppingAttempts || 0;
    const saved = result.moneySaved || 0;
    
    // Animate the numbers
    animateValue('attempts', 0, attempts, 1000);
    animateValue('saved', 0, saved, 1000, '$');
  });
});

// Smooth number animation
function animateValue(elementId, start, end, duration, prefix = '') {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const range = end - start;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + range * easeOut);
    
    element.textContent = prefix + current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

