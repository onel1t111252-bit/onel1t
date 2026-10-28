# ONEL1T NEXUS

**Browser-based cybersecurity workspace demo** for a personal portfolio.

- **Live demo:** https://onel1t111252-bit.github.io/onel1t/projects/nexus/
- **Portfolio:** https://onel1t111252-bit.github.io/onel1t/
- **Stack:** HTML, CSS and vanilla JavaScript; no build step or package installation.

## Modules

- **Overview:** dashboard layout with illustrative metrics.
- **SOC Operations:** triage a queue of simulated security events.
- **Threat Map:** illustrative regional markers and links to public security advisories.
- **AI Analyst:** local, rule-based text triage. Despite the UI label, it is not connected to a generative AI service.
- **Forensics Lab:** calculates a selected file's SHA-256 digest in the browser where Web Crypto is available.
- **OSINT Center:** local input/workflow helpers; it does not automatically query external services.
- **Network Matrix:** fictional network topology for demonstration.
- **Investigations:** create and manage local investigation notes.
- **Reports & Export:** download a text snapshot of demo events and locally saved cases.

## Run locally

1. Download or clone this repository.
2. Open `projects/nexus/index.html` in a modern browser.
3. For Web Crypto / SHA-256 support, use HTTPS or a local development server if opening the file directly is restricted.

No npm install, API key or backend is required for the demo.

## Data and security boundaries

- The dashboard contains **simulated telemetry and fictional network assets**. It is not a live monitoring service.
- Investigation records are stored in this browser's `localStorage`; they are not synced to a server and may disappear if browser storage is cleared.
- File hashing is performed locally in the browser. The app does not upload selected files, scan for malware, or prove that a file is safe.
- Public links are reference links only. The app does not automatically ingest or validate external intelligence.
- Do not enter real credentials, confidential incident details, personal data or sensitive evidence into a portfolio demo.
- There is no secure user authentication, shared database, server-side access control or production audit log.
- Never place private API keys in this static site's client-side HTML or JavaScript.

## Production roadmap

A production version would need a separately deployed backend, authentication and authorization, server-side secret management, persistent storage, input validation, audit logging, rate limiting, monitoring, and carefully scoped integrations with approved data sources. AI functionality should be implemented behind a server-side API, not by exposing a provider key in the browser.

## License and attribution

This is a portfolio demonstration. Public advisories and external services remain the property of their respective publishers; consult their terms before integrating or redistributing their data.
