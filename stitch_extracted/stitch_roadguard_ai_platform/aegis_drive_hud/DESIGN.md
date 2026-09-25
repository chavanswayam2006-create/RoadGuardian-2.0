---
name: Aegis Drive HUD
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  telemetry-display:
    fontFamily: JetBrains Mono
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  telemetry-unit:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers a mission-critical, cockpit-grade digital interface engineered for high-performance automotive intelligence and real-time driver telemetry. The visual language merges cutting-edge aerospace head-up display (HUD) discipline with premium consumer electronic refinement. 

Targeting demanding drivers, fleet telematics operators, and autonomous vehicle safety supervisors, the interface evokes calm control, surgical precision, and unshakeable trust. Every pixel serves cognitive speed—zero visual noise, high legibility under varying light environments, and immediate triage of risk. 

The aesthetic is grounded in **Technical Dark Minimalism with Cockpit Glassmorphism**:
- Deep void backdrops eliminating ambient distraction during night drives.
- Translucent, frosted carbon cards with micro-hairline edge highlights simulating anti-reflective coated optical glass.
- High-contrast visual hierarchies where color is strictly semantic, reserved for safety vectors, AI vision tracking, and live road perception.

## Colors

The color architecture is built around immediate perceptual classification. Chromatic accents are restricted to operational significance, preventing cognitive overload during high-velocity scenarios.

### Surface Tones & Foundation
- **Canvas Base:** `#0a0d14` — Deep, non-reflective obsidian foundation.
- **Card / Surface Layer:** `#121824` — Cool low-luminance slate creating physical structure.
- **Border / Edge Shimmer:** `#1b2438` — Subdued structural boundaries; interactive elements deploy `rgba(59, 130, 246, 0.35)` to signify focus.
- **Surface Elevation High:** `rgba(18, 24, 36, 0.72)` with 16px backdrop blur for floating HUD overlays.

### Semantic Telemetry Tones
- **Electric Blue (`#3b82f6`) [Primary]:** Primary AI perception state, lane projection vectors, and primary system engagement.
- **Cyber Purple (`#8b5cf6`) [Secondary]:** Object classification bounds, predictive spatial trajectories, and neural model status.
- **Emerald Green (`#10b981`) [Tertiary / Safety]:** Driver attentive status, green signal clearance, nominal sensor array, and active autopilot lock.
- **Amber Warning (`#f59e0b`):** Proximity cautions, yellow traffic phases, braking distance advisories, and driver fatigue notices.
- **Critical Red (`#ef4444`):** Imminent collision vector, red light violations, emergency disengagement, and severe driver inattention alerts.
- **Slate Gray (`#94a3b8`) [Neutral]:** Secondary metric labels, inactive tracking states, units of measurement, and structural dividers.

## Typography

The typographic system utilizes a disciplined tri-font pairing to address three distinct cognitive tasks: structural orientation, rapid contextual reading, and numeric telemetry scanning.

- **Headlines (`Space Grotesk`):** Modern, sharp, and automotive-futuristic without devolving into novelty. Used for screen titling, alert headers, and primary module banners.
- **Body & Controls (`Inter`):** Clean, universally legible grotesque with exceptional horizontal economy and neutral geometry. Used for alert narratives, instructions, tooltips, and standard controls.
- **Telemetry & Readouts (`JetBrains Mono`):** Fixed-width tabular clarity for zero-jitter numeric rendering. Essential for live metrics: speedometers, real-time FPS, neural inference latencies (ms), LiDAR distance measurements, and hardware timestamps. Always pairs uppercase unit tracking.

## Layout & Spacing

The layout philosophy mirrors real-time mission control dashboards, utilizing a fluid multi-pane viewport model with rigid boundary anchors.

- **Grid Discipline:** 12-column adaptive fluid grid for desktop and wide-aspect infotainment screens (landscape 16:9 / 21:9), collapsing to an 8-column layout on medium horizontal displays, and a 4-column stack on vertical mobile viewports.
- **Cockpit Anchor Zones:** Core driver critical metrics (speed, safety envelope) are anchored in prime focal zones (center/left clusters). Contextual menus and system telemetry inhabit peripheral side rails.
- **Density & Touch Targets:** Desktop instrumentation utilizes compact micro-spacing (`space-xs` and `space-sm`), whereas driver interaction elements on touch panels enforce minimum touch bounds of 48px with `space-md` separation to prevent driver distraction and mis-taps.

## Elevation & Depth

Visual hierarchy uses physical layering, selective light transmission, and laser-precise edge reflections rather than heavy drop shadows.

- **Ground Zero (Base Layer):** Pitch matte `#0a0d14` simulating an unlit OLED panel.
- **Level 1 (Subsystem Modules & Panels):** Solid `#121824` with a crisp `1px solid #1b2438` structural outline.
- **Level 2 (Active HUD Cards & Vision Feeds):** Translucent `rgba(18, 24, 36, 0.78)` backed by `16px` backdrop blur (`backdrop-filter: blur(16px)`). Edges feature a directional 1px gradient hairline border (`linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(27, 36, 56, 0.6) 100%)`).
- **Level 3 (Alert Modals & Emergency Overlays):** Floating glass layer with an internal glow tuned to the alert's semantic severity:
  - Critical warning: `0 0 32px rgba(239, 68, 68, 0.25)`, border: `rgba(239, 68, 68, 0.6)`.
  - Attention warning: `0 0 24px rgba(245, 158, 11, 0.2)`, border: `rgba(245, 158, 11, 0.5)`.
  - AI Lock: `0 0 24px rgba(59, 130, 246, 0.2)`, border: `rgba(59, 130, 246, 0.5)`.

## Shapes

The design system relies on a controlled, technical **Soft** radius scale (`roundedness: 1`). Soft beveling maintains an instrument-grade aesthetic, rejecting overly playful or organic bubble aesthetics.

- **Base Radius (`0.25rem` / `4px`):** Used for micro-badges, mono tags, metric counters, tooltips, and checkboxes.
- **Container Radius (`0.5rem` / `8px`):** Standard radius for telemetry cards, inputs, HUD frames, and video feed containers.
- **Panel & Modal Radius (`0.75rem` / `12px`):** Large cockpit overlays, full-screen HUD panes, and notification center drawers.
- **Pill Exception (`9999px`):** Strictly reserved for dynamic status indicator pills and pulse tags (e.g., `● AI ACTIVE`, `● 120 FPS NOMINAL`).

## Components

### Buttons & Interactive Controls
- **Primary Telematics Action:** High-intensity electric blue fill (`#3b82f6`) with white bold text, transitioning to `#2563eb` on hover. Active states trigger an internal shadow.
- **Sub-action & Ghost Buttons:** Transparent fill, `1px solid #1b2438` border, text `#94a3b8`. Hover transitions border to `#3b82f6` and text to `#ffffff`.
- **Destructive / E-Stop Actions:** Solid crimson (`#ef4444`) with immediate tactile haptic feedback indicators.

### Telemetry Cards & Vision HUD Containers
- Outer container constructed of `#121824` with glass blur.
- Top-right corner dedicated to monospaced system state or real-time latency ticks (`< 14ms`).
- Integrated 1px micro-dividers (`#1b2438`) separating data columns.

### Status Pills & Pulsing Indicators
- Compact height (24px), fully rounded pill silhouette.
- Dark semi-translucent fill tint matched to the state color (e.g., `rgba(16, 185, 129, 0.12)` for safe status).
- Contains an 8px circular dot featuring an animated ping keyframe (`ring-opacity` pulses at 1.5s intervals) indicating continuous live polling.

### Input Fields & Selectors
- Background: `#0a0d14` inset within `#121824` card.
- Inactive border: `1px solid #1b2438`; Focus border: `1px solid #3b82f6` accompanied by a `0 0 8px rgba(59, 130, 246, 0.25)` ambient ring.
- Labels displayed in uppercase `JetBrains Mono` at 11px above field.

### Checkboxes & Segmented Radios
- Crisp squared corners (`4px` radius).
- Checked states display a vibrant fill with high-contrast glyphs (`#ffffff` checkmark on `#3b82f6` or `#10b981`).

### Specialized Telematics Components
- **Object Detection Bounding Boxes:** 1.5px neon vector lines in Cyber Purple (`#8b5cf6`) with translucent corner brackets and top-left target metadata flags.
- **Speed & Vector Gauges:** Radial and linear progress bars using multi-stop gradients terminating in the active driving state color.