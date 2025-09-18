// Function to check if a URL is allowed for scripting
function isUrlAllowedForScripting(url) {
  try {
    const urlObj = new URL(url);
    
    // Block Chrome extension pages
    if (urlObj.protocol === 'chrome-extension:' || 
        urlObj.protocol === 'moz-extension:' ||
        urlObj.protocol === 'safari-extension:') {
      return false;
    }
    
    // Block Chrome Web Store and other extension galleries
    if (urlObj.hostname.includes('chrome.google.com') ||
        urlObj.hostname.includes('chromewebstore.google.com') ||
        urlObj.hostname.includes('addons.mozilla.org') ||
        urlObj.hostname.includes('microsoftedge.microsoft.com') ||
        urlObj.hostname.includes('apps.apple.com')) {
      return false;
    }
    
    // Block special Chrome pages
    if (urlObj.protocol === 'chrome:' ||
        urlObj.protocol === 'chrome-search:' ||
        urlObj.protocol === 'chrome-devtools:' ||
        urlObj.protocol === 'chrome-extension:') {
      return false;
    }
    
    // Allow all other URLs
    return true;
  } catch (e) {
    // If URL parsing fails, allow it (might be a data URL or similar)
    return true;
  }
}

chrome.runtime.onInstalled.addListener(() => {
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
});

// Update context menu visibility based on current tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateContextMenuVisibility(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateContextMenuVisibility(tabId);
  }
});

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

chrome.contextMenus.onClicked.addListener((info, tab) => {
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
      func: decodeBlocks,
      args: [mode],
    }).catch((error) => {
      console.error("Failed to execute script:", error);
    });
  }
});

// ✅ New: keyboard shortcut handler
chrome.commands.onCommand.addListener((command) => {
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
        func: decodeBlocks,
        args: [mode],
      }).catch((error) => {
        console.error("Failed to execute script:", error);
      });
    });
  }
});

function decodeBlocks(mode) {
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
}
