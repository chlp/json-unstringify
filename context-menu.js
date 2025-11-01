/**
 * Context menu management utilities
 */

import { isUrlAllowedForScripting } from './url-validator.js';
import { executeDecodeBlocksIfAllowed, getModeFromId } from './script-executor.js';

/**
 * Initialize context menu items
 */
function initializeContextMenu() {
  chrome.contextMenus.create({
    id: "unstringify-selected",
    title: "This block",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "unstringify-same-class",
    title: "All similar blocks",
    contexts: ["all"],
  });
}

/**
 * Update context menu visibility based on current tab
 * @param {number} tabId - The tab ID to check
 */
function updateContextMenuVisibility(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    
    const isAllowed = isUrlAllowedForScripting(tab.url);
    
    chrome.contextMenus.update("unstringify-selected", {
      visible: isAllowed
    });
    
    chrome.contextMenus.update("unstringify-same-class", {
      visible: isAllowed
    });
  });
}

/**
 * Handle context menu click events
 * @param {Object} info - Click info object
 * @param {Object} tab - Tab object
 */
function handleContextMenuClick(info, tab) {
  const mode = getModeFromId(info.menuItemId);
  if (mode) {
    executeDecodeBlocksIfAllowed(tab.id, tab.url, mode);
  }
}

/**
 * Setup context menu event listeners
 */
function setupContextMenuListeners() {
  // Context menu click handler
  chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
  
  // Update context menu visibility when tab changes
  chrome.tabs.onActivated.addListener((activeInfo) => {
    updateContextMenuVisibility(activeInfo.tabId);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      updateContextMenuVisibility(tabId);
    }
  });
}

// Export for use in other modules
export { 
  initializeContextMenu, 
  updateContextMenuVisibility, 
  handleContextMenuClick,
  setupContextMenuListeners 
};
