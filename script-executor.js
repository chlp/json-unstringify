/**
 * Common script execution utilities
 */

import { isUrlAllowedForScripting } from './url-validator.js';

/**
 * Execute the decodeBlocks function with the specified mode on a tab
 * @param {number} tabId - The tab ID to execute the script on
 * @param {string} mode - The mode: 'selected' or 'same-class'
 * @returns {Promise} - Promise that resolves when the script is executed
 */
function executeDecodeBlocks(tabId, mode) {
  return chrome.scripting.executeScript({
    target: { tabId },
    files: ['content-script.js'],
  }).then(() => {
    return chrome.scripting.executeScript({
      target: { tabId },
      func: (mode) => self.decodeBlocks(mode),
      args: [mode],
    });
  }).catch((error) => {
    console.error("Failed to execute script:", error);
    throw error;
  });
}

/**
 * Execute decode blocks script on a tab if the URL is allowed
 * @param {number} tabId - The tab ID
 * @param {string} url - The tab URL
 * @param {string} mode - The mode: 'selected' or 'same-class'
 */
function executeDecodeBlocksIfAllowed(tabId, url, mode) {
  if (!isUrlAllowedForScripting(url)) {
    console.warn("Cannot script this URL:", url);
    return;
  }
  
  executeDecodeBlocks(tabId, mode).catch((error) => {
    // Error is already logged in executeDecodeBlocks
  });
}

/**
 * Get mode from command or menu item ID
 * @param {string} id - The command or menu item ID
 * @returns {string|null} - The mode or null if not recognized
 */
function getModeFromId(id) {
  if (id === "unstringify-selected") {
    return "selected";
  } else if (id === "unstringify-same-class") {
    return "same-class";
  }
  return null;
}

// Export for use in other modules
export { 
  executeDecodeBlocks,
  executeDecodeBlocksIfAllowed,
  getModeFromId
};

