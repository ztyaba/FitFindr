import React, { useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import JSZip from "jszip";
import { Sparkles, Camera, Video, Loader2, RefreshCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const getSupportedMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
};

const REVIEW_COPY = {
  idle: "No analysis yet. Capture your form and send it for review.",
  needs_capture: "Capture your form first so we can analyze the pose data.",
  queued: "Ready to send. Hook this to your backend to run Gemini analysis.",
};

export default function FitFindrAI() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const recordedBlobRef = useRef(null);
  const landmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const animationRef = useRef(null);
  const lastStateUpdateRef = useRef(0);
  const chunksRef = useRef([]);
  const framesRef = useRef([]);
  const captureMetaRef = useRef({
    fps: 15,
    lastCaptureTime: -Infinity,
  });
  const isRecordingRef = useRef(false);

  const [showIntro, setShowIntro] = useState(true);
  const [facingMode, setFacingMode] = useState("environment");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [recordedType, setRecordedType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [poseStatus, setPoseStatus] = useState("idle");
  const [poseError, setPoseError] = useState("");
  const [landmarks, setLandmarks] = useState([]);
  const [reviewStatus, setReviewStatus] = useState("idle");
  const [captureCount, setCaptureCount] = useState(0);
  const [downloadError, setDownloadError] = useState("");

  const stopStream = ({ shouldSaveRecording = true, shouldUpdateState = true } = {}) => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      if (!shouldSaveRecording) {
        recorderRef.current.ondataavailable = null;
        recorderRef.current.onstop = null;
      }
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (shouldUpdateState) {
      setIsRecording(false);
    }
  };

  const clearOverlay = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const stopPose = () => {
    setPoseStatus((prev) => {
      if (prev === "idle") return prev;
      return landmarkerRef.current ? "ready" : "idle";
    });
    setPoseError("");
    setLandmarks([]);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    clearOverlay();
  };

  const startCamera = async ({ nextFacingMode = facingMode, autoStartPose = false } = {}) => {
    setErrorMessage("");
    setIsStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMessage("Camera access is not supported in this browser.");
        setIsStarting(false);
        return;
      }
      if (streamRef.current) {
        stopStream({ shouldSaveRecording: false });
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: nextFacingMode } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setFacingMode(nextFacingMode);
      setIsCameraOn(true);
      if (autoStartPose) {
        await startPose({ silent: true });
      }
    } catch (error) {
      setErrorMessage("Camera access failed. Check permissions or try HTTPS.");
      console.error(error);
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    stopPose();
    stopStream();
    setIsCameraOn(false);
  };

  const initPoseLandmarker = async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    setPoseStatus("loading");
    setPoseError("");
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      setPoseStatus("ready");
      return landmarkerRef.current;
    } catch (error) {
      console.error(error);
      setPoseStatus("error");
      setPoseError("Pose model failed to load. Check network access.");
      throw error;
    }
  };

  const startPose = async ({ silent = false } = {}) => {
    if (!streamRef.current) {
      if (!silent) {
        setPoseError("Start the camera before enabling pose tracking.");
      }
      return;
    }
    try {
      await initPoseLandmarker();
      setPoseStatus("running");
    } catch (error) {
      if (!silent) {
        setPoseError("Pose tracking failed to start.");
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      setErrorMessage("Start the camera before recording.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setErrorMessage("Recording is not supported in this browser.");
      return;
    }
    setErrorMessage("");
    setDownloadError("");
    framesRef.current = [];
    setCaptureCount(0);
    recordedBlobRef.current = null;
    captureMetaRef.current = {
      fps: captureMetaRef.current.fps,
      lastCaptureTime: -Infinity,
      startedAt: Date.now(),
      width: videoRef.current?.videoWidth || null,
      height: videoRef.current?.videoHeight || null,
      facingMode,
    };
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl("");
      setRecordedType("");
    }
    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    recorder.onstop = () => {
      const nextType = recorder.mimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type: nextType });
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
      setRecordedUrl(URL.createObjectURL(blob));
      setRecordedType(nextType);
      recordedBlobRef.current = blob;
      recorderRef.current = null;
    };
    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const handleCaptureForm = async () => {
    setShowIntro(false);
    setPoseError("");
    if (isCameraOn) {
      await startPose({ silent: true });
      return;
    }
    await startCamera({ nextFacingMode: facingMode, autoStartPose: true });
  };

  const handleSendForReview = () => {
    setShowIntro(false);
    if (!landmarks.length && !recordedUrl) {
      setReviewStatus("needs_capture");
      return;
    }
    setReviewStatus("queued");
  };

  const handleDownloadPackage = async () => {
    setDownloadError("");
    if (!recordedBlobRef.current) {
      setDownloadError("Record a clip before downloading the AI package.");
      return;
    }
    if (!framesRef.current.length) {
      setDownloadError("No landmark data captured yet. Record with pose tracking on.");
      return;
    }

    const extension = recordedType.includes("mp4") ? "mp4" : "webm";
    const payload = {
      exercise: "unspecified",
      camera: {
        facingMode,
        width: captureMetaRef.current.width,
        height: captureMetaRef.current.height,
        fps: captureMetaRef.current.fps,
      },
      capture: {
        startedAt: captureMetaRef.current.startedAt,
        landmarkCount: framesRef.current.length,
        normalizedCoordinates: true,
      },
      frames: framesRef.current,
    };

    const prompt = {
      task: "Analyze exercise form from pose landmarks with optional video reference.",
      instructions: [
        "Use the landmarks to assess joint angles, range of motion, stability, and symmetry.",
        "Identify form issues and provide corrective cues.",
        "Flag low-confidence frames or occlusions.",
        "Return clear, actionable feedback with a score.",
      ],
      output_schema: {
        score: "number 0-10",
        issues: [
          {
            title: "string",
            evidence: "string",
            correction: "string",
          },
        ],
        cues: ["string"],
        confidence: "number 0-1",
      },
    };

    try {
      const zip = new JSZip();
      zip.file(`video.${extension}`, recordedBlobRef.current);
      zip.file("landmarks.json", JSON.stringify(payload, null, 2));
      zip.file("prompt.json", JSON.stringify(prompt, null, 2));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "fitfindr-ai-package.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setDownloadError("Package creation failed. Try again.");
    }
  };

  const handleSwitchCamera = async () => {
    if (!isCameraOn || isStarting) return;
    const nextMode = facingMode === "environment" ? "user" : "environment";
    const shouldRestartPose = poseStatus === "running";
    stopPose();
    stopStream({ shouldSaveRecording: false });
    setIsCameraOn(false);
    await startCamera({ nextFacingMode: nextMode, autoStartPose: shouldRestartPose });
  };

  useEffect(() => {
    return () => {
      stopPose();
      stopStream({ shouldSaveRecording: false, shouldUpdateState: false });
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  useEffect(() => {
    if (poseStatus !== "running") return;
    const runDetection = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !canvas || !landmarker) {
        animationRef.current = requestAnimationFrame(runDetection);
        return;
      }

      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        if (!drawingUtilsRef.current) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            drawingUtilsRef.current = new DrawingUtils(ctx);
          }
        }
        const now = performance.now();
        const result = landmarker.detectForVideo(video, now);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        const poseLandmarks = result.landmarks?.[0] || [];
        if (poseLandmarks.length && drawingUtilsRef.current && ctx) {
          drawingUtilsRef.current.drawConnectors(
            poseLandmarks,
            PoseLandmarker.POSE_CONNECTIONS,
            { color: "#22c55e", lineWidth: 2 }
          );
          drawingUtilsRef.current.drawLandmarks(poseLandmarks, {
            color: "#38bdf8",
            lineWidth: 1,
          });
        }
        if (poseLandmarks.length && isRecordingRef.current) {
          const frameTime = typeof video.currentTime === "number" ? video.currentTime : now / 1000;
          const captureInterval = 1 / captureMetaRef.current.fps;
          if (frameTime - captureMetaRef.current.lastCaptureTime >= captureInterval) {
            framesRef.current.push({
              t: Number(frameTime.toFixed(3)),
              landmarks: poseLandmarks.map((point) => ({
                x: point.x,
                y: point.y,
                z: point.z,
                visibility: point.visibility ?? null,
                presence: point.presence ?? null,
              })),
            });
            captureMetaRef.current.lastCaptureTime = frameTime;
          }
        }
        if (now - lastStateUpdateRef.current > 200) {
          setLandmarks(poseLandmarks);
          setCaptureCount(framesRef.current.length);
          lastStateUpdateRef.current = now;
        }
      }
      animationRef.current = requestAnimationFrame(runDetection);
    };

    runDetection();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      clearOverlay();
    };
  }, [poseStatus]);

  const canDownloadPackage = Boolean(recordedUrl && captureCount > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/20">
                <Sparkles className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-black">Welcome To FitFindr AI</h2>
                <p className="text-xs text-slate-400">Accept camera access to capture form for analysis.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={handleCaptureForm}>
                Capture Form
              </Button>
              <Button className="flex-1" variant="outline" onClick={handleSendForReview}>
                Send for Review
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        <div className="relative flex-1 min-h-[65vh] bg-slate-950">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full pointer-events-none"
          />

          {!isCameraOn && (
            <div className="absolute inset-0 grid place-items-center text-slate-500 text-sm">
              <div className="flex flex-col items-center gap-3">
                <Camera className="h-8 w-8" />
                <span>Tap Capture Form to begin.</span>
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 top-4 flex flex-wrap items-center justify-between gap-3 px-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
              <Sparkles className="h-4 w-4 text-blue-400" />
              FitFindr AI
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSwitchCamera}
                disabled={!isCameraOn || isStarting}
              >
                <RefreshCcw className="h-4 w-4" />
                Switch Camera
              </Button>
              <Button size="sm" variant="outline" onClick={stopCamera} disabled={!isCameraOn}>
                Stop Camera
              </Button>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full border border-white/10 px-3 py-1 font-bold ${isCameraOn ? "bg-emerald-500/20 text-emerald-200" : "bg-white/5 text-slate-400"}`}>
              {isCameraOn ? "Camera On" : "Camera Off"}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-bold text-slate-300">
              Pose: {poseStatus}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-bold text-slate-300">
              Landmarks: {landmarks.length}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-bold text-slate-300">
              {facingMode === "environment" ? "Back Camera" : "Front Camera"}
            </span>
          </div>
        </div>

        <div className="border-t border-white/10 bg-slate-900/80">
          <div className="mx-auto w-full max-w-6xl px-4 py-6">
            {errorMessage && (
              <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
                {errorMessage}
              </div>
            )}
            {poseError && (
              <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
                {poseError}
              </div>
            )}
            {downloadError && (
              <div className="mb-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs text-blue-200">
                {downloadError}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="text-lg font-black">AI Interpretation</h2>
                <p className="mt-2 text-sm text-slate-400">{REVIEW_COPY[reviewStatus]}</p>
                <p className="mt-2 text-xs text-slate-500">Captured frames: {captureCount}</p>

                {poseStatus === "running" && landmarks.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                      Live landmark preview
                    </p>
                    <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                      {landmarks.slice(0, 6).map((point, index) => (
                        <div key={`${point.x}-${point.y}-${index}`} className="rounded-xl bg-slate-950/70 p-2">
                          <span className="font-bold text-slate-400">#{index}</span>{" "}
                          x:{point.x.toFixed(3)} y:{point.y.toFixed(3)} z:{point.z.toFixed(3)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleCaptureForm} disabled={isStarting}>
                  {isStarting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting
                    </span>
                  ) : (
                    "Capture Form"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSendForReview}
                  disabled={!landmarks.length && !recordedUrl}
                >
                  Send for Review
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDownloadPackage}
                  disabled={!canDownloadPackage}
                >
                  <Download className="h-4 w-4" />
                  Download AI Package
                </Button>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={startRecording}
                    disabled={!isCameraOn || isRecording}
                  >
                    <Video className="h-4 w-4" />
                    Start Recording
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopRecording}
                    disabled={!isRecording}
                  >
                    Stop Recording
                  </Button>
                </div>

                {recordedUrl && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
                    <p className="font-bold">Recorded clip ready</p>
                    <a
                      className="mt-2 inline-block text-blue-400 hover:text-blue-300"
                      href={recordedUrl}
                      download={`fitfindr-ai-recording.${recordedType.includes("mp4") ? "mp4" : "webm"}`}
                    >
                      Download clip
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
