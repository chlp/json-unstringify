/**
 * Keyboard commands handling utilities
 */

import { isUrlAllowedForScripting } from './url-validator.js';

/**
 * Handle keyboard command events
 * @param {string} command - The command that was triggered
 */
function handleKeyboardCommand(command) {
  let mode = "";
  if (command === "unstringify-selected") {
    mode = "selected";
  } else if (command === "unstringify-same-class") {
    mode = "same-class";
  }

  if (mode) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      
      // Check if the tab URL is allowed for scripting
      if (!isUrlAllowedForScripting(tabs[0].url)) {
        console.warn("Cannot script this URL:", tabs[0].url);
        return;
      }
      
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: self.decodeBlocks,
        args: [mode],
      }).catch((error) => {
        console.error("Failed to execute script:", error);
      });
    });
  }
}

/**
 * Setup keyboard command listeners
 */
function setupKeyboardCommandListeners() {
  chrome.commands.onCommand.addListener(handleKeyboardCommand);
}

// Export for use in other modules
export { 
  handleKeyboardCommand,
  setupKeyboardCommandListeners 
};
