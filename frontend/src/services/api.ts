import type { Detection, DetectResponse, DriverStatus, RoadContext, Garage, SafetyEvent, SystemHealth } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${this.baseUrl}/health`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return res.json();
  }

  async detectFrame(imageBase64: string, confidenceThreshold: number = 0.45, frameId: number = 1): Promise<DetectResponse> {
    const res = await fetch(`${this.baseUrl}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        image_base64: imageBase64,
        confidence_threshold: confidenceThreshold,
        frame_id: frameId,
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Detection failed' }));
      throw new Error(err.detail || `Detection error ${res.status}`);
    }
    const data = await res.json();
    const rawDetections = Array.isArray(data.detections) ? data.detections : [];
    const normalizedDetections: Detection[] = rawDetections.map((d: any) => {
      let bbox: [number, number, number, number] = [0, 0, 0, 0];
      if (Array.isArray(d.bbox) && d.bbox.length === 4) {
        bbox = d.bbox;
      } else if (d.bounding_box) {
        bbox = [
          Math.round((d.bounding_box.x_min ?? 0) * 640),
          Math.round((d.bounding_box.y_min ?? 0) * 380),
          Math.round((d.bounding_box.x_max ?? 1) * 640),
          Math.round((d.bounding_box.y_max ?? 1) * 380),
        ];
      }

      return {
        class_id: d.metadata?.class_id ?? d.class_id ?? 0,
        class_name: d.display_name || d.class_name || d.label || 'Traffic Object',
        category: d.category || 'TRAFFIC_SIGN',
        confidence: d.confidence ?? 0.5,
        bbox,
        is_red_light: d.label === 'SIGNAL_RED' || d.metadata?.signal_state === 'SIGNAL_RED',
        speed_limit_kmh: d.metadata?.speed_limit_kmh ?? d.speed_limit_kmh ?? null,
      };
    });

    return {
      ...data,
      detections: normalizedDetections,
    };
  }

  async getDriverStatus(imageBase64?: string): Promise<DriverStatus> {
    const res = await fetch(`${this.baseUrl}/driver-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        image_base64: imageBase64 || null,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      throw new Error(`Driver status error ${res.status}`);
    }
    const data = await res.json();
    const hp = data.head_pose || { pitch: 0, yaw: 0, roll: 0 };
    let gaze = 'FORWARD';
    if (hp.yaw < -12) gaze = 'LOOKING LEFT';
    else if (hp.yaw > 12) gaze = 'LOOKING RIGHT';
    else if (hp.pitch > 14) gaze = 'LOOKING DOWN';
    else if (hp.pitch < -14) gaze = 'LOOKING UP';

    return {
      timestamp: data.timestamp || new Date().toISOString(),
      state: data.state || 'ATTENTIVE',
      confidence: data.confidence ?? 0.90,
      ear_average: data.ear_average ?? 0.30,
      ear_left: data.ear_left ?? data.ear_average ?? 0.30,
      ear_right: data.ear_right ?? data.ear_average ?? 0.30,
      eyes_closed: Boolean(data.eyes_closed),
      gaze_direction: gaze,
      head_pose: {
        pitch: hp.pitch ?? 0,
        yaw: hp.yaw ?? 0,
        roll: hp.roll ?? 0,
      },
      alert_required: Boolean(data.alert_required),
      alert_message: data.reason || data.active_alert?.message || null,
    };
  }

  async getRoadContext(lat: number = 48.137154, lon: number = 11.576124): Promise<RoadContext> {
    const res = await fetch(`${this.baseUrl}/road-context?lat=${lat}&lon=${lon}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      throw new Error(`Road context error ${res.status}`);
    }
    const data = await res.json();
    return {
      lat: data.lat ?? data.coordinates?.latitude ?? lat,
      lon: data.lon ?? data.coordinates?.longitude ?? lon,
      road_name: data.road_name || 'Urban Way',
      road_type: data.road_type || 'PRIMARY',
      active_speed_limit_kmh: data.active_speed_limit_kmh ?? 50,
      recommended_speed_kmh: data.recommended_speed_kmh ?? 50,
      construction_warning: Boolean(data.construction_warning ?? data.construction_zone),
      weather_condition: data.weather_condition || 'CLEAR',
      data_source: data.data_source || 'DEMO_DATA',
    };
  }

  async getGarages(lat: number = 48.137154, lon: number = 11.576124, radius: number = 3000): Promise<{ count: number; garages: Garage[]; data_source: string }> {
    const res = await fetch(`${this.baseUrl}/garages?lat=${lat}&lon=${lon}&radius=${radius}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      throw new Error(`Garages error ${res.status}`);
    }
    const data = await res.json();
    const rawGarages = Array.isArray(data.garages) ? data.garages : [];
    const normalizedGarages: Garage[] = rawGarages.map((g: any) => ({
      id: g.id || `g-${Math.random()}`,
      name: g.name || 'Automotive Service',
      distance_meters: g.distance_meters ?? 500,
      rating: g.rating ?? 4.8,
      open_now: g.open_now ?? true,
      services: g.services ?? ['General Repair', 'Diagnostics'],
      phone: g.phone || '+49 89 000000',
      lat: g.lat ?? g.coordinates?.latitude ?? lat,
      lon: g.lon ?? g.coordinates?.longitude ?? lon,
      address: g.address || '',
    }));

    return {
      count: normalizedGarages.length,
      garages: normalizedGarages,
      data_source: data.data_source || 'DEMO_DATA',
    };
  }

  async getEvents(limit: number = 50, category?: string): Promise<{ total: number; events: SafetyEvent[] }> {
    const query = new URLSearchParams({ limit: limit.toString() });
    if (category) query.append('category', category);

    const res = await fetch(`${this.baseUrl}/events?${query.toString()}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      throw new Error(`Events error ${res.status}`);
    }
    return res.json();
  }
}

export const api = new ApiService();
