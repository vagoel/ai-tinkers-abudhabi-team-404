# VoiceLayer Chrome extension

The extension adds VoiceLayer to the active webpage when its toolbar icon is clicked. Click the icon again to remove it.

## Load this development build

1. Keep the VoiceLayer Next.js server running.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the generated `dist/chrome-extension` directory.
6. Pin **VoiceLayer — GPT-Live** from Chrome's extensions menu.

Chrome does not allow normal websites to install an unpublished extension directly. A true **Add to Chrome** flow requires publishing this package in the Chrome Web Store and linking the website to its store listing.

## Build

```bash
npm run build:extension
```

The build uses `EXTENSION_PROXY_BASE`, then `NEXT_PUBLIC_PROXY_BASE`, and finally `http://localhost:3000`. Use an HTTPS server URL before creating a distributable Web Store package. OpenAI and Exa keys remain in that server and are never bundled into the extension.
