# Development Guide

## Project Structure

The codebase has been refactored into multiple modules for better maintainability and readability:

### Core Files

- **`background.js`** - Main entry point that coordinates all functionality
- **`manifest.json`** - Extension configuration and permissions

### Module Files

- **`url-validator.js`** - URL validation utilities
  - `isUrlAllowedForScripting(url)` - Checks if a URL is safe for scripting
  
- **`json-decoder.js`** - JSON decoding logic
  - `tryDecode(text)` - Safely attempts to decode JSON text
  - `decodeNestedJSON(value)` - Recursively decodes nested JSON strings
  - `decodeBlocks(mode)` - Main function for processing selected elements

- **`context-menu.js`** - Context menu management
  - `initializeContextMenu()` - Creates context menu items
  - `updateContextMenuVisibility(tabId)` - Updates menu visibility based on tab
  - `handleContextMenuClick(info, tab)` - Handles context menu clicks
  - `setupContextMenuListeners()` - Sets up all context menu event listeners

- **`keyboard-commands.js`** - Keyboard shortcut handling
  - `handleKeyboardCommand(command)` - Processes keyboard commands
  - `setupKeyboardCommandListeners()` - Sets up keyboard event listeners

## Module System

The project uses ES6 modules with the following structure:

```javascript
// Import modules
import { functionName } from './module-name.js';

// Export functions
export { functionName };
```

## Key Features

1. **URL Validation** - Prevents scripting on restricted pages (Chrome Web Store, extension pages, etc.)
2. **Error Handling** - Comprehensive error handling with console logging
3. **Modular Design** - Each concern is separated into its own module
4. **Type Safety** - JSDoc comments for better IDE support

## Development Workflow

1. Make changes to individual module files
2. Test the extension by reloading it in Chrome
3. Check browser console for any errors
4. Update documentation as needed

## Testing

To test the extension:

1. Load the extension in Chrome Developer Mode
2. Navigate to a webpage with JSON content
3. Right-click and test context menu options
4. Test keyboard shortcuts (Ctrl+Shift+F, Ctrl+F)
5. Verify that the extension doesn't work on restricted pages (Chrome Web Store, etc.)
