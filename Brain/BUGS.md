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
