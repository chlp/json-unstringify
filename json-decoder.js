/**
 * JSON decoding utilities for unstringifying nested JSON
 */

/**
 * Try to decode a text string as JSON
 * @param {string} text - The text to decode
 * @returns {Object|Array|null} - Decoded object or null if failed
 */
function tryDecode(text) {
  try {
    return decodeNestedJSON(text);
  } catch (e) {
    console.error("tryDecode error:", e);
    return null;
  }
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
}

// Export for use in other modules
export { tryDecode, decodeNestedJSON, decodeBlocks };
