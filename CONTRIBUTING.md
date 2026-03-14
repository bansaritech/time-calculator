# Contributing to TimeCalc

Thank you for taking the time to contribute! TimeCalc is a small, focused tool and every thoughtful improvement makes it better for everyone. This document explains how to get involved.

---

## Reporting Bugs

If something is not working as expected, please [open an issue](../../issues/new) on GitHub. To help diagnose the problem quickly, include:

- **Browser name and version** (e.g. Brave 1.65.120 / Chrome 124.0.6367.82)
- **Extension version** (visible on `chrome://extensions`)
- **Steps to reproduce** — the exact input you typed and what happened vs. what you expected
- **Screenshots or screen recordings** if the issue is visual

Please search existing issues first to avoid duplicates.

---

## Suggesting Features

Before opening a pull request for a new feature, please **start a discussion** in the [GitHub Discussions](../../discussions) tab (or open an issue tagged `enhancement`). This gives maintainers a chance to weigh in on scope and design before you invest time coding.

Good questions to answer in your proposal:

- What problem does this solve or what workflow does it improve?
- How would users interact with it?
- Does it fit within the "no external requests, no accounts, fully offline" constraint?

---

## Development Setup

There is no build step. The extension runs directly from the source files.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/timecalc-extension.git
   cd timecalc-extension
   ```

2. **Load the extension in Chrome or Brave:**
   - Navigate to `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the repository folder

3. **Make your changes** to the source files (e.g. `popup.js`, `popup.html`, `app.html`).

4. **Reload the extension** after each change:
   - Click the refresh icon on the TimeCalc card in `chrome://extensions`, **or**
   - Close and reopen the popup

5. **Test in the web app** as well (`app.html` opened directly in a browser tab), since changes to shared logic affect both surfaces.

No `npm install`, no bundler, no transpilation needed.

---

## Code Style

- **Vanilla JavaScript only.** No frameworks, no libraries, no package manager dependencies.
- **No inline scripts or `eval`.** The extension enforces a strict Content Security Policy. All JS must live in separate `.js` files loaded via `src` attributes.
- **Keep files self-contained.** `popup.js` handles all popup logic. `background.js` is the service worker only. `app.html` embeds its own `<script>` block for the web-app version.
- **Prefer readability over cleverness** for formatting helpers and parsers — this code is meant to be audited by users who care about privacy.
- **No external network requests** — not even CDN requests from extension pages. (Tailwind CDN is acceptable only in the GitHub Pages HTML files `index.html`, `app.html`, and `privacy.html`, which are not part of the extension package itself.)
- Indent with 2 spaces. Keep lines reasonably short.

---

## Pull Request Process

1. **Branch from `main`** (or `master`):
   ```bash
   git checkout -b fix/parse-natural-negative
   ```

2. **Keep PRs small and focused.** One logical change per PR is much easier to review than a large omnibus diff.

3. **Describe what and why** in the PR body:
   - What was the problem or gap?
   - What approach did you take, and why?
   - How did you test it?

4. **Do not bump the version** in `manifest.json` yourself — maintainers handle releases.

5. A maintainer will review your PR, leave feedback if needed, and merge when it looks good.

---

## Supporting the Project

If TimeCalc saves you time and you would like to say thanks, consider scanning the UPI QR code in the extension's donate screen. Every contribution, however small, is genuinely appreciated and helps keep the project maintained.

---

Thank you for helping make TimeCalc better!
