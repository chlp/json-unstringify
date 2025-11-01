/**
 * Context menu management utilities
 */

import { isUrlAllowedForScripting } from './url-validator.js';
import { executeDecodeBlocksIfAllowed, getModeFromId } from './script-executor.js';

/**
 * Initialize context menu items
 * Handles duplicates by removing existing items first
 */
async function initializeContextMenu() {
  // Remove existing items to avoid duplicates
  try {
    await chrome.contextMenus.removeAll();
  } catch (error) {
    // Ignore errors if items don't exist
    console.debug("Context menu removeAll:", error);
  }

  // Create context menu items
  try {
    await chrome.contextMenus.create({
      id: "unstringify-selected",
      title: "This block",
      contexts: ["all"],
    });

    await chrome.contextMenus.create({
      id: "unstringify-same-class",
      title: "All similar blocks",
      contexts: ["all"],
    });
  } catch (error) {
    // Handle errors gracefully (e.g., if menu already exists)
    console.error("Failed to create context menu:", error);
  }
}

/**
 * Update context menu visibility based on current tab
 * @param {number} tabId - The tab ID to check
 */
function updateContextMenuVisibility(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    if (!tab || !tab.url) return;
    
    const isAllowed = isUrlAllowedForScripting(tab.url);
    
    // Update with error handling in case menu items don't exist yet
    chrome.contextMenus.update("unstringify-selected", {
      visible: isAllowed
    }, () => {
      if (chrome.runtime.lastError) {
        // Menu item might not exist yet, ignore error
        console.debug("Context menu update error:", chrome.runtime.lastError.message);
      }
    });
    
    chrome.contextMenus.update("unstringify-same-class", {
      visible: isAllowed
    }, () => {
      if (chrome.runtime.lastError) {
        // Menu item might not exist yet, ignore error
        console.debug("Context menu update error:", chrome.runtime.lastError.message);
      }
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
