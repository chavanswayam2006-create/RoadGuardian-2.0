# Definition of Done (DoD): RoadGuardian 2.0

Every feature, module, or integration task within this repository must meet the following criteria before being marked as **DONE**:

- [ ] **Code exists**: Production implementation files are written and committed.
- [ ] **Code imports correctly**: No syntax errors, broken relative imports, or missing packages.
- [ ] **Feature runs**: Module executes successfully in the runtime environment.
- [ ] **Relevant test exists**: Automated unit or integration test covers the core logic and critical branches.
- [ ] **Test passes**: Test suite executes cleanly with zero failures.
- [ ] **Error handling exists**: Graceful degradation, timeouts, input validation, and boundary conditions are handled.
- [ ] **API contract matches**: Payloads and endpoints adhere strictly to `Brain/API_CONTRACT.md`.
- [ ] **UI state works where applicable**: Interactive components, visual alerts, and telemetry widgets update dynamically.
- [ ] **Brain documentation is updated**: Relevant Brain files (`ARCHITECTURE.md`, `API_CONTRACT.md`, `TASKS.md`, `CHANGELOG.md`, `SESSION_LOG.md`) reflect actual changes.
- [ ] **No fake data is presented as live**: Mocked or fallback data is explicitly marked as simulated; no fabricated live telemetry.
- [ ] **No secrets are committed**: Zero API keys, passwords, credentials, or `.env` files staged or committed.
- [ ] **Dataset remains Git-ignored**: `git status` verifies `data/local/` and archive files are completely ignored.
- [ ] **Manual smoke test completed**: Live end-to-end check performed and verified.
