# Tab Lifecycle Timer

Automatic closing of inactive tabs with a control panel, whitelist, trash bin, and media protection.

![Version](https://img.shields.io/badge/version-2.2-blue)
![Manifest](https://img.shields.io/badge/Manifest-V3-green)
![Chromium](https://img.shields.io/badge/Chromium-%E2%9C%94-brightgreen)
![Firefox](https://img.shields.io/badge/Firefox-%E2%9C%94-brightgreen)

---

## Features

| Feature | Description |
|---|---|
| Auto close | Closes tabs that stay inactive in the background for the configured time |
| Per-tab immunity | Protect a specific tab through the popup, even without pinning it |
| Whitelist | Domains that should never be closed by the extension |
| Trash bin | Last 50 closed tabs with restore support |
| Media protection | Video and audio activity prevents a tab from being closed |
| Timestamp restore | YouTube, Vimeo, and Twitch tabs can be restored with playback time |
| Global pause | Temporarily disable all automation with one switch |
| RAM analytics | Counter for estimated saved memory |
| Dashboard protection | The dashboard tab can protect itself from auto-close |
| Live search | Filter trash and protected tabs instantly |

---

## Installation

### Chromium (Chrome, Edge, Brave)

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the project folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select any file from the folder, for example `manifest.json`

On first launch in Firefox, a banner may ask for permission to access websites. Allow it so media analysis can work.

### Build from source

```bash
python build.py
# -> dist/chromium/   (Service Worker)
# -> dist/firefox/    (Event Pages)
```

---

## Project structure

```text
auto-close-tabs-browser
├── manifest.json          # Extension configuration (MV3)
├── background.js          # Service Worker core logic
├── popup.html             # Popup with quick controls
├── popup.js               # Popup behavior
├── dashboard.html         # Full control panel UI
├── dashboard.js           # Dashboard behavior
├── logic.js               # Shared business logic helpers
├── i18n.js                # UI localization dictionaries and helpers
├── build.py               # Build script (Chromium + Firefox)
├── package.json           # Test script
├── logic.test.js          # Business logic tests
├── .gitignore
├── LICENSE
├── README.md
└── README-en.md
```

---

## How it works

```text
Tab created or activated
        |
        v
   Timer starts (N min)
        |
        v
   Timer fires -----------+-- Tab focused? ---------> Reset timer
                          |
                          +-- Pinned or audible? ---> Reset timer
                          |
                          +-- In whitelist? --------> Reset timer
                          |
                          +-- Media detected? ------> Reset timer
                          |
                          +-- Protected manually? --> Reset timer
                          |
                          +-- Otherwise ------------> Close + save to trash
```

---

## Configuration keys

| Key | Type | Default | Description |
|---|---|---|---|
| `timeoutMinutes` | `number` | `10` | Timeout before closing a tab |
| `timerEnabled` | `boolean` | `true` | Global pause switch |
| `whiteList` | `string[]` | `[]` | Whitelisted domains |
| `protectedTabIds` | `number[]` | `[]` | Tabs protected through the popup |
| `protectDashboard` | `boolean` | `true` | Prevent auto-closing the dashboard |
| `trashBin` | `object[]` | `[]` | Trash bin with up to 50 records |
| `savedRamMb` | `number` | `0` | Estimated saved RAM counter |
| `locale` | `string` | `auto` | UI language override (`auto`, `ru`, `en`) |

---

## Security and privacy

- No access to cookies, browsing history, or passwords
- No telemetry or external network requests
- All data is stored locally in `chrome.storage.local`
- XSS protection: UI rendering uses safe DOM APIs instead of injecting HTML
- Race condition mitigation: storage writes are queued in the background logic

---

## Testing

```bash
npm test
```

This runs the business logic tests with Node's built-in test runner.

---

## License

MIT
