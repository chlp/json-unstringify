/**
 * Keyboard commands handling utilities
 */

import { executeDecodeBlocksIfAllowed, getModeFromId } from './script-executor.js';

/**
 * Handle keyboard command events
 * @param {string} command - The command that was triggered
 */
function handleKeyboardCommand(command) {
  const mode = getModeFromId(command);
  if (mode) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      executeDecodeBlocksIfAllowed(tabs[0].id, tabs[0].url, mode);
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
