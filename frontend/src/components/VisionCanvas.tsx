import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Crosshair, Cpu, Radio } from 'lucide-react';
import type { Detection } from '../types';

interface VisionCanvasProps {
  mode: 'simulated' | 'webcam' | 'sample';
  detections: Detection[];
  inferenceTimeMs: number;
  onFrameCaptured?: (base64Image: string) => void;
  speedLimitKmh: number;
}

export const VisionCanvas: React.FC<VisionCanvasProps> = ({
  mode,
  detections,
  inferenceTimeMs,
  onFrameCaptured,
  speedLimitKmh,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  // Simulated road state
  const roadOffsetRef = useRef<number>(0);
  const signAnimRef = useRef<{ x: number; y: number; scale: number; signType: string }[]>([
    { x: 500, y: 180, scale: 0.2, signType: 'speed_50' },
  ]);

  // Setup webcam stream when in webcam mode
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (mode === 'webcam') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(console.error);
          }
          setWebcamError(null);
        })
        .catch((err) => {
          console.warn('Webcam access error:', err);
          setWebcamError('Camera unavailable. Showing tactical simulation.');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mode]);

  // Periodic frame grabber to send base64 to /detect
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
        // Grab current frame from simulated roadway canvas
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
          // ignore canvas capture errors
        }
      }
    }, 800); // 800ms cadence for continuous detection

    return () => clearInterval(interval);
  }, [mode, onFrameCaptured]);

  // Road Simulation Renderer
  const renderSimulatedRoad = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Horizon line
    const horizon = h * 0.45;

    // 1. Sky & Ground
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, '#060B14');
    skyGrad.addColorStop(1, '#0C172E');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizon);

    const groundGrad = ctx.createLinearGradient(0, horizon, 0, h);
    groundGrad.addColorStop(0, '#0a0f1d');
    groundGrad.addColorStop(1, '#05070d');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizon, w, h - horizon);

    // 2. Stars & Cyber grid horizon
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();

    // 3. Perspective Road Trajectory
    const roadTopWidth = 60;
    const roadBottomWidth = w * 0.85;
    const cx = w / 2;

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.moveTo(cx - roadTopWidth / 2, horizon);
    ctx.lineTo(cx + roadTopWidth / 2, horizon);
    ctx.lineTo(cx + roadBottomWidth / 2, h);
    ctx.lineTo(cx - roadBottomWidth / 2, h);
    ctx.closePath();
    ctx.fill();

    // Road shoulders (cyan neon guides)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - roadTopWidth / 2, horizon);
    ctx.lineTo(cx - roadBottomWidth / 2, h);
    ctx.moveTo(cx + roadTopWidth / 2, horizon);
    ctx.lineTo(cx + roadBottomWidth / 2, h);
    ctx.stroke();

    // Moving lane dividers
    roadOffsetRef.current = (roadOffsetRef.current + 4) % 40;
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 25]);
    ctx.lineDashOffset = -roadOffsetRef.current;
    ctx.beginPath();
    ctx.moveTo(cx, horizon);
    ctx.lineTo(cx, h);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // 4. Draw Roadside Sign Object with scale & motion
    signAnimRef.current.forEach((sign) => {
      sign.scale += 0.006;
      sign.y += 2.2;
      sign.x += 1.8; // moves outward to the right side of the road

      if (sign.y > h + 50 || sign.x > w + 50) {
        sign.x = cx + roadTopWidth * 0.8;
        sign.y = horizon + 10;
        sign.scale = 0.2;
      }

      ctx.save();
      ctx.translate(sign.x, sign.y);
      ctx.scale(sign.scale, sign.scale);

      // Sign pole
      ctx.fillStyle = '#64748B';
      ctx.fillRect(-3, 0, 6, 70);

      // Speed limit sign
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#DC2626'; // Red ring
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${speedLimitKmh}`, 0, 2);

      ctx.restore();
    });

    // 5. Draw Traffic Light on left shoulder
    const tlX = cx - 180;
    const tlY = horizon + 30;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(tlX - 12, tlY - 30, 24, 60);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(tlX - 12, tlY - 30, 24, 60);

    // Active light (Green or Red)
    const isRed = detections.some((d) => d.is_red_light);
    ctx.beginPath();
    ctx.arc(tlX, tlY - 18, 7, 0, Math.PI * 2);
    ctx.fillStyle = isRed ? '#EF4444' : '#334155';
    ctx.fill();
    if (isRed) {
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 10;
    }

    ctx.beginPath();
    ctx.arc(tlX, tlY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(tlX, tlY + 18, 7, 0, Math.PI * 2);
    ctx.fillStyle = !isRed ? '#10B981' : '#334155';
    ctx.fill();
    ctx.shadowBlur = 0; // reset
  }, [detections, speedLimitKmh]);

  // Main animation loop
  useEffect(() => {
    const renderLoop = () => {
      if (mode === 'simulated' || webcamError) {
        renderSimulatedRoad();
      } else if (mode === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [mode, renderSimulatedRoad, webcamError]);

  return (
    <div className="hud-card hud-brackets relative flex flex-col h-full overflow-hidden bg-slate-950">
      {/* HUD Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/80 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400">
          <Camera className="w-4 h-4" />
          <span className="font-bold tracking-wider uppercase">FORWARD OPTICAL HUD</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
            {mode === 'webcam' && !webcamError ? 'LIVE SENSOR' : 'SYNTHETIC TWIN'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-mono">60 FPS TARGET</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-300">{inferenceTimeMs.toFixed(1)} ms</span>
          </span>
        </div>
      </div>

      {/* Main Video / Canvas Viewport */}
      <div className="relative flex-1 min-h-[360px] bg-black flex items-center justify-center overflow-hidden">
        {/* Hidden video element for webcam streaming */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
        />

        {/* Primary Optical Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          className="w-full h-full object-cover scanline-effect"
        />

        {/* Optical Tactical Reticle Center Crosshair */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-28 h-28 border border-cyan-500/20 rounded-full flex items-center justify-center">
            <Crosshair className="w-6 h-6 text-cyan-400/40" />
            <div className="absolute -top-3 text-[10px] font-mono text-cyan-500/50">AZIMUTH 000°</div>
          </div>
        </div>

        {/* SVG Bounding Boxes Overlay for Detections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 640 380">
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
            const width = Math.max(20, x2 - x1);
            const height = Math.max(20, y2 - y1);
            const isCritical = det.is_red_light;
            const strokeColor = isCritical ? '#EF4444' : '#06B6D4';

            return (
              <g key={`det-${idx}`}>
                {/* Bounding Box Rect */}
                <rect
                  x={x1}
                  y={y1}
                  width={width}
                  height={height}
                  fill="rgba(6, 182, 212, 0.08)"
                  stroke={strokeColor}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Reticle Corner Marks */}
                <path
                  d={`M ${x1} ${y1 + 8} L ${x1} ${y1} L ${x1 + 8} ${y1}`}
                  stroke={strokeColor}
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d={`M ${x2 - 8} ${y1} L ${x2} ${y1} L ${x2} ${y1 + 8}`}
                  stroke={strokeColor}
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d={`M ${x1} ${y2 - 8} L ${x1} ${y2} L ${x1 + 8} ${y2}`}
                  stroke={strokeColor}
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d={`M ${x2 - 8} ${y2} L ${x2} ${y2} L ${x2} ${y2 - 8}`}
                  stroke={strokeColor}
                  strokeWidth="3"
                  fill="none"
                />

                {/* Label Tag Pill */}
                {(() => {
                  const labelStr = (det.class_name || (det as any).display_name || (det as any).label || 'Traffic Sign').toString();
                  const confPct = typeof det.confidence === 'number' ? Math.round(det.confidence * 100) : 50;
                  return (
                    <>
                      <rect
                        x={x1}
                        y={Math.max(0, y1 - 20)}
                        width={Math.max(120, labelStr.length * 8 + 35)}
                        height="18"
                        fill={isCritical ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.85)'}
                        rx="3"
                        stroke={strokeColor}
                        strokeWidth="1"
                      />
                      <text
                        x={x1 + 5}
                        y={Math.max(14, y1 - 6)}
                        fill="#F8FAFC"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {labelStr.toUpperCase()} ({confPct}%)
                      </text>
                    </>
                  );
                })()}
              </g>
            );
          })}
        </svg>

        {/* In-Canvas Active HUD Warning Chip */}
        {detections.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            {detections.slice(0, 3).map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/90 border border-cyan-500/50 backdrop-blur-sm text-xs shadow-lg"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono font-bold text-white uppercase">{d.class_name}</span>
                <span className="font-mono text-cyan-300">{(d.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Optical Stats HUD */}
        <div className="absolute bottom-2 inset-x-3 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/70 backdrop-blur-sm px-3 py-1 rounded border border-slate-800">
          <div>PIPELINE: YOLOv8 LOCATOR + RESNET-18 GTSRB</div>
          <div className="text-cyan-400">{detections.length} OBJECTS TRACKED</div>
          <div>RES: 640x380 RAW</div>
        </div>
      </div>
    </div>
  );
};
