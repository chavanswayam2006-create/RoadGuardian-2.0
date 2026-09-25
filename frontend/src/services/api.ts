import type { DetectResponse, DriverStatus, RoadContext, Garage, SafetyEvent, SystemHealth } from '../types';

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
    return res.json();
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
    return res.json();
  }

  async getRoadContext(lat: number = 48.137154, lon: number = 11.576124): Promise<RoadContext> {
    const res = await fetch(`${this.baseUrl}/road-context?lat=${lat}&lon=${lon}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      throw new Error(`Road context error ${res.status}`);
    }
    return res.json();
  }

  async getGarages(lat: number = 48.137154, lon: number = 11.576124, radius: number = 3000): Promise<{ count: number; garages: Garage[]; data_source: string }> {
    const res = await fetch(`${this.baseUrl}/garages?lat=${lat}&lon=${lon}&radius=${radius}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      throw new Error(`Garages error ${res.status}`);
    }
    return res.json();
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
