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

chrome.contextMenus.onClicked.addListener((info, tab) => {
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
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: decodeBlocks,
        args: [mode],
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
