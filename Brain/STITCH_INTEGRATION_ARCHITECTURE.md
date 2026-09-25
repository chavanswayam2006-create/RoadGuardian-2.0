# Stitch AI UI/UX Integration Architecture Map
**Project**: RoadGuard AI 2.0 (formerly RoadGuardian 2.0)
**Role**: Senior UI/UX & Frontend Integration Architect
**Date**: September 25, 2026

---

## 1. Executive Summary

This architecture integrates the approved Stitch AI UI/UX package into the existing working RoadGuard AI system. It preserves 100% of working backend endpoints, PyTorch GTSRB neural models, Haar Cascade DMS calculations, Leaflet mapping, and Web Speech synthesis, wrapping them in the cockpit-grade Stitch design system.

---

## 2. Source of Truth Reconciliation

| Component | Existing Functional Implementation | Stitch UI/UX Reference | Integrated Architecture |
| :--- | :--- | :--- | :--- |
| **Theme / Design Tokens** | Custom dark cyan palette in `index.css` | Stitch `DESIGN.md` (Obsidian, Electric Blue, Cyber Purple, Emerald Green, JetBrains Mono, Space Grotesk, Inter) | Full Stitch color palette + typography classes mapped via Tailwind + CSS variables |
| **Application Shell** | Single-page top header + split grid | Persistent Left Sidebar (w-72) + Fixed Top Header (h-16) + Main Content | `AppShell` component with responsive drawer, brand SVG logo, telematics status bar, and active route switching |
| **Routing** | Single page dashboard | Multi-route navigation suite | Tab/Hash/State-based route controller supporting `/dashboard`, `/detection`, `/driver-monitoring`, `/map`, `/history`, `/analytics`, `/system`, `/settings`, `/help` |
| **Vision Optical Feed** | `VisionCanvas.tsx` with procedural road or webcam + SVG overlay | `live_ai_vision_detection/code.html` with HUD metadata, cyan/amber/red bounding boxes, REC ticker, filter controls | Stitch 70/30 dual-pane HUD layout connecting to existing `VisionCanvas` frame capture and `/detect` API |
| **Driver Monitoring** | `DriverGauge.tsx` with EAR, gaze crosshair, head pose | `driver_awareness_monitoring/code.html` with IR cabin stream, landmark mesh, gaze vector, simulation switcher | Stitch IR cabin viewport + SVG facial mesh overlays + EAR gauge + alert history connected to `/driver-status` |
| **Road Map & Context** | `ContextMap.tsx` with Leaflet Munich center + garages | `road_map_and_context/code.html` with vector tactical grid, waypoint tags, garage cards | Leaflet dark-styled map with Stitch UI headers, GPS lock pill, simulation mode badges, and garage list |
| **Telemetry History** | `EventTicker.tsx` (scrollable vertical log) | `detection_history_telemetry_audit/code.html` (KPI bento + search/filter + table + export/print/flush) | Full telemetry audit log with live event filtering, CSV export, print, and buffer management |
| **Safety Analytics** | None (only in telemetry values) | `safety_analytics_system_perception_telematics/code.html` (6 KPI ribbons, confusion breakdown, latency distribution, fatigue trends) | Dedicated analytics page calculating real statistics from live detection/DMS history and model metrics |
| **System Status** | Header chips only | `system-status` screen with DSP/RAM/Temp/NVMe cards and service health | Comprehensive subsystem health and hardware vital monitor |
| **Settings & Help** | None | Cockpit settings deck + ISO 26262 safety protocol guide | Interactive configuration for camera, detection, DMS thresholds, TTS voice synthesis, and safety disclaimer |

---

## 3. Component Hierarchy

```
App
└── AppShell (Sidebar + TopStatusBar + Responsive Drawer)
    ├── /dashboard: SafetyDashboardOverview
    │   ├── TelematicsPulseHeader
    │   ├── RadialSpeedometerCard (with detected limit & margin)
    │   ├── CommandShortcutsTower
    │   ├── AwarenessBentoGrid (Signal, DMS, Front-Cam, Road-Context)
    │   ├── RecentPerceptionStream
    │   ├── HardwareVitalSnapshot
    │   └── AutomotiveLegalNotice
    ├── /detection: LiveVisionDetectionPage
    │   ├── HudStatusStrip (REC timer, IMX415, NPU load, FPS)
    │   ├── DualPaneWorkspace
    │   │   ├── VisionCanvasHUD (interactive camera / synthetic canvas with Stitch vector overlays)
    │   │   └── DetectionControlDeck (thresholds, filter modes, live detection list)
    ├── /driver-monitoring: DriverMonitoringPage
    │   ├── DriverStatusHeader (simulation switches: Safe, Distracted, Drowsy, No Face)
    │   ├── IRCabinFeedWithLandmarks (SVG mesh, gaze vector, FOV lock)
    │   └── DMSTelemetryMetrics (EAR gauge, blink rate, pitch/yaw, fatigue risk index)
    ├── /map: RoadMapContextPage
    │   ├── GNSSStatusBar (RTK lock, sector, waypoints)
    │   ├── TacticalMapContainer (Leaflet with custom dark tiles & route overlay)
    │   └── NearbyGaragesTriageList (verified service stations, distances, phone, ratings)
    ├── /history: TelemetryAuditPage
    │   ├── KPIBentoRibbon (Total Events, Mean Conf, Spoken Alerts, Flags, Verified)
    │   ├── AuditFilterToolbar (Search, category filter, export CSV, print, flush)
    │   └── EventAuditTable (sortable, paginated, status badges)
    ├── /analytics: SafetyAnalyticsPage
    │   ├── TimeframeSelector & Export
    │   ├── TopTelemetryRibbon (6 live KPIs)
    │   ├── PerceptionAccuracyCard
    │   ├── LatencyDistributionCard
    │   └── DriverFatigueTrendCard
    ├── /system: SystemStatusPage
    │   ├── SubsystemGrid (Vision, DMS, Alert Engine, FastAPI, GPS, TTS)
    │   └── HardwareTelemetry (DSP, Core Temp, RAM, NVMe)
    ├── /settings: SettingsPage
    │   └── ConfigSections (Camera, Vision AI, DMS, Voice, Map, Appearance, Privacy)
    └── /help: HelpSafetyPage
        └── QuickStart, Keybindings, Emergency Procedures, ISO 26262 Protocol
```

---

## 4. API & Data Flow Guarantee

- All backend endpoints remain intact:
  - `GET /health` & `GET /api/v1/health`
  - `POST /detect` & `POST /api/v1/vision/detect-frame`
  - `POST /driver-status` & `POST /api/v1/driver/analyze`
  - `GET /road-context` & `GET /api/v1/context/road-info`
  - `GET /garages` & `GET /api/v1/context/garages`
  - `GET /events` & `GET /api/v1/telemetry/incidents`
- Speech alert synthesis (`useSpeechAlerts`) remains globally bound to critical alerts.
- Error boundary protects every route from catastrophic rendering failures.
