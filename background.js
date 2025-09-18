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
 * Initialize the extension when installed
 */
chrome.runtime.onInstalled.addListener(() => {
  // Initialize context menu
  initializeContextMenu();
  
  // Setup all event listeners
  setupContextMenuListeners();
  setupKeyboardCommandListeners();
});