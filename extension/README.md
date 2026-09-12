# SightSpeak Chrome extension

SightSpeak is enabled by default. It automatically adds the voice button to
open HTTP and HTTPS pages, newly selected tabs, and pages after navigation.

The toolbar badge shows the browser-wide state:

- **ON** — SightSpeak automatically runs on supported pages.
- **OFF** — automatic injection is paused and existing voice buttons are removed.
- **ERR** — Chrome does not allow extensions on the current page, such as a
  `chrome://` settings page or the Chrome Web Store.

Click the toolbar icon to turn SightSpeak OFF or ON across all open tabs. The
setting persists after Chrome restarts.

## Load this development build

1. Keep the SightSpeak Next.js server running.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the generated `dist/chrome-extension` directory.
6. Pin **SightSpeak — GPT-Live** from Chrome's extensions menu.

Chrome will request permission to read and change pages on websites you visit.
That access is required for automatic injection and hands-free page control.
SightSpeak cannot run on Chrome's internal pages or the Chrome Web Store.

Chrome does not allow normal websites to install an unpublished extension directly. A true **Add to Chrome** flow requires publishing this package in the Chrome Web Store and linking the website to its store listing.

## Build

```bash
npm run build:extension
```

The build uses `EXTENSION_PROXY_BASE`, then `NEXT_PUBLIC_PROXY_BASE`, and finally `http://localhost:3000`. Use an HTTPS server URL before creating a distributable Web Store package. OpenAI and Exa keys remain in that server and are never bundled into the extension.
