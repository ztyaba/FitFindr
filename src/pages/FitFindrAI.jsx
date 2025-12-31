import React, { useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import JSZip from "jszip";
import { Sparkles, Camera, Video, Loader2, RefreshCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseSelectorModal from "@/components/fitfindr/ExerciseSelectorModal";
import exercises from "@/data/exercises.json";

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

const PROMPT_TEXT = `FITFINDER AI ANALYSIS PROMPT (UNIVERSAL)

You are an AI movement and exercise analysis assistant for Fitfinder.

You will be given a single AI analysis package representing one completed recording session.
The package is automatically generated after the user stops recording.

The AI package contains:
- A user exercise video
- Pose / landmark data extracted during recording
- Session metadata (timestamps, confidence, repetitions, etc.)
- A user-selected exercise OR a user-typed custom exercise name
- This prompt file, which defines your behavior

----------------------------------------

YOUR RESPONSIBILITIES

1. IDENTIFY THE EXERCISE
- Use both:
  - the user-selected or user-typed exercise name
  - the observed movement patterns from the video and landmark data
- If the user selected "Other" and typed a custom exercise:
  - interpret the exercise based on the provided name and movement evidence
- If there is a mismatch between user input and observed movement:
  - prioritize movement evidence
  - briefly explain the discrepancy in plain language

----------------------------------------

2. ANALYZE MOVEMENT QUALITY
- Evaluate the movement based on best practices for the identified exercise
- Focus only on issues that meaningfully affect:
  - safety
  - efficiency
  - performance
- Ignore minor or cosmetic deviations
- Use landmark confidence and biomechanical signals to support conclusions

----------------------------------------

3. LOCATE THE PROBLEM MOMENT (GROUND TRUTH)
- Identify the specific frame or moment where form breakdown is most evident
  (e.g. peak load, deepest position, transition phase, loss of balance or alignment)
- This moment must be supported by landmark data and movement analysis
- Select one representative frame from the user's video at this moment

----------------------------------------

4. EXTRACT AND ANNOTATE THE REAL VIDEO FRAME
- Extract the selected frame directly from the user's video
- Overlay clear, minimal visual annotations on this image, such as:
  - lines
  - arrows
  - angles
  - highlights
- Annotations should clearly show what is incorrect for this exercise
- This image must be derived from the user's actual video and landmark data

----------------------------------------

5. EXPLAIN THE ISSUE (SIMPLE LANGUAGE)
Provide a short, user-friendly explanation that:
- Describes what is happening in the annotated frame
- Explains why it matters for this specific exercise
- Uses plain language without medical or technical jargon

----------------------------------------

6. GENERATE A CORRECTED EXAMPLE IMAGE
- Generate a separate example image showing correct form for the same exercise
- Match the general camera angle and body orientation when possible
- Overlay simple visual indicators showing correct alignment or movement
- This image is a generated reference example, not taken from the user's video

----------------------------------------

7. EXPLAIN THE CORRECTION
Briefly explain:
- Why the corrected example is better than the user's form
- What the user should focus on during their next attempt
- One or two simple, actionable cues

----------------------------------------

OUTPUT REQUIREMENTS
- Feedback must be concise, supportive, and actionable
- Visuals must be instructional, not decorative
- Clearly distinguish between:
  - the annotated real screenshot (from the user's video)
  - the generated correct-form example image
- Assume the user has no biomechanics background

Your goal is to help the user immediately understand:
- what went wrong
- why it matters
- how to fix it

END PROMPT`;

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
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseSelection, setExerciseSelection] = useState(null);

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

  const handleContinue = async () => {
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
      exercise: exerciseSelection
        ? { source: exerciseSelection.source, name: exerciseSelection.name }
        : null,
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
      prompt: PROMPT_TEXT,
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
                <h2 className="text-xl font-black">Welcome to Fitfindr AI</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Analyze your form using real-time motion capture and AI-powered movement analysis. All
                  tracking and processing happens securely on your device—nothing is stored or saved.
                </p>
                <p className="mt-2 text-sm text-slate-300">Enable camera access to get started.</p>
              </div>
            </div>
            <div className="mt-6">
              <Button className="w-full" onClick={handleContinue}>
                continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <ExerciseSelectorModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onConfirm={(selection) => {
          setExerciseSelection(selection);
          setIsExerciseModalOpen(false);
        }}
        exercises={exercises}
        initialSelection={exerciseSelection}
      />

      <div className="flex min-h-screen flex-col">
        <div className="bg-slate-950 px-4 pb-6 pt-6">
          <div className="relative mx-auto h-[52vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 sm:h-[58vh] lg:h-[62vh]">
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
              <span
                className={`rounded-full border border-white/10 px-3 py-1 font-bold ${
                  isCameraOn ? "bg-emerald-500/20 text-emerald-200" : "bg-white/5 text-slate-400"
                }`}
              >
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
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Exercise selection
                  </p>
                  <Button
                    className="mt-3 w-full border-white/20 bg-slate-950/70 text-slate-100 hover:bg-slate-900/80"
                    variant="outline"
                    onClick={() => setIsExerciseModalOpen(true)}
                  >
                    Select Exercise for Accuracy
                  </Button>
                  <p className="mt-3 text-xs text-slate-400">
                    {exerciseSelection
                      ? `Selected: ${exerciseSelection.name}`
                      : "No exercise selected yet."}
                  </p>
                </div>
                <Button onClick={handleContinue} disabled={isStarting}>
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
                  className="border-white/20 bg-slate-950/70 text-slate-100 hover:bg-slate-900/80"
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
