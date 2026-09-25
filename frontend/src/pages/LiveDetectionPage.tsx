// LiveDetectionPage
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, Upload, RefreshCw, AlertTriangle, CheckCircle2, Info, Eye, Image as ImageIcon, Sliders } from 'lucide-react';
import { api } from '../services/api';
import type { Detection } from '../types';

interface LiveDetectionPageProps {
  mode: 'simulated' | 'webcam' | 'sample';
  onModeChange: (mode: 'simulated' | 'webcam' | 'sample') => void;
  detections: Detection[];
  inferenceTimeMs: number;
  onFrameCaptured: (base64: string) => void;
  speedLimitKmh: number;
  fps: number;
  isBackendConnected: boolean;
}

export const LiveDetectionPage: React.FC<LiveDetectionPageProps> = ({
  onFrameCaptured,
  isBackendConnected,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);
  const [cameraDeviceLabel, setCameraDeviceLabel] = useState<string | null>(null);

  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeDetections, setActiveDetections] = useState<Detection[]>([]);
  const [lastInferenceTimeMs, setLastInferenceTimeMs] = useState<number | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [hasEvaluatedFrame, setHasEvaluatedFrame] = useState<boolean>(false);

  const [confThreshold, setConfThreshold] = useState<number>(0.45);

  const isRequestInProgressRef = useRef<boolean>(false);
  const lastCaptureTimeRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);
  const handleCameraFailure = useCallback((err: any) => {
    console.warn('Camera access failure:', err);
    const name = err?.name || '';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
      setIsPermissionDenied(true);
      setCameraError(
        'Camera permission was denied. Allow camera access for this site in the browser address bar, then press START CAMERA again.'
      );
    } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      setCameraError(
        'The browser reports no camera device (sensor) on this machine. Connect or enable a webcam and retry - image upload still works because the ML service is independent of the camera.'
      );
    } else if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
      setCameraError('The camera is already in use by another application or tab. Close other camera applications and retry.');
    } else if (name === 'OverconstrainedError') {
      setCameraError('No connected camera could satisfy the requested video constraints (resolution / facing mode).');
    } else {
      setCameraError(`Unable to start camera: ${err?.message || 'Unknown error'}`);
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setIsPermissionDenied(false);
    setUploadError(null);
    setUploadedImageSrc(null);
    setUploadedFileName(null);
    setRecognitionError(null);
    setCameraDeviceLabel(null);

    // getUserMedia requires a secure context: https:// or http://localhost.
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setCameraError(
        'Camera capture requires a secure context. Open this app via http://localhost:<port> or an HTTPS URL - browsers block camera access on file:// and plain-HTTP LAN addresses.'
      );
      return;
    }
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setCameraError(
        'This browser does not expose the MediaDevices API, so live camera capture is unavailable here. Uploading a traffic-sign image still works.'
      );
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });
    } catch (primaryErr: any) {
      // Desktop/laptop webcams frequently cannot satisfy facingMode:'environment'.
      // Retry once with no facing preference before reporting a hard failure.
      const retryable = ['OverconstrainedError', 'NotFoundError', 'DevicesNotFoundError'].includes(primaryErr?.name);
      if (!retryable) {
        handleCameraFailure(primaryErr);
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (fallbackErr: any) {
        handleCameraFailure(fallbackErr);
        return;
      }
    }

    if (!stream) {
      handleCameraFailure({ name: 'NotFoundError' });
      return;
    }

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      try {
        await videoRef.current.play();
      } catch {
        // Autoplay rejection is non-fatal - the element still receives the stream.
      }
    }
    setIsCameraActive(true);

    // Informational: report which video input the browser is actually using.
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((device) => device.kind === 'videoinput');
      const activeTrack = stream.getVideoTracks()[0];
      setCameraDeviceLabel(activeTrack?.label || `${videoInputs.length} video input(s) detected`);
    } catch {
      // Device enumeration is optional; ignore failures.
    }
  }, [stopCamera, handleCameraFailure]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  const processImageInference = useCallback(async (base64Payload: string, source: 'camera' | 'upload') => {
    if (isRequestInProgressRef.current) return;
    isRequestInProgressRef.current = true;
    setIsAnalyzing(true);
    setRecognitionError(null);

    const tStart = performance.now();
    try {
      const res = await api.detectFrame(base64Payload, confThreshold);
      const measuredTotalMs = Math.round(performance.now() - tStart);
      setLastInferenceTimeMs(res.inference_time_ms > 0 ? res.inference_time_ms : measuredTotalMs);
      setActiveDetections(res.detections || []);
      setHasEvaluatedFrame(true);

      if (source === 'camera') {
        onFrameCaptured(base64Payload);
      }
    } catch (err: any) {
      console.warn('Inference request failed:', err);
      setRecognitionError(
        isBackendConnected
          ? `Inference error: ${err.message || 'Server returned failure'}`
          : 'Backend inference service is offline. Start the Python FastAPI backend on port 8000.'
      );
    } finally {
      setIsAnalyzing(false);
      isRequestInProgressRef.current = false;
    }
  }, [confThreshold, isBackendConnected, onFrameCaptured]);

  useEffect(() => {
    if (!isCameraActive) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || isRequestInProgressRef.current) return;

      const now = performance.now();
      if (now - lastCaptureTimeRef.current < 650) return;
      lastCaptureTimeRef.current = now;

      try {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = video.videoWidth || 640;
        offscreenCanvas.height = video.videoHeight || 480;
        const ctx = offscreenCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
          const base64Jpg = offscreenCanvas.toDataURL('image/jpeg', 0.82);
          processImageInference(base64Jpg, 'camera');
        }
      } catch (err) {
        console.warn('Frame capture error:', err);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isCameraActive, processImageInference]);

  const handleCaptureManualFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    try {
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = video.videoWidth || 640;
      offscreenCanvas.height = video.videoHeight || 480;
      const ctx = offscreenCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const base64Jpg = offscreenCanvas.toDataURL('image/jpeg', 0.90);
        processImageInference(base64Jpg, 'upload');
      }
    } catch (err: any) {
      setRecognitionError(`Failed to capture frame: ${err.message}`);
    }
  }, [processImageInference]);

  const handleFileUpload = useCallback((file: File) => {
    setUploadError(null);
    setRecognitionError(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setUploadError(`Unsupported file format (${file.type || 'unknown'}). Please provide a JPG, PNG, or WEBP image.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(`Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    stopCamera();

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultB64 = e.target?.result as string;
      if (!resultB64) {
        setUploadError('Failed to read image file data.');
        return;
      }
      setUploadedImageSrc(resultB64);
      setUploadedFileName(file.name);
      processImageInference(resultB64, 'upload');
    };
    reader.onerror = () => {
      setUploadError('Error occurred while reading the file.');
    };
    reader.readAsDataURL(file);
  }, [stopCamera, processImageInference]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = (sampleUrl: string, sampleLabel: string) => {
    stopCamera();
    setUploadError(null);
    setRecognitionError(null);
    setUploadedFileName(sampleLabel);

    fetch(sampleUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Sample asset not found');
        return res.blob();
      })
      .then((blob) => {
        const file = new File([blob], sampleLabel, { type: blob.type });
        handleFileUpload(file);
      })
      .catch((err) => {
        setUploadError(`Failed to load sample: ${err.message}`);
      });
  };

  const filteredActiveDetections = activeDetections.filter((d) => d.confidence >= confThreshold);
  const primaryDetection = filteredActiveDetections[0] || null;
  const highestCandidate = activeDetections.length > 0
    ? [...activeDetections].sort((a, b) => b.confidence - a.confidence)[0]
    : null;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-[1600px] mx-auto w-full select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div className="flex items-center gap-2.5">
          <Camera className="w-5 h-5 text-accent" />
          <h1 className="font-headline font-bold text-base text-text-primary uppercase tracking-tight">
            LIVE CAMERA & SIGN RECOGNITION
          </h1>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-accent border border-border">
            GTSRB RESNET-18 (43 CLASSES)
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected ? 'bg-success animate-pulse' : 'bg-critical'
              }`}
            />
            {isBackendConnected ? 'MODEL SERVICE ONLINE' : 'MODEL SERVICE OFFLINE'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isCameraActive ? 'bg-accent' : uploadedImageSrc ? 'bg-warning' : 'bg-text-muted/40'
              }`}
            />
            {isCameraActive ? 'LIVE WEBCAM' : uploadedImageSrc ? 'IMAGE PREVIEW' : 'CAMERA OFFLINE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Camera & Upload Viewport */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative w-full aspect-[4/3] sm:aspect-[16/10] bg-surface-secondary rounded-lg overflow-hidden border transition-all ${
              isDragging ? 'border-accent bg-accent/5 ring-2 ring-accent/30' : 'border-border'
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {!isCameraActive && uploadedImageSrc && (
              <div className="relative w-full h-full flex items-center justify-center bg-black/60 p-4">
                <img
                  src={uploadedImageSrc}
                  alt="Uploaded traffic sign"
                  className="max-w-full max-h-full object-contain rounded border border-border/80 shadow-2xl"
                />
                <div className="absolute top-3 left-3 bg-surface/90 px-2 py-1 rounded border border-border text-[11px] font-mono text-text-primary backdrop-blur-sm flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-accent" />
                  <span className="truncate max-w-[200px]">{uploadedFileName || 'Uploaded Image'}</span>
                </div>
              </div>
            )}

            {!isCameraActive && !uploadedImageSrc && (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-text-muted">
                <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-3">
                  <CameraOff className="w-7 h-7 text-text-muted" />
                </div>
                <div className="font-headline font-bold text-text-primary text-sm uppercase mb-1">
                  CAMERA SENSOR STANDBY
                </div>
                <p className="font-mono text-xs max-w-sm text-text-muted mb-4">
                  Start your live webcam to recognize traffic signs in real time, or upload a traffic sign image below.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={startCamera}
                    className="px-3.5 py-2 rounded bg-accent text-bg font-headline font-bold text-xs uppercase tracking-wider hover:bg-accent/90 transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Start Camera</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded bg-surface-elevated border border-border text-text-primary font-headline font-bold text-xs uppercase tracking-wider hover:bg-surface-highest transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-accent" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
            )}

            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-accent/40 rounded-lg flex items-center justify-center">
                  <span className="absolute -top-3 px-2 py-0.5 bg-surface/90 text-accent font-mono text-[9px] uppercase tracking-wider border border-border rounded">
                    ALIGN TRAFFIC SIGN HERE
                  </span>
                  <div className="w-4 h-0.5 bg-accent/60" />
                  <div className="w-0.5 h-4 bg-accent/60 absolute" />
                </div>
              </div>
            )}

            {isCameraActive && (
              <div className="absolute top-3 left-3 bg-surface/90 border border-success/40 px-2.5 py-1 rounded text-success font-mono text-[11px] backdrop-blur-sm flex items-center gap-1.5 z-10">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>WEBCAM ACTIVE</span>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute top-3 right-3 bg-surface/90 border border-accent/40 px-2.5 py-1 rounded text-accent font-mono text-[11px] backdrop-blur-sm flex items-center gap-1.5 z-10">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>ANALYZING FRAME...</span>
              </div>
            )}

            {cameraError && (
              <div className="absolute bottom-3 left-3 right-3 bg-surface/95 border border-critical text-critical px-3 py-2 rounded text-xs font-mono backdrop-blur-sm z-20 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">
                    {isPermissionDenied ? 'CAMERA PERMISSION DENIED: ' : 'CAMERA ERROR: '}
                  </span>
                  <span>{cameraError}</span>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="absolute bottom-3 left-3 right-3 bg-surface/95 border border-warning text-warning px-3 py-2 rounded text-xs font-mono backdrop-blur-sm z-20 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">UPLOAD ERROR: </span>
                  <span>{uploadError}</span>
                </div>
              </div>
            )}
          </div>

          <div className="surface-card p-3 flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs">
            <div className="flex items-center gap-2">
              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded bg-accent text-bg font-headline font-bold text-xs uppercase tracking-wider hover:bg-accent/90 transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={stopCamera}
                    className="px-3 py-1.5 rounded bg-critical text-white font-headline font-bold text-xs uppercase tracking-wider hover:bg-critical/90 transition-colors flex items-center gap-1.5"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </button>
                  <button
                    onClick={handleCaptureManualFrame}
                    className="px-3 py-1.5 rounded bg-surface-elevated border border-border text-text-primary font-headline font-bold text-xs uppercase tracking-wider hover:bg-surface-highest transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-accent" />
                    <span>Capture Frame</span>
                  </button>
                </>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded bg-surface-elevated border border-border text-text-primary font-headline font-bold text-xs uppercase tracking-wider hover:bg-surface-highest transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-accent" />
                <span>Upload Traffic Sign</span>
              </button>

              {cameraDeviceLabel && (
                <span
                  className="text-[10px] text-text-muted font-mono hidden md:inline max-w-[240px] truncate"
                  title={`Active video input: ${cameraDeviceLabel}`}
                >
                  INPUT: {cameraDeviceLabel}
                </span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {import.meta.env.DEV && (
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted" title="Developer-only shortcuts: load bundled GTSRB sample images to verify the inference pipeline. Hidden in production builds.">
              <span className="text-warning/90">DEV TEST MODE - SAMPLES:</span>
              <button
                onClick={() => handleLoadSample('/samples/sample_stop.png', 'Stop Sign (GTSRB #14)')}
                className="px-2 py-0.5 rounded bg-surface-elevated border border-border hover:border-accent text-text-primary transition-colors"
                title="GTSRB Stop Sign Sample"
              >
                STOP
              </button>
              <button
                onClick={() => handleLoadSample('/samples/sample_speed30.png', 'Speed Limit 30 (GTSRB #1)')}
                className="px-2 py-0.5 rounded bg-surface-elevated border border-border hover:border-accent text-text-primary transition-colors"
                title="GTSRB 30 km/h Sign Sample"
              >
                30 KM/H
              </button>
              <button
                onClick={() => handleLoadSample('/samples/sample_keep_right.png', 'Keep Right (GTSRB #38)')}
                className="px-2 py-0.5 rounded bg-surface-elevated border border-border hover:border-accent text-text-primary transition-colors"
                title="GTSRB Keep Right Sign Sample"
              >
                KEEP RIGHT
              </button>
            </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Real Recognition Result Panel */}
        <div className="lg:col-span-5 surface-card p-5 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <span className="telemetry-label text-[11px] text-text-muted">RECOGNITION RESULT</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-text-muted border border-border">
                {isCameraActive ? 'LIVE WEBCAM' : uploadedImageSrc ? 'STATIC IMAGE' : 'IDLE'}
              </span>
            </div>

            {/* 1. WAITING FOR CAMERA / INPUT */}
            {!isCameraActive && !uploadedImageSrc && !hasEvaluatedFrame && (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-3">
                  <Camera className="w-5 h-5 text-text-muted" />
                </div>
                <div className="font-headline font-bold text-text-primary text-sm uppercase mb-1">
                  WAITING FOR CAMERA OR IMAGE
                </div>
                <p className="font-mono text-xs text-text-muted max-w-xs">
                  Start the webcam or upload a traffic sign image to begin real-time model recognition.
                </p>
              </div>
            )}

            {/* 2. RECOGNITION ERROR / BACKEND OFFLINE */}
            {recognitionError && (
              <div className="surface-inset p-4 border border-critical/50 rounded-md mb-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-critical font-bold text-sm uppercase mb-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>RECOGNITION ERROR</span>
                </div>
                <p className="text-text-muted text-[11px] mb-3 leading-relaxed">
                  {recognitionError}
                </p>
                {!isBackendConnected && (
                  <div className="p-2 rounded bg-surface text-warning text-[10px] border border-warning/30">
                    Run `python backend/main.py` to activate the PyTorch ResNet-18 model service. API target: <span className="text-accent font-bold">{api.getBaseUrl()}</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. GENUINE RECOGNITION RESULT (DETECTED SIGN) */}
            {primaryDetection && !recognitionError && (
              <div className="space-y-4 font-mono">
                <div
                  className={
                    'surface-inset p-4 border-l-4 ' +
                    (primaryDetection.confidence >= 0.75
                      ? 'border-success'
                      : primaryDetection.confidence >= 0.5
                      ? 'border-accent'
                      : 'border-warning')
                  }
                >
                  <div className="flex items-center justify-between text-[10px] text-text-muted uppercase mb-1">
                    <span>DETECTED SIGN</span>
                    <span
                      className={
                        'flex items-center gap-1 font-bold ' +
                        (primaryDetection.confidence >= 0.75
                          ? 'text-success'
                          : primaryDetection.confidence >= 0.5
                          ? 'text-accent'
                          : 'text-warning')
                      }
                    >
                      {primaryDetection.confidence >= 0.75 ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {primaryDetection.confidence >= 0.75
                        ? 'VERIFIED'
                        : primaryDetection.confidence >= 0.5
                        ? 'DETECTED'
                        : 'MARGINAL'}
                    </span>
                  </div>
                  <div className="font-headline font-bold text-xl text-text-primary uppercase tracking-tight">
                    {primaryDetection.class_name}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <div>
                      <span className="text-text-muted text-[11px]">CONFIDENCE: </span>
                      <strong className="text-success text-sm">
                        {(primaryDetection.confidence * 100).toFixed(1)}%
                      </strong>
                    </div>
                    <span className="text-border">|</span>
                    <div>
                      <span className="text-text-muted text-[11px]">CLASS ID: </span>
                      <strong className="text-accent">#{primaryDetection.class_id}</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="surface-inset p-2.5">
                    <span className="telemetry-label text-[9px]">CATEGORY</span>
                    <div className="font-bold text-text-primary mt-0.5 truncate uppercase">
                      {primaryDetection.category || 'TRAFFIC_SIGN'}
                    </div>
                  </div>

                  <div className="surface-inset p-2.5">
                    <span className="telemetry-label text-[9px]">SEVERITY</span>
                    <div
                      className={
                        'font-bold mt-0.5 uppercase ' +
                        (primaryDetection.severity === 'CRITICAL'
                          ? 'text-critical'
                          : primaryDetection.severity === 'WARNING'
                          ? 'text-warning'
                          : 'text-accent')
                      }
                    >
                      {primaryDetection.severity || 'INFO'}
                    </div>
                  </div>

                  <div className="surface-inset p-2.5">
                    <span className="telemetry-label text-[9px]">INGESTION MODE</span>
                    <div className="font-bold text-text-primary mt-0.5 truncate uppercase">
                      {primaryDetection.ingestion_mode || 'REGION_DETECTION'}
                    </div>
                  </div>

                  <div className="surface-inset p-2.5">
                    <span className="telemetry-label text-[9px]">PROCESSING TIME</span>
                    <div className="font-bold text-success mt-0.5">
                      {lastInferenceTimeMs !== null ? `${lastInferenceTimeMs.toFixed(1)} ms` : '--'}
                    </div>
                  </div>
                </div>

                {primaryDetection.action_required && (
                  <div className="surface-inset p-3 flex items-center justify-between text-xs">
                    <span className="text-text-muted">RECOMMENDED ACTION:</span>
                    <span className="font-bold text-accent uppercase">
                      {primaryDetection.action_required}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 4. LOW CONFIDENCE PREDICTION */}
            {!primaryDetection && highestCandidate && highestCandidate.confidence >= 0.25 && !recognitionError && (
              <div className="surface-inset p-4 border-l-4 border-warning font-mono space-y-3">
                <div className="flex items-center justify-between text-[10px] text-warning uppercase">
                  <span className="flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    LOW CONFIDENCE
                  </span>
                  <span>BELOW CUTOFF ({Math.round(confThreshold * 100)}%)</span>
                </div>
                <div>
                  <div className="text-[10px] text-text-muted uppercase">TENTATIVE PREDICTION</div>
                  <div className="font-headline font-bold text-base text-text-primary mt-0.5 uppercase">
                    {highestCandidate.class_name}
                  </div>
                  <div className="mt-1 text-xs">
                    <span className="text-text-muted">MEASURED CONFIDENCE: </span>
                    <strong className="text-warning">
                      {(highestCandidate.confidence * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  The model detected visual sign patterns, but confidence is uncertain. Try moving the camera closer,
                  adjusting lighting, or centering the sign within the guide reticle.
                </p>
              </div>
            )}

            {/* 5. NO TRAFFIC SIGN DETECTED */}
            {!primaryDetection && (!highestCandidate || highestCandidate.confidence < 0.25) && hasEvaluatedFrame && !recognitionError && (
              <div className="py-14 flex flex-col items-center justify-center text-center font-mono">
                <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center mb-3 text-text-muted">
                  <Info className="w-5 h-5" />
                </div>
                <div className="font-headline font-bold text-text-primary text-sm uppercase mb-1">
                  NO TRAFFIC SIGN DETECTED
                </div>
                <p className="text-xs text-text-muted max-w-xs leading-relaxed mb-2">
                  No recognized traffic sign detected in frame above the threshold. Point the camera directly at a
                  traffic sign or upload a sign image.
                </p>
                {lastInferenceTimeMs !== null && (
                  <span className="text-[10px] text-text-muted/70">
                    Last frame evaluated in {lastInferenceTimeMs.toFixed(1)} ms
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border mt-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-text-muted uppercase flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-accent" />
                <span>CONFIDENCE CUTOFF:</span>
              </span>
              <span className="text-accent font-bold">{Math.round(confThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.95"
              step="0.05"
              value={confThreshold}
              onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
              className="w-full accent-accent bg-surface-secondary h-1.5 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-text-muted/60">
              <span>0.20 (Sensitive)</span>
              <span>0.50 (Default)</span>
              <span>0.95 (Strict)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



