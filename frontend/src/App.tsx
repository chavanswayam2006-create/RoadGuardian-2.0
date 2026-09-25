import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { useSpeechAlerts } from './hooks/useSpeechAlerts';
import { AppShell } from './components/AppShell';
import type { NavRoute } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { LiveDetectionPage } from './pages/LiveDetectionPage';
import { DriverMonitoringPage } from './pages/DriverMonitoringPage';
import { RoadMapPage } from './pages/RoadMapPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpSafetyPage } from './pages/HelpSafetyPage';
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
  // Routing state with hash sync
  const getInitialRoute = (): NavRoute => {
    const hash = window.location.hash.replace('#', '') as NavRoute;
    const validRoutes: NavRoute[] = [
      'dashboard',
      'detection',
      'driver-monitoring',
      'map',
      'history',
      'analytics',
      'system',
      'settings',
      'help',
    ];
    return validRoutes.includes(hash) ? hash : 'dashboard';
  };

  const [currentRoute, setCurrentRoute] = useState<NavRoute>(getInitialRoute);

  const handleRouteChange = (route: NavRoute) => {
    setCurrentRoute(route);
    window.location.hash = route;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavRoute;
      const validRoutes: NavRoute[] = [
        'dashboard',
        'detection',
        'driver-monitoring',
        'map',
        'history',
        'analytics',
        'system',
        'settings',
        'help',
      ];
      if (validRoutes.includes(hash)) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Core system states
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [mode, setMode] = useState<'simulated' | 'webcam' | 'sample'>('simulated');
  const [fps, setFps] = useState<number>(60);

  // Speedometer & Speed Limit
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(48);
  const [speedLimitKmh, setSpeedLimitKmh] = useState<number>(50);

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
      confidence: 0.98,
      bbox: [480, 140, 560, 220],
      speed_limit_kmh: 50,
    },
  ]);
  const [inferenceTimeMs, setInferenceTimeMs] = useState<number>(14.2);

  // Driver monitor state
  const [driverStatus, setDriverStatus] = useState<DriverStatus>({
    timestamp: new Date().toISOString(),
    state: 'ATTENTIVE',
    confidence: 0.98,
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
    road_name: 'Leopoldstraße / A99 Corridor',
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
  const [events, setEvents] = useState<SafetyEvent[]>(() => [
    {
      id: 'ev-init-1',
      timestamp: new Date(Date.now() - 12000).toISOString(),
      category: 'INFO',
      title: 'SYSTEM INITIALIZED',
      message: 'RoadGuard AI 2.0 dual vision and DMS engines online.',
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
  const checkConnection = useCallback(async () => {
    try {
      const h = await api.getHealth();
      setHealth(h);
      setIsBackendConnected(true);

      // Also fetch road context and garages from backend
      try {
        const rc = await api.getRoadContext();
        setRoadContext(rc);
        const g = await api.getGarages();
        if (g.garages?.length > 0) setGarages(g.garages);
      } catch {
        // keep fallback
      }
    } catch {
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [checkConnection]);

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

  // Simulated manual driver state changes (for testing / demonstration)
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
      confidence: 0.98,
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

  // Render current route view
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'dashboard':
        return (
          <DashboardPage
            currentSpeedKmh={currentSpeedKmh}
            speedLimitKmh={speedLimitKmh}
            onSpeedChange={setCurrentSpeedKmh}
            onSpeedLimitChange={setSpeedLimitKmh}
            detections={detections}
            inferenceTimeMs={inferenceTimeMs}
            driverStatus={driverStatus}
            roadContext={roadContext}
            garages={garages}
            events={events}
            onNavigate={handleRouteChange}
            isBackendConnected={isBackendConnected}
          />
        );
      case 'detection':
        return (
          <LiveDetectionPage
            mode={mode}
            onModeChange={setMode}
            detections={detections}
            inferenceTimeMs={inferenceTimeMs}
            onFrameCaptured={handleFrameCaptured}
            speedLimitKmh={speedLimitKmh}
            fps={fps}
            isBackendConnected={isBackendConnected}
          />
        );
      case 'driver-monitoring':
        return (
          <DriverMonitoringPage
            driverStatus={driverStatus}
            onSimulateState={handleSimulateDriverState}
            events={events}
          />
        );
      case 'map':
        return (
          <RoadMapPage
            roadContext={roadContext}
            garages={garages}
            speedLimitKmh={speedLimitKmh}
          />
        );
      case 'history':
        return (
          <HistoryPage
            events={events}
            onClearEvents={() => setEvents([])}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPage
            events={events}
            inferenceTimeMs={inferenceTimeMs}
          />
        );
      case 'system':
        return (
          <SystemStatusPage
            isBackendConnected={isBackendConnected}
            health={health}
            inferenceTimeMs={inferenceTimeMs}
            fps={fps}
            onRefreshHealth={checkConnection}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            isMuted={isMuted}
            onToggleMute={toggleMute}
            mode={mode}
            onModeChange={setMode}
            speedLimitKmh={speedLimitKmh}
            onSpeedLimitChange={setSpeedLimitKmh}
          />
        );
      case 'help':
        return <HelpSafetyPage />;
      default:
        return (
          <DashboardPage
            currentSpeedKmh={currentSpeedKmh}
            speedLimitKmh={speedLimitKmh}
            onSpeedChange={setCurrentSpeedKmh}
            onSpeedLimitChange={setSpeedLimitKmh}
            detections={detections}
            inferenceTimeMs={inferenceTimeMs}
            driverStatus={driverStatus}
            roadContext={roadContext}
            garages={garages}
            events={events}
            onNavigate={handleRouteChange}
            isBackendConnected={isBackendConnected}
          />
        );
    }
  };

  return (
    <AppShell
      currentRoute={currentRoute}
      onRouteChange={handleRouteChange}
      currentSpeedKmh={currentSpeedKmh}
      speedLimitKmh={speedLimitKmh}
      driverState={driverStatus.state}
      isBackendConnected={isBackendConnected}
      health={health}
      inferenceTimeMs={inferenceTimeMs}
      isMuted={isMuted}
      onToggleMute={toggleMute}
      isSpeaking={isSpeaking}
      activeAlert={activeAlert}
      onDismissAlert={() => setActiveAlert(null)}
      events={events}
      onClearEvents={() => setEvents([])}
      roadContext={roadContext}
      fps={fps}
    >
      {renderCurrentPage()}
    </AppShell>
  );
};

export default App;
