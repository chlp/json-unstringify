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

// Define decodeBlocks function with all dependencies inline
// This is necessary because chrome.scripting.executeScript doesn't have access to modules
self.decodeBlocks = function(mode) {
  function tryDecode(text) {
    try {
      return decodeNestedJSON(text);
    } catch (e) {
      console.error("tryDecode error:", e);
      return null;
    }
  }

  function decodeNestedJSON(value) {
    if (typeof value === "string") {
      const str = value.trim();
      if (
        (str.startsWith("{") && str.endsWith("}")) ||
        (str.startsWith("[") && str.endsWith("]"))
      ) {
        try {
          const parsed = JSON.parse(str);
          return decodeNestedJSON(parsed); // recursive
        } catch (e) {
          console.error("decodeNestedJSON: failed to parse string:", e);
          return value;
        }
      } else {
        return value;
      }
    } else if (Array.isArray(value)) {
      return value.map(decodeNestedJSON);
    } else if (value && typeof value === "object") {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          value[key] = decodeNestedJSON(value[key]);
        }
      }
      return value;
    } else {
      return value;
    }
  }

  const selected = window.getSelection();
  if (!selected.rangeCount) return;

  const node = selected.anchorNode?.parentElement;
  if (!node) return;

  if (mode === "selected") {
    const decoded = tryDecode(node.innerText);
    if (decoded) {
      node.innerText = JSON.stringify(decoded, null, 2);
      node.style.overflow = "visible";
    }
  } else if (mode === "same-class") {
    const className = node.className;
    if (!className) return;

    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach((el) => {
      const decoded = tryDecode(el.innerText);
      if (decoded) {
        el.innerText = JSON.stringify(decoded, null, 2);
        el.style.overflow = "visible";
      }
    });
  }
};

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