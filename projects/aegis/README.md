# ONEL1T AEGIS

ONEL1T AEGIS is a local-first defensive security operations simulation built for a cybersecurity portfolio. It connects synthetic incidents, asset context, risk decisions, defensive playbooks and analyst reporting in one browser-based workspace.

## Scope

AEGIS is intentionally defensive and safe. It does not scan networks, exploit systems, interact with external targets, collect credentials or process live user traffic. All security events and assets are synthetic training data.

## Modules

- Operations Overview — defensive posture, queue metrics and workflow context.
- Incident Triage — prioritize synthetic events, inspect asset context and record status.
- Asset Inventory — map synthetic systems to owners, controls and criticality.
- Risk Register — connect assets with treatment decisions and next actions.
- Response Playbooks — interactive checklists for safe defensive simulations.
- Analyst Reports — export a plain-text snapshot of the current local lab state.
- Drill Scenarios — load synthetic identity, phishing-awareness and endpoint-baseline events.

## Technical approach

- HTML, CSS and vanilla JavaScript.
- No backend required; designed to run on GitHub Pages.
- Local state is saved in the browser with localStorage when available.
- EN / UA / CZ interface localization.
- Responsive layout for desktop and mobile.
- Reduced-motion support.

## Portfolio goal

The project demonstrates how multiple defensive-security concepts can be combined into a coherent product workflow: observe → add context → decide → document.
