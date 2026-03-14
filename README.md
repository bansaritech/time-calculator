# TimeCalc

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0-brightgreen.svg)](manifest.json)
[![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Brave-orange.svg)](https://chrome.google.com/webstore)
[![Made with love](https://img.shields.io/badge/made%20with-%E2%9D%A4-red.svg)](#)

> Add & subtract time durations with smart output modes — right from your browser toolbar.

TimeCalc is a lightweight, fully offline browser extension (and web app) for calculating time durations. Paste in clock values, natural-language phrases, or plain numbers, chain additions and subtractions, and instantly see the result in whatever format suits you — clock notation, plain hours for a timesheet, work-day breakdowns, and more. No account, no analytics, no network requests — just arithmetic.

---

## Screenshots

> _Screenshots coming soon. Add your own to a `/screenshots` folder and link them here._

---

## Features

- Add and subtract any number of time durations in one expression
- Five output modes: Clock, Natural, Work, Hours, All
- Understands dot/colon notation, natural language, and plain numbers
- Keyboard-first: type `+` / `-` to chain entries, `Enter` or `=` to calculate, `Esc` to clear, `Ctrl+Z` to undo
- Saves your preferred output mode across sessions (Chrome `storage` API)
- Extension badge shows the running result at a glance
- Also works as a standalone web app — no install required
- Zero dependencies, zero network requests, fully CSP-compliant

---

## Input Formats

| Format | Example | Interpreted as |
|---|---|---|
| Dot notation | `3.23.44` | 3 h 23 m 44 s |
| Colon notation | `1:30` | 1 h 30 m |
| Natural language | `2h 30m`, `1d 4h 15m` | parsed by unit keywords |
| Long natural | `2 hours 30 minutes` | same parser, long-form units |
| Calendar units | `1 week 3 days`, `2 months` | calendar breakdown |
| Plain number | `3` | 3 hours exactly |

```
Supported unit keywords:
  y / yr / year          →  year  (365.25 days)
  mo / month             →  month (30.4375 days)
  w / wk / week          →  week
  d / day                →  day
  h / hr / hour          →  hour
  m / min / minute       →  minute
  s / sec / second       →  second
```

---

## Output Modes

| Mode | Example output | Best for |
|---|---|---|
| **Clock** | `9.45.30` | Reading time on a clock face; hours can exceed 24 |
| **Natural** | `9 hours 45 mins 30 secs` | Human-readable calendar breakdown |
| **Work** | `1 work day 1 hour 45 mins` | Project billing (8 h/day, 5 d/wk, 160 h/month) |
| **Hours** | `9.7583 hours` | Timesheets that expect decimal hours |
| **All** | Clock + Natural + Work + Hours | Side-by-side reference |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl+Shift+T` / `Cmd+Shift+T` | Open the TimeCalc popup from anywhere |
| `+` | Commit current entry and queue addition |
| `-` | Commit current entry and queue subtraction |
| `Enter` | Add current entry (or calculate if input is empty) |
| `Shift+Enter` | Calculate immediately |
| `=` | Calculate |
| `Backspace` (empty input) | Undo last committed entry |
| `Ctrl+Z` / `Cmd+Z` | Undo last committed entry |
| `Esc` | Clear everything |

---

## Installation

### Option 1 — Chrome Web Store _(coming soon)_

The extension will be published to the Chrome Web Store. A link will appear here once it is live.

### Option 2 — Manual (load unpacked)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/timecalc-extension.git
   ```
2. Open Chrome or Brave and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the cloned repository folder.
5. The TimeCalc icon appears in your toolbar. Pin it for quick access.

> Updates: when you pull new commits, go back to `chrome://extensions` and click the refresh icon on the TimeCalc card.

---

## Web App

Don't want to install an extension? Open `app.html` directly in your browser, or visit the hosted version on GitHub Pages:

**https://YOUR_USERNAME.github.io/timecalc-extension/app.html**

The web app has the same calculator UI and saves your output mode preference to `localStorage`. It works fully offline once loaded.

The project landing page is at:

**https://YOUR_USERNAME.github.io/timecalc-extension/**

---

## Project Structure

```
timecalc-extension/
├── manifest.json      # MV3 extension manifest (permissions, shortcuts, icons)
├── popup.html         # Extension popup — markup and styles
├── popup.js           # Extension popup — all calculator logic
├── background.js      # Service worker — manages the toolbar badge
├── app.html           # Standalone web calculator (Tailwind CDN, localStorage)
├── index.html         # GitHub Pages landing page
├── privacy.html       # Privacy policy page
├── icon16.png         # Toolbar icon 16×16
├── icon32.png         # Toolbar icon 32×32
├── icon48.png         # Extension management icon 48×48
├── icon128.png        # Chrome Web Store icon 128×128
├── qr-upi.svg         # UPI QR code for donations
├── README.md          # This file
├── CONTRIBUTING.md    # Contribution guidelines
├── LICENSE            # MIT License
└── .gitignore
```

---

## Contributing

Contributions, bug reports, and feature ideas are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).
