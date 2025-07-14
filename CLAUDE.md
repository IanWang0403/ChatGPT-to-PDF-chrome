# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension that allows users to save ChatGPT conversations as PDF documents. The extension is built using Manifest V3 and consists of a content script that injects UI elements into the ChatGPT interface.

## Architecture

### Core Components

- **`content.js`** - Main extension logic containing the `PDFMessageSaver` class that handles:
  - DOM observation for ChatGPT interface changes
  - UI injection (buttons and dropdown menus)
  - Message selection and PDF generation
  - Event handling for user interactions

- **`manifest.json`** - Chrome extension manifest defining:
  - Permissions: `activeTab` and `https://chatgpt.com/*`
  - Content script injection targeting ChatGPT
  - Extension metadata and icons

- **`style.css`** - Styling for injected UI elements including:
  - Button group styling with rounded corners
  - Dropdown menu appearance
  - Message selection visual feedback
  - Responsive design for mobile

- **`scripts/html2pdf.bundle.min.js`** - Third-party library for HTML-to-PDF conversion

### Key Design Patterns

- **Observer Pattern**: Uses `MutationObserver` to detect DOM changes and inject UI when ChatGPT interface loads
- **Class-based Architecture**: Single `PDFMessageSaver` class encapsulates all functionality
- **Event-driven**: Button clicks and message selections trigger specific handler methods
- **DOM Manipulation**: Programmatically creates and injects UI elements into ChatGPT's interface

## Development Workflow

### Testing the Extension

1. **Load Extension**: Navigate to `chrome://extensions/`, enable Developer mode, and load the unpacked extension
2. **Test on ChatGPT**: Go to `https://chatgpt.com/` and verify the "Save to PDF" button appears near the profile button
3. **Test Features**:
   - Save entire conversations
   - Select specific messages using dropdown → "Select Messages"
   - Cancel selection mode
   - Verify PDF generation with proper formatting

### Key Extension Points

- **UI Injection**: Button group is injected next to `[data-testid="profile-button"]`
- **Message Detection**: Uses `[data-testid^="conversation-turn-"]` selector to find chat messages
- **PDF Generation**: Uses html2pdf library with specific options for A4 format, margins, and image quality

### Important Selectors

- Profile button: `[data-testid="profile-button"]`
- Conversation messages: `[data-testid^="conversation-turn-"]`
- Assistant messages: `[data-message-author-role="assistant"]`

## Common Development Tasks

### Modifying PDF Options

PDF generation options are configured in `generatePdf()` method in `content.js:117-124`. Key settings include:
- Margin: 40pt
- Format: A4 portrait
- Image quality: 0.98 (JPEG)
- Canvas scale: 2x for high quality

### Updating UI Styling

Button and dropdown styling is in `style.css`. The design uses:
- Green color scheme (#4CAF50)
- Rounded button group with seamless connection
- Responsive breakpoints for mobile (<600px)

### Adding New Features

New functionality should be added as methods to the `PDFMessageSaver` class. Follow existing patterns:
- Use `querySelector`/`querySelectorAll` for DOM selection
- Add event listeners in constructor or initialization methods
- Maintain UI state through class properties

## Browser Compatibility

- **Target**: Chrome/Chromium browsers with Manifest V3 support
- **Permissions**: Minimal permissions (`activeTab` only)
- **Host Access**: Restricted to `https://chatgpt.com/*`