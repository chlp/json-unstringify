/**
 * Background script for JSON Unstringify extension
 * Main entry point that coordinates all functionality
 */

// Import modules using ES6 imports
import { isUrlAllowedForScripting } from './url-validator.js';
import { 
  initializeContextMenu, 
  setupContextMenuListeners 
} from './context-menu.js';
import { setupKeyboardCommandListeners } from './keyboard-commands.js';

// Make functions available globally for the extension context
self.isUrlAllowedForScripting = isUrlAllowedForScripting;

/**
 * Initialize the extension
 * This runs on every service worker startup (including after browser restart)
 */
async function initializeExtension() {
  // Initialize context menu (handles duplicates)
  await initializeContextMenu();
  
  // Setup all event listeners (must be done on every startup)
  // Note: Adding listeners multiple times is safe - Chrome ignores duplicates
  setupContextMenuListeners();
  setupKeyboardCommandListeners();
}

// Initialize when service worker starts (this happens on every startup)
initializeExtension();

// Also initialize when extension is installed/updated
chrome.runtime.onInstalled.addListener(() => {
  initializeExtension();
});