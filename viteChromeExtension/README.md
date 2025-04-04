# Weather Chrome Extension with Vite + React + TypeScript

This project demonstrates how to build a Chrome extension using Vite, React, and TypeScript. The extension allows users to get current weather information for any location using the Open-Meteo API.

## Features

- 🌡️ Real-time weather data
- 📍 Location search by zip code or city name
- 🌈 Detailed weather conditions
- 🔄 Loading states and error handling
- 🎨 Modern, responsive UI

## Setup Instructions

1. **Create Vite Project**

```bash
npm create vite@latest my-extension -- --template react-ts
cd my-extension
npm install
```

2. **Install Required Dependencies**

```bash
npm install axios
npm install --save-dev @types/chrome
```

3. **Configure manifest.json**
   Create a `manifest.json` in the project root:

```json
{
  "manifest_version": 3,
  "name": "Weather Extension",
  "version": "1.0.0",
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_popup": "index.html"
  },
  "permissions": ["scripting"],
  "host_permissions": ["https://*/*"]
}
```

4. **Update vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        index: "index.html",
      },
    },
  },
});
```

## Development

1. **Build the Extension**

```bash
npm run build
```

2. **Load in Chrome**

- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `dist` directory from your project

3. **Development Workflow**

- Make changes to your code
- Run `npm run build`
- Click the refresh icon in `chrome://extensions/` for your extension

## Project Structure

```
viteChromeExtension/
├── src/
│   ├── App.tsx           # Main application component
│   ├── App.css           # Styles
│   └── assets/           # Images and other assets
├── public/
│   └── icons/            # Extension icons
├── manifest.json         # Extension manifest
├── index.html           # Entry point
└── vite.config.ts       # Vite configuration
```

## Key Learnings

1. **Chrome Extension Basics**

   - Manifest V3 structure
   - Extension permissions
   - Chrome API integration

2. **TypeScript Integration**

   - Using `@types/chrome` for Chrome API types
   - Type definitions for component props and state

3. **API Integration**

   - Using Open-Meteo API for weather data
   - Handling API responses and errors
   - Converting temperature units

4. **React Best Practices**
   - State management with hooks
   - Error boundaries
   - Loading states
   - Component organization

## API Reference

This project uses the [Open-Meteo API](https://open-meteo.com/):

- Geocoding API: Converts location names to coordinates
- Weather API: Provides current weather data
- No API key required
- Free for non-commercial use

## Troubleshooting

Common issues and solutions:

1. **Chrome API Type Errors**

   - Make sure `@types/chrome` is installed
   - Check manifest permissions

2. **Build Issues**

   - Clear the `dist` directory
   - Ensure all dependencies are installed
   - Check vite.config.ts configuration

3. **Extension Not Loading**
   - Verify manifest.json is valid
   - Check if all required files are in dist
   - Look for console errors in DevTools

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project as a template for your own Chrome extensions!
