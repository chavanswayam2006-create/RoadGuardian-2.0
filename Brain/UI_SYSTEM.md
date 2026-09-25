# UI System Specification: RoadGuardian 2.0
*Designed with UI/UX Pro Max Intelligence for Automotive & Mobility Safety Platforms*

## 1. Design Persona & Aesthetic
- **Archetype**: Tactical Driver Assistance & Safety Cockpit (HUD).
- **Core Intent**: High-contrast, glanceable telemetry optimized for driving safety and rapid threat recognition. Never looks like a generic SaaS analytics dashboard.
- **Mood**: Precise, reassuring, hyper-focused, modern automotive interface.

---

## 2. Color Palette & Semantic Tokens (Session 004 Precision Cockpit)

```css
:root {
  /* Surface & Background Hierarchy */
  --bg:                #030B14;  /* Deep Night Black */
  --surface:           #071522;  /* Cockpit Module Surface */
  --surface-secondary: #0B1B2A;  /* Secondary Inset Surface */
  --surface-elevated:  #102335;  /* Hover / Elevated State */
  --surface-highest:   #162B3E;  /* Prominent Popovers / Drawers */

  /* Typography Colors */
  --text-primary:      #E6F0FA;  /* High-legibility technical white */
  --text-secondary:    #9BAEC0;  /* Sub-readout label color */
  --text-muted:        #66798B;  /* Timestamp / telemetry caption */

  /* Technical Accents */
  --accent:            #8DB8FF;  /* Cold Blue Precision Reticle */
  --accent-strong:     #4D8EFF;  /* Primary Interactive Action */
  --accent-subtle:     rgba(141, 184, 255, 0.12);

  /* Status Colors */
  --success:           #35D69A;  /* Emerald Nominal / Active */
  --success-subtle:    rgba(53, 214, 154, 0.12);
  --warning:           #F5B942;  /* Amber Caution / Cautionary Sign */
  --warning-subtle:    rgba(245, 185, 66, 0.14);
  --critical:          #FF5C67;  /* High-consequence Red / Drowsiness */
  --critical-subtle:   rgba(255, 92, 103, 0.16);

  /* Precision Borders */
  --border:            rgba(150, 180, 210, 0.14);
  --border-subtle:     rgba(150, 180, 210, 0.08);
  --border-strong:     rgba(141, 184, 255, 0.32);
}
```

---

## 3. Typography Hierarchy
- **Headlines & Primary Titles**: `Space Grotesk` (500, 600, 700 weight, technical automotive feel).
- **Body & Subtitles**: `Inter` (300, 400, 500, 600 weight, ultra-clean geometric neutrality).
- **Telemetry Readouts & Units**: `JetBrains Mono` (tabular numbers, uppercase acronyms, status badges).
- **Minimum Contrast**: 7:1 for critical text and badges, meeting ISO 15008 in-vehicle display ergonomics.


---

## 4. Key UI Subsystems & Components

### 4.1 Vision Feed HUD (`VisionCanvas`)
- Dual-stream or picture-in-picture view: Forward Road Camera with HUD reticles + In-Cabin Driver Camera thumbnail.
- Dynamic bounding box rendering with real-time confidence tag and category chip.
- Center-aligned speed limit badge overlay.

### 4.2 Driver State Telemetry (`DriverGauge`)
- **Eye Aspect Ratio (EAR) Gauge**: Visual dial/bar showing live EAR value vs threshold (0.25).
- **Head Attention Target**: 2D coordinate crosshair depicting current driver gaze vector.
- **Drowsiness Warning Banner**: Pulsing crimson banner with audio waveform indicator when alert triggers.

### 4.3 Road Context & Navigation Panel (`ContextMap`)
- Clean dark-themed Leaflet map.
- Vehicle position reticle moving smoothly.
- Nearby garages pinned with wrench icons, distance badges, and one-click contact/navigate info.

### 4.4 Safety Event Timeline (`EventTicker`)
- Live event stream logging all alerts with timestamps, confidence scores, and dismiss/mute controls.
- Speech synthesis visual toggle (Mute / Unmute voice alerts).

---

## 5. UI/UX Production Audit & Verification Report

### 5.1 Evaluated Dimensions
1. **Visual Hierarchy**: Tactical dark theme prioritizing immediate safety hazards (Crimson AlertBanner and EAR Warning) over ambient navigation markers.
2. **Readability**: JetBrains Mono for all high-speed telemetry (speed, EAR, coordinates, latency) with white-on-dark contrast exceeding 7:1.
3. **Alert Visibility**: Multi-sensory feedback combining color-coded pulsing visual cards with client-side Web SpeechSynthesis voice debounced to 5.0 seconds.
4. **Map Usability**: Leaflet dark tile rendering with auto-adjusting bounds, animated vehicle trajectory, and garage markers.
5. **Detection Readability**: Dynamic SVG vector overlays with reticle corner markers, category chips, and confidence percentage.
6. **Driver Monitoring Visibility**: Direct dual gauge: 0.20-calibrated EAR progress bar + 2D gaze reticle with pitch/yaw angles.
7. **Responsive Behavior**: Mobile-adaptive layout transitioning from single-column on viewport < 1024px to a balanced 7:5 dual-cockpit on desktop.
8. **Accessibility & Safety**: Explicit `aria-label` tags for controls; contrast-tested semantic colors.
9. **Resilience & Error Boundaries**: Independent `<ErrorBoundary>` wraps around Leaflet Map and Optical Canvas, guaranteeing that third-party script faults never bring down the primary cockpit dashboard.

### 5.2 Audit Outcomes
- **FIXED**:
  - ContextMap Leaflet marker crash on backend coordinate payload format (`BUG-001`).
  - Optical canvas bounding box destructuring crash on live detection stream (`BUG-002`).
  - Driver monitor missing qualitative gaze direction and unguarded pose angles (`BUG-003`).
  - Subsystem resilience via tactical ErrorBoundary fallback wrappers.
- **NOT FIXED**:
  - Real hardware multi-monitor HUD projection (outside 3-day hackathon MVP scope).
- **DESIGN RISKS**:
  - High ambient sunlight in physical vehicles requires dynamic day/night theme toggle (future feature).
- **RECOMMENDATIONS**:
  - Add optional high-contrast Day Mode palette for bright daylight road conditions.
  - Implement WebGL/Three.js 3D car model for advanced cockpit aesthetics in post-hackathon phase.

