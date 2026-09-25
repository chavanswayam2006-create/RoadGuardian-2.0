import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { useSpeechAlerts } from './hooks/useSpeechAlerts';
import { CockpitHeader } from './components/CockpitHeader';
import { AlertBanner } from './components/AlertBanner';
import { VisionCanvas } from './components/VisionCanvas';
import { DriverGauge } from './components/DriverGauge';
import { ContextMap } from './components/ContextMap';
import { EventTicker } from './components/EventTicker';
import { ErrorBoundary } from './components/ErrorBoundary';
import type {
  Detection,
  DriverStatus,
  DriverState,
  RoadContext,
  Garage,
  SafetyEvent,
  SystemHealth,
  AlertCategory,
} from './types';

export const App: React.FC = () => {
  // Core system states
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [mode, setMode] = useState<'simulated' | 'webcam' | 'sample'>('simulated');
  const [fps, setFps] = useState<number>(60);

  // Speedometer & Speed Limit
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(54);
  const [speedLimitKmh, setSpeedLimitKmh] = useState<number>(50);
  const isOverspeed = currentSpeedKmh > speedLimitKmh;

  // Active Critical/Warning Alert Banner
  const [activeAlert, setActiveAlert] = useState<{
    category: AlertCategory;
    title: string;
    message: string;
    action_required?: string;
  } | null>(null);

  // Vision pipeline state
  const [detections, setDetections] = useState<Detection[]>([
    {
      class_id: 2,
      class_name: 'Speed limit (50km/h)',
      category: 'Speed Limit',
      confidence: 0.94,
      bbox: [480, 140, 560, 220],
      speed_limit_kmh: 50,
    },
  ]);
  const [inferenceTimeMs, setInferenceTimeMs] = useState<number>(14.2);

  // Driver monitor state
  const [driverStatus, setDriverStatus] = useState<DriverStatus>({
    timestamp: new Date().toISOString(),
    state: 'ATTENTIVE',
    confidence: 0.96,
    ear_average: 0.32,
    ear_left: 0.32,
    ear_right: 0.33,
    eyes_closed: false,
    gaze_direction: 'forward',
    head_pose: { pitch: 1.2, yaw: -0.8, roll: 0.5 },
    alert_required: false,
    alert_message: null,
  });

  // Geospatial & context
  const [roadContext, setRoadContext] = useState<RoadContext | null>({
    lat: 48.137154,
    lon: 11.576124,
    road_name: 'Leopoldstraße / A99 Autobahn',
    road_type: 'PRIMARY',
    active_speed_limit_kmh: 50,
    recommended_speed_kmh: 50,
    construction_warning: false,
    weather_condition: 'CLEAR',
    data_source: 'DEMO_DATA',
  });

  const [garages, setGarages] = useState<Garage[]>([
    {
      id: 'g-101',
      name: 'AutoService Schwabing Nord',
      distance_meters: 650,
      rating: 4.8,
      open_now: true,
      services: ['Tire Repair', 'Engine Diagnostics', 'Brake Systems'],
      phone: '+49 89 3214567',
      lat: 48.1395,
      lon: 11.579,
    },
    {
      id: 'g-102',
      name: 'Bosch Car Service Express',
      distance_meters: 1420,
      rating: 4.6,
      open_now: true,
      services: ['Full Inspection', 'Electrical Systems', 'ADAS Calibration'],
      phone: '+49 89 6549870',
      lat: 48.133,
      lon: 11.572,
    },
    {
      id: 'g-103',
      name: 'ADAC Mobility & Garage Hub',
      distance_meters: 2180,
      rating: 4.9,
      open_now: true,
      services: ['24/7 Roadside Assistance', 'Towing', 'Tire Replacement'],
      phone: '+49 89 767676',
      lat: 48.142,
      lon: 11.583,
    },
  ]);

  // Safety Events Timeline
  const [events, setEvents] = useState<SafetyEvent[]>([
    {
      id: 'ev-init-1',
      timestamp: new Date(Date.now() - 12000).toISOString(),
      category: 'INFO',
      title: 'SYSTEM INITIALIZED',
      message: 'RoadGuardian 2.0 dual vision and DMS engines online.',
      source: 'SYSTEM',
      spoken: false,
    },
    {
      id: 'ev-init-2',
      timestamp: new Date(Date.now() - 4000).toISOString(),
      category: 'ADVISORY',
      title: 'SPEED LIMIT 50 KM/H DETECTED',
      message: 'GTSRB Classifier verified 50 km/h zone ahead.',
      source: 'TRAFFIC_VISION',
      spoken: true,
    },
  ]);

  // Speech Alerts hook
  const { speak, isMuted, toggleMute, isSpeaking } = useSpeechAlerts({
    debounceSec: 5.0,
    rate: 1.05,
  });

  // Log safety event helper
  const addSafetyEvent = useCallback((event: Omit<SafetyEvent, 'id' | 'timestamp'>) => {
    const newEvent: SafetyEvent = {
      ...event,
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
  }, []);

  // Poll Health & Backend Connection
  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      try {
        const h = await api.getHealth();
        if (mounted) {
          setHealth(h);
          setIsBackendConnected(true);
        }

        // Also fetch road context and garages from backend
        try {
          const rc = await api.getRoadContext();
          if (mounted) setRoadContext(rc);
          const g = await api.getGarages();
          if (mounted && g.garages?.length > 0) setGarages(g.garages);
        } catch {
          // keep fallback
        }
      } catch {
        if (mounted) {
          setIsBackendConnected(false);
        }
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Measure dynamic rendering FPS
  useEffect(() => {
    let frame = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      frame++;
      if (now - lastTime >= 1000) {
        setFps(frame);
        frame = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Handle frame capture from VisionCanvas and send to backend
  const handleFrameCaptured = useCallback(async (base64Image: string) => {
    if (!isBackendConnected) return;

    try {
      const res = await api.detectFrame(base64Image, 0.40);
      if (res.success) {
        setInferenceTimeMs(res.inference_time_ms);
        if (res.detections.length > 0) {
          setDetections(res.detections);

          // Update speed limit if speed limit sign detected
          const speedSign = res.detections.find((d) => d.speed_limit_kmh);
          if (speedSign && speedSign.speed_limit_kmh) {
            setSpeedLimitKmh(speedSign.speed_limit_kmh);
          }

          // Handle server-issued active alerts
          if (res.active_alert) {
            setActiveAlert({
              category: res.active_alert.category,
              title: res.active_alert.title,
              message: res.active_alert.message,
              action_required: res.active_alert.action_required,
            });

            if (res.active_alert.speak_text) {
              const voiced = speak(res.active_alert.speak_text);
              addSafetyEvent({
                category: res.active_alert.category,
                title: res.active_alert.title,
                message: res.active_alert.message,
                source: 'TRAFFIC_VISION',
                spoken: voiced,
              });
            }
          }
        }
      }
    } catch {
      // Keep running smoothly even if an individual frame drops
    }
  }, [isBackendConnected, speak, addSafetyEvent]);

  // Overspeed alert evaluation
  useEffect(() => {
    if (currentSpeedKmh > speedLimitKmh + 5) {
      const msg = `Vehicle speed (${currentSpeedKmh.toFixed(0)} km/h) exceeds active limit (${speedLimitKmh} km/h).`;
      setActiveAlert({
        category: 'WARNING',
        title: 'OVERSPEED WARNING',
        message: msg,
        action_required: 'REDUCE VEHICLE SPEED',
      });
      const voiced = speak(`Warning: Speed limit exceeded. Current limit is ${speedLimitKmh} kilometers per hour.`);
      if (voiced) {
        addSafetyEvent({
          category: 'WARNING',
          title: 'OVERSPEED DETECTED',
          message: msg,
          source: 'ROAD_CONTEXT',
          spoken: true,
        });
      }
    } else if (activeAlert?.title === 'OVERSPEED WARNING') {
      setActiveAlert(null);
    }
  }, [currentSpeedKmh, speedLimitKmh, speak, addSafetyEvent, activeAlert?.title]);

  // Simulated manual driver state changes (for testing / hackathon demonstration)
  const handleSimulateDriverState = useCallback((simState: DriverState) => {
    let ear = 0.32;
    let eyesClosed = false;
    let gaze = 'forward';
    let pose = { pitch: 0.5, yaw: -1.0, roll: 0.2 };
    let alertMsg: string | null = null;

    if (simState === 'DROWSINESS_WARNING') {
      ear = 0.12;
      eyesClosed = true;
      gaze = 'downward';
      pose = { pitch: 18.5, yaw: 2.1, roll: 4.0 };
      alertMsg = 'Drowsiness detected! Persistent eye closure exceeding 1.5 seconds.';

      setActiveAlert({
        category: 'CRITICAL',
        title: 'CRITICAL: DROWSINESS DETECTED',
        message: 'Driver eye closure indicates micro-sleep. Auditory cue deployed.',
        action_required: 'IMMEDIATE DRIVER ALERT / PULL OVER',
      });

      const voiced = speak('Warning: Drowsiness detected. Please stay awake and focus on the road.', true);
      addSafetyEvent({
        category: 'CRITICAL',
        title: 'DROWSINESS ALERT TRIGGERED',
        message: 'Micro-sleep detected via low EAR (0.12). Voice alarm sounded.',
        source: 'DRIVER_MONITOR',
        spoken: voiced,
      });
    } else if (simState === 'ATTENTION_WARNING') {
      ear = 0.28;
      eyesClosed = false;
      gaze = 'distracted';
      pose = { pitch: -2.0, yaw: 34.2, roll: -1.5 };
      alertMsg = 'Attention drift: Driver looking away from road trajectory.';

      setActiveAlert({
        category: 'WARNING',
        title: 'ATTENTION DRIFT WARNING',
        message: 'Driver gaze deflected away from forward roadway for > 2 seconds.',
        action_required: 'REFOCUS ON FORWARD ROADWAY',
      });

      const voiced = speak('Attention warning. Please focus your eyes on the road.');
      addSafetyEvent({
        category: 'WARNING',
        title: 'ATTENTION DRIFT WARNING',
        message: 'Driver head yaw reached 34.2 degrees off center.',
        source: 'DRIVER_MONITOR',
        spoken: voiced,
      });
    } else if (simState === 'FACE_NOT_DETECTED') {
      ear = 0.0;
      eyesClosed = false;
      gaze = 'unknown';
      pose = { pitch: 0, yaw: 0, roll: 0 };
      alertMsg = 'Face occluded or driver not detected in cabin camera frame.';

      setActiveAlert({
        category: 'WARNING',
        title: 'DRIVER NOT DETECTED',
        message: 'Driver monitoring camera lost facial landmarks.',
        action_required: 'ADJUST CABIN CAMERA POSITION',
      });
    } else {
      // ATTENTIVE
      if (activeAlert?.category === 'CRITICAL' || activeAlert?.title.includes('ATTENTION')) {
        setActiveAlert(null);
      }
    }

    setDriverStatus({
      timestamp: new Date().toISOString(),
      state: simState,
      confidence: 0.95,
      ear_average: ear,
      ear_left: ear,
      ear_right: ear,
      eyes_closed: eyesClosed,
      gaze_direction: gaze,
      head_pose: pose,
      alert_required: simState !== 'ATTENTIVE',
      alert_message: alertMsg,
    });
  }, [speak, addSafetyEvent, activeAlert]);

  return (
    <div className="min-h-screen bg-cockpit-base text-slate-100 p-3 sm:p-5 flex flex-col font-sans">
      {/* Top Cockpit Header */}
      <CockpitHeader
        health={health}
        isBackendConnected={isBackendConnected}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isSpeaking={isSpeaking}
        mode={mode}
        onModeChange={setMode}
        currentSpeedKmh={currentSpeedKmh}
        speedLimitKmh={speedLimitKmh}
        isOverspeed={isOverspeed}
        fps={fps}
      />

      {/* Active Alert Banner */}
      <AlertBanner alert={activeAlert} onDismiss={() => setActiveAlert(null)} />

      {/* Main Tactical Grid Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Vision Optical Canvas (Primary HUD) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <ErrorBoundary fallbackTitle="OPTICAL FEED STANDBY">
            <VisionCanvas
              mode={mode}
              detections={detections}
              inferenceTimeMs={inferenceTimeMs}
              onFrameCaptured={handleFrameCaptured}
              speedLimitKmh={speedLimitKmh}
            />
          </ErrorBoundary>

          {/* Vehicle Simulation Controls */}
          <div className="hud-card p-3 bg-slate-900/80 border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold uppercase">SPEED BENCH:</span>
              <button
                onClick={() => setCurrentSpeedKmh((v) => Math.max(0, v - 5))}
                className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold"
                aria-label="Decrease vehicle speed by 5 km/h"
              >
                -5 KM/H
              </button>
              <button
                onClick={() => setCurrentSpeedKmh((v) => v + 5)}
                className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold"
                aria-label="Increase vehicle speed by 5 km/h"
              >
                +5 KM/H
              </button>
              <span className="text-slate-400">
                ACTIVE SPEED: <strong className="text-cyan-400">{currentSpeedKmh} KM/H</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">CHANGE SPEED LIMIT:</span>
              {[30, 50, 70, 100].map((limit) => (
                <button
                  key={limit}
                  onClick={() => setSpeedLimitKmh(limit)}
                  aria-label={`Set speed limit to ${limit} km/h`}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    speedLimitKmh === limit
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {limit}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Driver Gauge DMS + Context Map & Timeline */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* Driver Monitoring Subsystem (DMS) */}
          <DriverGauge
            driverStatus={driverStatus}
            onSimulateState={handleSimulateDriverState}
          />

          {/* Geospatial Road Context & Nearby Garages */}
          <div className="flex-1 min-h-[280px]">
            <ErrorBoundary fallbackTitle="ROAD MAP HUD STANDBY">
              <ContextMap
                roadContext={roadContext}
                garages={garages}
              />
            </ErrorBoundary>
          </div>

          {/* Chronological Safety Event Timeline */}
          <div className="h-[240px]">
            <EventTicker
              events={events}
              onClearEvents={() => setEvents([])}
            />
          </div>
        </section>
      </main>

      {/* Tactical Footer Bar */}
      <footer className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-3">
          <span>ROADGUARDIAN 2.0 ADVANCED MOBILITY HUD</span>
          <span>•</span>
          <span>FASTAPI + REACT + MEDIAPIPE + GTSRB RESNET-18</span>
        </div>
        <div className="flex items-center gap-2">
          <span>DATA PRIVACY: LOCAL DATASET ENFORCED</span>
          <span>•</span>
          <span className="text-cyan-400 font-bold">ALL SYSTEMS ARMED</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
