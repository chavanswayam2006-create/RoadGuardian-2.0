import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VideoOff } from 'lucide-react';
import type { Detection } from '../types';

interface VisionCanvasProps {
  mode: 'simulated' | 'webcam' | 'sample';
  detections: Detection[];
  inferenceTimeMs: number;
  onFrameCaptured?: (base64Image: string) => void;
  speedLimitKmh: number;
  fps?: number;
}

export const VisionCanvas: React.FC<VisionCanvasProps> = ({
  mode,
  detections,
  inferenceTimeMs,
  onFrameCaptured,
  speedLimitKmh,
  fps = 60,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  // Road animation state
  const roadOffsetRef = useRef<number>(0);
  const signAnimRef = useRef<{ x: number; y: number; scale: number; speed: number }[]>([
    { x: 440, y: 140, scale: 0.25, speed: 1.2 },
  ]);

  // Webcam setup
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (mode === 'webcam') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 380 } } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(console.error);
          }
          setWebcamError(null);
        })
        .catch((err) => {
          console.warn('Webcam stream unavailable:', err);
          setWebcamError('Camera sensor unavailable. Rendering synthetic simulation.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mode]);

  // Periodic frame grabber to feed backend /detect API
  useEffect(() => {
    const interval = setInterval(() => {
      if (!onFrameCaptured) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (mode === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 320;
        tempCanvas.height = 240;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 320, 240);
          onFrameCaptured(tempCanvas.toDataURL('image/jpeg', 0.7));
        }
      } else {
        try {
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = 320;
          smallCanvas.height = 240;
          const ctx = smallCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, 0, 320, 240);
            onFrameCaptured(smallCanvas.toDataURL('image/jpeg', 0.7));
          }
        } catch {
          // ignore frame capture exception
        }
      }
    }, 850);

    return () => clearInterval(interval);
  }, [mode, onFrameCaptured]);

  // Road Simulation Loop
  const renderSimulatedRoad = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const horizon = h * 0.44;

    // Sky gradient (Deep dark automotive navy)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, '#030810');
    skyGrad.addColorStop(1, '#071524');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizon);

    // Ground & Asphalt gradient
    const groundGrad = ctx.createLinearGradient(0, horizon, 0, h);
    groundGrad.addColorStop(0, '#060E18');
    groundGrad.addColorStop(1, '#02050A');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizon, w, h - horizon);

    // Horizon subtle line
    ctx.strokeStyle = 'rgba(141, 184, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();

    // Road perspective polygon
    const vpX = w * 0.5;
    const roadTopWidth = 24;
    const roadBottomWidth = w * 0.78;

    ctx.fillStyle = '#091522';
    ctx.beginPath();
    ctx.moveTo(vpX - roadTopWidth / 2, horizon);
    ctx.lineTo(vpX + roadTopWidth / 2, horizon);
    ctx.lineTo(vpX + roadBottomWidth / 2, h);
    ctx.lineTo(vpX - roadBottomWidth / 2, h);
    ctx.closePath();
    ctx.fill();

    // Road edge lines
    ctx.strokeStyle = 'rgba(141, 184, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(vpX - roadTopWidth / 2, horizon);
    ctx.lineTo(vpX - roadBottomWidth / 2, h);
    ctx.moveTo(vpX + roadTopWidth / 2, horizon);
    ctx.lineTo(vpX + roadBottomWidth / 2, h);
    ctx.stroke();

    // Dashed center lane markings
    roadOffsetRef.current = (roadOffsetRef.current + 3) % 40;
    const numDashes = 7;
    for (let i = 0; i < numDashes; i++) {
      const progress = ((i * 40 + roadOffsetRef.current) % 240) / 240;
      const y1 = horizon + progress * (h - horizon);
      const dashH = Math.max(4, progress * 24);
      const dashW = Math.max(1.5, progress * 4);

      ctx.fillStyle = 'rgba(230, 240, 250, 0.65)';
      ctx.fillRect(vpX - dashW / 2, y1, dashW, dashH);
    }

    // Roadside Speed Limit Sign Graphic
    const sign = signAnimRef.current[0];
    if (sign) {
      sign.scale += 0.003 * sign.speed;
      sign.x += 0.45 * sign.speed;
      sign.y += 0.22 * sign.speed;

      if (sign.scale > 0.85 || sign.x > w - 40) {
        sign.scale = 0.22;
        sign.x = 420;
        sign.y = horizon + 10;
      }

      ctx.save();
      ctx.translate(sign.x, sign.y);
      ctx.scale(sign.scale, sign.scale);

      // Post
      ctx.fillStyle = '#424E5C';
      ctx.fillRect(-2, 0, 4, 80);

      // Circular European Speed Sign (White disc, red ring, black text)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -22, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#D92D20';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#101828';
      ctx.font = 'bold 20px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(speedLimitKmh.toString(), 0, -22);

      ctx.restore();
    }
  }, [speedLimitKmh]);

  // Continuous animation frame loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      if (mode !== 'webcam' || webcamError) {
        renderSimulatedRoad();
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [mode, webcamError, renderSimulatedRoad]);

  return (
    <div className="relative w-full aspect-[16/10] bg-surface-secondary rounded-lg overflow-hidden border border-border select-none">
      {/* Video element for real webcam feed */}
      {mode === 'webcam' && !webcamError && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
      )}

      {/* Canvas for simulated optical drive or fallback */}
      <canvas
        ref={canvasRef}
        width={640}
        height={380}
        className="w-full h-full object-cover block"
      />

      {/* Top Floating Engineering Telemetry Strip */}
      <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none z-10 font-mono text-[11px]">
        {/* Left: LIVE & Engine Indicator */}
        <div className="flex items-center gap-2 bg-surface/90 px-2 py-1 rounded border border-border-subtle backdrop-blur-sm">
          <span className="flex items-center gap-1.5 text-critical font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-critical status-pulse" />
            LIVE
          </span>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary font-semibold">AI VISION</span>
        </div>

        {/* Right: Technical FPS & Latency */}
        <div className="flex items-center gap-3 bg-surface/90 px-2.5 py-1 rounded border border-border-subtle backdrop-blur-sm text-text-muted">
          <div className="flex items-center gap-1">
            <span>FPS</span>
            <span className="text-accent font-bold">{fps}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1">
            <span>LATENCY</span>
            <span className="text-success font-bold">{inferenceTimeMs.toFixed(1)} ms</span>
          </div>
        </div>
      </div>

      {/* SVG Precision Bounding Box & Floating Reticle Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 640 380"
        preserveAspectRatio="none"
      >
        {detections.map((det, idx) => {
          const rawBbox = (det as any).bbox || (det as any).bounding_box;
          let x1 = 0, y1 = 0, x2 = 0, y2 = 0;

          if (Array.isArray(rawBbox) && rawBbox.length === 4) {
            [x1, y1, x2, y2] = rawBbox;
          } else if (rawBbox && typeof rawBbox === 'object') {
            x1 = Math.round((rawBbox.x_min ?? 0) * 640);
            y1 = Math.round((rawBbox.y_min ?? 0) * 380);
            x2 = Math.round((rawBbox.x_max ?? 1) * 640);
            y2 = Math.round((rawBbox.y_max ?? 1) * 380);
          }

          const width = Math.max(24, x2 - x1);
          const height = Math.max(24, y2 - y1);
          const isCritical = det.is_red_light;
          const strokeColor = isCritical ? '#FF5C67' : '#8DB8FF';
          const labelStr = (det.class_name || 'Traffic Sign').toString().toUpperCase();
          const confPct = typeof det.confidence === 'number' ? Math.round(det.confidence * 100) : null;

          return (
            <g key={`det-${idx}`}>
              {/* Thin, precise, semi-transparent bounding box */}
              <rect
                x={x1}
                y={y1}
                width={width}
                height={height}
                fill={isCritical ? 'rgba(255, 92, 103, 0.08)' : 'rgba(141, 184, 255, 0.08)'}
                stroke={strokeColor}
                strokeWidth="1.25"
              />

              {/* Minimal Corner Reticles */}
              <path
                d={`M ${x1} ${y1 + 6} L ${x1} ${y1} L ${x1 + 6} ${y1}`}
                stroke={strokeColor}
                strokeWidth="1.75"
                fill="none"
              />
              <path
                d={`M ${x2 - 6} ${y1} L ${x2} ${y1} L ${x2} ${y1 + 6}`}
                stroke={strokeColor}
                strokeWidth="1.75"
                fill="none"
              />
              <path
                d={`M ${x1} ${y2 - 6} L ${x1} ${y2} L ${x1 + 6} ${y2}`}
                stroke={strokeColor}
                strokeWidth="1.75"
                fill="none"
              />
              <path
                d={`M ${x2 - 6} ${y2} L ${x2} ${y2} L ${x2 - 6} ${y2}`}
                stroke={strokeColor}
                strokeWidth="1.75"
                fill="none"
              />

              {/* Compact Floating Label Tag: SPEED LIMIT 40  96% */}
              <rect
                x={x1}
                y={Math.max(20, y1 - 20)}
                width={Math.max(110, labelStr.length * 6.5 + 40)}
                height="17"
                fill="#071522"
                stroke={strokeColor}
                strokeWidth="1"
                rx="2"
              />
              <text
                x={x1 + 6}
                y={Math.max(20, y1 - 20) + 12}
                fill="#E6F0FA"
                fontSize="10"
                fontFamily='"JetBrains Mono", monospace'
                fontWeight="600"
              >
                {labelStr} {confPct !== null && <tspan fill={isCritical ? '#FF5C67' : '#35D69A'}>{confPct}%</tspan>}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Subtle Optical Center Reticle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="relative w-8 h-8">
          <span className="absolute top-1/2 left-0 right-0 h-px bg-accent/40" />
          <span className="absolute left-1/2 top-0 bottom-0 w-px bg-accent/40" />
        </div>
      </div>

      {/* Webcam Sensor Error Banner if triggered */}
      {webcamError && (
        <div className="absolute bottom-3 left-3 right-3 bg-surface/90 border border-warning/50 text-warning px-3 py-1.5 rounded flex items-center gap-2 text-xs font-mono backdrop-blur-sm z-20">
          <VideoOff className="w-4 h-4 shrink-0" />
          <span>{webcamError}</span>
        </div>
      )}
    </div>
  );
};
