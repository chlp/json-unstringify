/**
 * URL validation utilities for checking if a URL is allowed for scripting
 */

/**
 * Check if a URL is allowed for scripting
 * @param {string} url - The URL to check
 * @returns {boolean} - True if URL is allowed for scripting
 */
function isUrlAllowedForScripting(url) {
  try {
    const urlObj = new URL(url);
    
    // Block Chrome extension pages
    if (urlObj.protocol === 'chrome-extension:' || 
        urlObj.protocol === 'moz-extension:' ||
        urlObj.protocol === 'safari-extension:') {
      return false;
    }
    
    // Block Chrome Web Store and other extension galleries
    if (urlObj.hostname.includes('chrome.google.com') ||
        urlObj.hostname.includes('chromewebstore.google.com') ||
        urlObj.hostname.includes('addons.mozilla.org') ||
        urlObj.hostname.includes('microsoftedge.microsoft.com') ||
        urlObj.hostname.includes('apps.apple.com')) {
      return false;
    }
    
    // Block special Chrome pages
    if (urlObj.protocol === 'chrome:' ||
        urlObj.protocol === 'chrome-search:' ||
        urlObj.protocol === 'chrome-devtools:' ||
        urlObj.protocol === 'chrome-extension:') {
      return false;
    }
    
    // Allow all other URLs
    return true;
  } catch (e) {
    // If URL parsing fails, allow it (might be a data URL or similar)
    return true;
  }
}

// Export for use in other modules
export { isUrlAllowedForScripting };
