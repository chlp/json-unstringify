/**
 * Context menu management utilities
 */

import { isUrlAllowedForScripting } from './url-validator.js';

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
  // Check if the tab URL is allowed for scripting
  if (!isUrlAllowedForScripting(tab.url)) {
    console.warn("Cannot script this URL:", tab.url);
    return;
  }

  let mode = "";
  if (info.menuItemId === "unstringify-selected") {
    mode = "selected";
  } else if (info.menuItemId === "unstringify-same-class") {
    mode = "same-class";
  }

  if (mode) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: self.decodeBlocks,
      args: [mode],
    }).catch((error) => {
      console.error("Failed to execute script:", error);
    });
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
