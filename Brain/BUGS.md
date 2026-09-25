# Bug Tracker: RoadGuardian 2.0

## Active Issues
*None.*

---

## Resolved Issues
### BUG-001: ContextMap Crash on Leaflet LatLng Initialization with Backend Garages
- **Component**: Frontend / Backend Schema Contract
- **Severity**: Blocker
- **Steps to Reproduce**: Load frontend with running backend. Backend `/garages` returns nested `coordinates: { latitude, longitude }` while `ContextMap.tsx` expected `garage.lat` / `garage.lon`.
- **Expected Behavior**: Map displays garage markers safely.
- **Actual Behavior**: Uncaught Leaflet exception `Invalid LatLng object: (undefined, undefined)` crashed the `<ContextMap>` component.
- **Resolution**: Normalized response handling in `frontend/src/services/api.ts`, added optional `lat`/`lon` to `backend/schemas.py`, and added defensive coordinate validation in `frontend/src/components/ContextMap.tsx`. Verified with `npm run build --prefix frontend` and `pytest`.

### BUG-002: Optical Feed Crash on Detection Object Bounding Box Destructuring
- **Component**: Frontend / Vision Feed
- **Severity**: Blocker
- **Steps to Reproduce**: When `/detect` returned real backend detections, `bounding_box` was structured as `{ x_min, y_min, x_max, y_max }`. In `VisionCanvas.tsx`, `const [x1, y1, x2, y2] = det.bbox;` tried to iterate over `undefined`.
- **Expected Behavior**: Detections render bounding boxes and labels cleanly over the optical canvas.
- **Actual Behavior**: Uncaught `TypeError: det.bbox is not iterable` crashed `VisionCanvas`.
- **Resolution**: Normalized detections in `frontend/src/services/api.ts` into pixel-coordinate `bbox: [x1, y1, x2, y2]` based on canvas dimensions, and added defensive fallback parsing in `frontend/src/components/VisionCanvas.tsx`. Verified with TypeScript compiler and `npm run build --prefix frontend`.

### BUG-003: Driver Status Contract Mismatch & Empty Gaze Indicator
- **Component**: Frontend / In-Cabin Driver Monitoring System
- **Severity**: Medium
- **Steps to Reproduce**: Backend `/driver-status` returned raw head pose angles and state, but lacked the qualitative `gaze_direction` string expected by the tactical HUD.
- **Expected Behavior**: Gaze indicator displays glance direction (`FORWARD`, `LOOKING LEFT`, `LOOKING RIGHT`, `LOOKING DOWN`).
- **Actual Behavior**: Gaze direction was undefined/blank, and `head_pose` access was vulnerable to undefined properties.
- **Resolution**: Normalized `getDriverStatus` in `frontend/src/services/api.ts` to compute qualitative gaze direction from head pitch/yaw angles, defaulted `head_pose` coordinates, and guarded display in `frontend/src/components/DriverGauge.tsx`. Verified with unit test suite and frontend build.

### BUG-004: Versioned /api/v1 Route Contract Absence & Pydantic V2 Config Deprecation
- **Component**: Backend / Configuration & Routing
- **Severity**: Medium
- **Steps to Reproduce**: Calling endpoints via documented `/api/v1/vision/detect-frame` or `/api/v1/context/road-info` returned 404. Test runs emitted Pydantic V2 `PydanticDeprecatedSince20` warnings for class-based `Config`.
- **Expected Behavior**: Both root paths and `/api/v1/` contract paths resolve cleanly, and zero deprecation warnings on startup.
- **Actual Behavior**: 404 for `/api/v1/...` paths and startup warnings.
- **Resolution**: Added `APIRouter(prefix="/api/v1")` with all contract route aliases in `backend/main.py`, upgraded `backend/config.py` to `SettingsConfigDict`, and added `test_api_v1_contract_compliance` test. Verified with 11/11 passing tests.

### BUG-005: Standalone Static & GitHub Pages Null Safety on Health Config & Base Routing
- **Component**: Frontend / Deployment & System Telemetry
- **Severity**: Blocker
- **Steps to Reproduce**: Load the frontend on GitHub Pages or standalone static environment without an active local backend. The `health` object is null, causing `health.config.device` to throw an uncaught TypeError that crashed the React tree into a blank screen.
- **Expected Behavior**: Tactical Cockpit HUD loads gracefully in standalone mode with synthetic simulations, fallback hardware metadata, and defensive routing.
- **Actual Behavior**: Uncaught `TypeError: Cannot read properties of null (reading 'config')` crashed `<CockpitHeader>`, `<TopStatusBar>`, and `<SystemStatusPage>`.
- **Resolution**:
  1. Added optional chaining across all telemetry accesses (`health?.config?.device`, `health?.config?.classes_loaded`, `health?.config?.ear_threshold`).
  2. Wrapped root `<App />` with top-level `<ErrorBoundary>` in `frontend/src/main.tsx`.
  3. Added safety guard for Tailwind CDN initialization in `frontend/index.html`.
  4. Configured dynamic base path in `frontend/vite.config.ts` supporting both Vite production build for `/RoadGuardian-2.0/` and root dev server.
  5. Added defensive array fallback `(garage.services || [])` in `frontend/src/pages/RoadMapPage.tsx`.

### BUG-006: Root URL (`/`) Returned a Bare 404 — Looked Like a Dead Backend
- **Component**: Backend / Developer Experience
- **Severity**: Low
- **Steps to Reproduce**: Start the backend (`python backend/main.py`) and open `http://127.0.0.1:8000/` in a browser.
- **Expected Behavior**: Opening the service root indicates the API is alive and where the docs are.
- **Actual Behavior**: `{"detail":"Not Found"}`. The FastAPI app was fully healthy (`/health`, `/docs`, `/openapi.json` all returned 200; the port owner was confirmed as `python backend/main.py`), but the bare 404 made it look broken.
- **Resolution**: Added a `GET /` service-discovery route in `backend/main.py` returning service name, version, `/docs`, `/health`, and an endpoint index. Verified live: `GET /` -> 200 with JSON body.

### BUG-007: CORS Allow-List Rejected Vite Preview / LAN Origins and `*.vercel.app` Never Matched
- **Component**: Backend / CORS
- **Severity**: High
- **Steps to Reproduce**: Serve the production build with `npm run preview` (port 4173) or open the built `dist/index.html`, then load the CAM page. The browser blocks `fetch('http://localhost:8000/health')` and the UI reports `MODEL SERVICE OFFLINE` although the backend is up.
- **Expected Behavior**: Local dev (5173), local preview (4173) and the deployed Vercel frontend can all reach `/health` and `/detect`.
- **Actual Behavior**: Only 5173/3000 and one hardcoded Vercel origin were allowed. The entry `https://*.vercel.app` is a literal string in Starlette's `allow_origins`, so it never matched any real origin (verified: `https://some-other-app.vercel.app` received no `Access-Control-Allow-Origin`).
- **Resolution**: `backend/config.py` now parses `CORS_ORIGINS` (comma-separated env supported), includes 5173 + 4173 for both `localhost` and `127.0.0.1`, and adds `CORS_ORIGIN_REGEX` (`^https://([a-z0-9-]+\.)*vercel\.app$`) applied via `allow_origin_regex`. Verified live with an Origin-header matrix: 5173/4173 pass, arbitrary `*.vercel.app` previews pass, non-Vercel origins are still rejected.

### BUG-008: Camera Failure Reporting Could Not Distinguish Hardware, Constraint and Secure-Context Problems
- **Component**: Frontend / CAM Camera Lifecycle
- **Severity**: Medium
- **Steps to Reproduce**: Press START CAMERA on a desktop without a webcam, from a non-secure origin (`file://`, plain-HTTP LAN IP), or while another application holds the camera.
- **Expected Behavior**: The exact reason is reported, image upload remains available, and `facingMode` constraints never cause a false "no camera" report.
- **Actual Behavior**: A single `facingMode: 'environment'` request was issued; unsupported constraints and secure-context problems produced generic/incorrect messages.
- **Resolution**: `frontend/src/pages/LiveDetectionPage.tsx` now (1) checks `window.isSecureContext`, (2) retries once without `facingMode` on `OverconstrainedError`/`NotFoundError`, (3) maps error names to distinct messages (permission / no device / in use / constraints), and (4) enumerates `videoinput` devices after success to display the active input. Camera state remains fully independent from the model-service state.

### BUG-009: Fabricated Traffic-Sign Results Remained in Dashboard, VisionCanvas and Seed Events
- **Component**: Frontend / Data Honesty
- **Severity**: High
- **Steps to Reproduce**: Load the Dashboard before any detection (or with the backend offline) and inspect "CURRENT OBSERVATION"; or open the event timeline in a fresh session.
- **Expected Behavior**: No traffic-sign result is displayed unless the model produced it.
- **Actual Behavior**: `DashboardPage.tsx` fell back to `{ class_name: 'Speed limit (50km/h)', confidence: 0.98 }` and rendered an extra `|| 0.96` confidence fallback; `VisionCanvas.tsx` used a `: 95` confidence fallback; `App.tsx` seeded a safety event titled `SPEED LIMIT 50 KM/H DETECTED` claiming `GTSRB Classifier verified 50 km/h zone ahead`.
- **Resolution**: All three fallbacks removed. The dashboard now renders `AWAITING DETECTION` / `NO SIGN DETECTED` until real detections arrive; the canvas omits the confidence tag when the value is missing; the seeded event is now an honest `VISION PIPELINE READY` info entry.

### BUG-010: `.env.example` Documented Variables That `Settings` Never Read
- **Component**: Backend / Configuration
- **Severity**: Low
- **Steps to Reproduce**: Copy `.env.example` to `.env` and start the backend: `BACKEND_HOST`, `BACKEND_PORT`, `TRAFFIC_SIGN_MODEL_PATH`, `DETECTION_CONFIDENCE_THRESHOLD` had no effect.
- **Expected Behavior**: Every documented variable maps to a real setting.
- **Actual Behavior**: `backend/config.py` reads `HOST`, `PORT`, `MODEL_WEIGHTS_PATH`, `DEFAULT_CONFIDENCE_THRESHOLD`, ... and the documented model path pointed at a non-existent file name (`traffic_sign_detector.pt`).
- **Resolution**: `.env.example` rewritten to match the `Settings` fields exactly, and relative model/dataset/cascade paths are now resolved against the repository root (`settings.model_weights_abspath` etc.) so the backend can be started from any working directory.

---

## Bug Report Protocol
When logging a bug, include:
1. **Bug ID**: `BUG-XXX`
2. **Component**: `Frontend` | `Backend` | `ML` | `Context`
3. **Severity**: `Low` | `Medium` | `High` | `Blocker`
4. **Steps to Reproduce**: Minimal steps
5. **Expected Behavior**: What should happen
6. **Actual Behavior**: What actually happened
7. **Resolution**: Solution notes and commit hash / test link
