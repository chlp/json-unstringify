/**
 * Content script for JSON Unstringify extension
 * This file contains the code that runs on web pages
 */

/**
 * Process text and return formatted result
 * @param {string} text - The text to process
 * @returns {string} - Formatted text result
 */
function processText(text) {
  try {
    const decoded = decodeNestedJSON(text);
    return stringifyCompact(decoded);
  } catch (e) {
    console.error("processText error:", e);
    return text; // Return original text if processing fails
  }
}

/**
 * Compact stringify with smart formatting
 * @param {any} value - The value to stringify
 * @param {number} space - Number of spaces for indentation
 * @param {number} level - Current nesting level
 * @returns {string} - Formatted JSON string
 */
function stringifyCompact(value, space = 2, level = 0) {
  const indent = ' '.repeat(level * space);

  // Array?
  if (Array.isArray(value)) {
    // All elements are primitives?
    const allPrimitives = value.every(v =>
      v === null ||
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    );
    if (allPrimitives) {
      return JSON.stringify(value); // Single line
    } else {
      // Nested format
      const items = value.map(v =>
        stringifyCompact(v, space, level + 1)
      );
      return "[\n" + items.map(i => indent + " ".repeat(space) + i).join(",\n")
             + "\n" + indent + "]";
    }
  }

  // Object?
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(
      ([k, v]) =>
        JSON.stringify(k) + ": " +
        stringifyCompact(v, space, level + 1)
    );
    return "{\n" + entries.map(e => indent + " ".repeat(space) + e).join(",\n")
           + "\n" + indent + "}";
  }

  // Primitive
  return JSON.stringify(value);
}

/**
 * Recursively decode nested JSON strings
 * @param {any} value - The value to decode
 * @returns {any} - The decoded value
 */
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

/**
 * Main function to decode blocks based on mode
 * @param {string} mode - The mode: 'selected' or 'same-class'
 */
function decodeBlocks(mode) {
  const selected = window.getSelection();
  if (!selected.rangeCount) return;

  const node = selected.anchorNode?.parentElement;
  if (!node) return;

  let elements = [];
  if (mode === "selected") {
    elements.push(node);
  } else if (mode === "same-class") {
    const className = node.className;
    if (!className || typeof className !== 'string') return;
    // Split by spaces to handle multiple classes, and escape special characters
    const classes = className.trim().split(/\s+/).filter(cls => cls.length > 0);
    if (classes.length === 0) return;
    // Build a safe selector by escaping each class name and combining them
    // (multiple classes without spaces means elements must have all of them)
    const selector = classes.map(cls => {
      // CSS.escape is not available in all contexts, so use a simple escape
      // that handles most cases (escaping special CSS characters)
      const escaped = cls.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1');
      return `.${escaped}`;
    }).join('');
    elements = document.querySelectorAll(selector);
  }

  elements.forEach((el) => {
    el.innerText = processText(el.innerText);
    el.style.overflow = "visible";
  });
}

// Make functions available globally for chrome.scripting.executeScript
self.decodeBlocks = decodeBlocks;
