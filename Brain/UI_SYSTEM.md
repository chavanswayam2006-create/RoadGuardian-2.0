# UI System Specification: RoadGuardian 2.0
*Designed with UI/UX Pro Max Intelligence for Automotive & Mobility Safety Platforms*

## 1. Design Persona & Aesthetic
- **Archetype**: Tactical Driver Assistance & Safety Cockpit (HUD).
- **Core Intent**: High-contrast, glanceable telemetry optimized for driving safety and rapid threat recognition. Never looks like a generic SaaS analytics dashboard.
- **Mood**: Precise, reassuring, hyper-focused, modern automotive interface.

---

## 2. Color Palette & Semantic Tokens

```css
:root {
  /* Canvas & Foundations */
  --bg-cockpit-base:     #080C14;  /* Deep Obsidian Abyss */
  --bg-cockpit-surface:  #0F172A;  /* Dark Slate HUD Panel */
  --bg-cockpit-elevated: #1E293B;  /* Highlight Surface */
  --border-subtle:       #334155;  /* Panel Framing */

  /* Semantic Alerts */
  --alert-critical:      #EF4444;  /* Crimson Warning (Drowsiness, Red Light) */
  --alert-warning:       #F59E0B;  /* Amber Alert (Overspeed, Attention Drift) */
  --alert-info:          #3B82F6;  /* Sapphire Advisory (Speed Limit, Construction) */
  --alert-success:       #10B981;  /* Emerald Active / Safe Status */

  /* Telemetry Accents */
  --accent-cyan:         #06B6D4;  /* Reticle / Target Vector / Speedometer */
  --accent-purple:       #8B5CF6;  /* Geo-boundary / Route line */

  /* Typography */
  --text-primary:        #F8FAFC;  /* Crisp High Contrast White */
  --text-secondary:      #94A3B8;  /* Muted Slate Label */
  --text-dim:            #64748B;  /* Secondary Telemetry Details */
}
```

---

## 3. Typography Hierarchy
- **Primary Display & Headings**: `Outfit` or `Inter` (sans-serif, bold, geometric clarity).
- **Telemetry Readouts & Numbers**: `JetBrains Mono` or `Roboto Mono` (monospace, tab-aligned, rapid numerical readability).
- **Minimum Contrast**: 5.5:1 on all dashboard panels for instant visibility under simulated in-vehicle lighting conditions.

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
