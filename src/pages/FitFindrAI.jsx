import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import JSZip from "jszip";
import { Sparkles, Camera, Loader2, RefreshCcw, Download, Square, Send, Dumbbell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseSelectorModal from "@/components/fitfindr/ExerciseSelectorModal";
import { ExerciseImageLightbox } from "@/components/fitfindr/ExerciseImageLightbox";
import exercises from "@/data/exercises.json";
import BlurText from "@/components/react-bits/BlurText";

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

const MAX_RECORDING_SECONDS = 30;

const REVIEW_COPY = {
  idle: "Capture your form and tap Review to start your AI analysis.",
  needs_capture: "Record a clip with pose tracking so we can analyze your form.",
  ready: "AI Form package ready. Tap Review to start the analysis.",
  packaging: "Preparing your AI package...",
  sending: "Sending the package to Gemini for analysis...",
  done: "Analysis complete. Review your feedback below.",
  error: "Analysis failed. Try again when you're ready.",
};

const PROMPT_TEXT = `You are an AI movement and exercise analysis assistant for Fitfinder.

You will be given a single AI analysis package representing one completed recording session.
The package is automatically generated after the user stops recording.

The AI package contains:
- A user exercise video
- Pose / landmark data extracted during recording
- Session metadata (timestamps, confidence, repetitions, etc.)
- A user-selected exercise OR a user-typed custom exercise name
- This prompt file, which defines your behavior

YOUR RESPONSIBILITIES

IDENTIFY THE EXERCISE
Use both:
- the user-selected or user-typed exercise name
- the observed movement patterns from the video and landmark data

If the user selected "Other" and typed a custom exercise:
- interpret the exercise based on the provided name and movement evidence

If there is a mismatch between user input and observed movement:
- prioritize movement evidence
- briefly explain the discrepancy in plain language

ALIGN LANDMARKS WITH VIDEO (REQUIRED)
- Use timestamps and/or frame indices to align landmark data with video frames
- Identify the exact frame(s) where form breaks down using this alignment
- Base all critique on the aligned frame(s), not on general impressions

ANALYZE MOVEMENT QUALITY (LANDMARK + VIDEO)
- Evaluate the movement based on best practices for the identified exercise
- Use aligned landmarks + corresponding video frames to pinpoint what went wrong
- Focus only on issues that meaningfully affect safety, efficiency, or performance
- Ignore minor or cosmetic deviations
- Use landmark confidence and biomechanical signals to support conclusions

IMAGE LINK REQUIREMENTS
- Images live under /public/exercises/{Exercise_Folder}/images/ and are served at /exercises/{Exercise_Folder}/images/
- Use exercise.folder when provided; otherwise use the user-selected exercise name as the folder name
- Return clickable URLs for the default image files: /exercises/{Exercise_Folder}/images/0.jpg and /exercises/{Exercise_Folder}/images/1.jpg
- Do not invent other paths or filenames
- If the exercise is "Other" or the name does not map to a folder, state that no specific exercise images are available

NO SCREENSHOT OR GENERATED IMAGES
- Do not extract or render any user video frames
- Do not generate or request images of the user
- Provide instruction using text and existing exercise reference images only

OUTPUT REQUIREMENTS (CONCISE + USER FRIENDLY)
Return in this exact order:

1) WHAT IS WRONG (SIMPLE)
- 1-3 short bullets describing the main form issue(s) based on aligned landmarks/video

2) WHERE IT HAPPENS (ALIGNED)
- 1 short bullet naming the phase or moment (e.g., bottom position, transition, peak load)
- Mention how the aligned landmarks show the breakdown in that moment

3) HOW TO FIX IT
- 1-3 short bullets with the most actionable corrections in plain language

4) EXERCISE IMAGES (CLICKABLE LINKS)
- Output these URLs on their own lines so they are clickable in chat:
  - /exercises/{Exercise_Folder}/images/0.jpg
  - /exercises/{Exercise_Folder}/images/1.jpg
- Add 1 short sentence describing what is happening in each image
- Add 1 short line on how to apply each image to fix form

If the exercise is "Other" or no images exist for the chosen exercise:
- State that no specific exercise images are available
- Still provide the same text advice above

5) REFERENCE LINK (EXRX)
- Provide the exact ExRx link for the identified exercise

6) YOUTUBE REFERENCE
- Provide a YouTube link from a reputable channel specific to the exercise
- Prefer Bodybuilding.com
- If no specific match exists, choose the closest reputable alternative
- If the exercise is "Other", choose the closest reputable match to the user-typed exercise

7) IF NO VIDEO FOUND
- Ask the user to briefly describe or provide more details about the exercise so you can provide a better visual resource

Your goal is to help the user immediately understand:
- what went wrong
- where it happens
- how to fix it
- where to see a clear example`;

// Typewriter replaced with BlurText component for better mobile performance

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
  const recordingTimeoutRef = useRef(null);

  const [showIntro, setShowIntro] = useState(true);
  const [facingMode, setFacingMode] = useState("user");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [recordedType, setRecordedType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [poseStatus, setPoseStatus] = useState("idle");
  const [poseError, setPoseError] = useState("");
  const [landmarks, setLandmarks] = useState([]);
  const [analysisStatus, setAnalysisStatus] = useState("idle");
  const [analysisText, setAnalysisText] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [analysisRequest, setAnalysisRequest] = useState("");
  const [captureCount, setCaptureCount] = useState(0);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseSelection, setExerciseSelection] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [chatSequence, setChatSequence] = useState("idle"); // 'idle', 'user', 'loading', 'complete'
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  // Handle auto-start camera on mount - REMOVED: using Grant Permission button instead
  useEffect(() => {
    // We now wait for the user to click "Grant Permission" in the intro screen
  }, []);

  // Handle resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle exercise selection chat sequence
  useEffect(() => {
    if (exerciseSelection) {
      setChatSequence("user");
      setIsTypewriterComplete(false);
      const typingTimer = setTimeout(() => setChatSequence("loading"), 600);
      const completeTimer = setTimeout(() => setChatSequence("complete"), 2200);
      return () => {
        clearTimeout(typingTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setChatSequence("idle");
    }
  }, [exerciseSelection]);

  const stopStream = ({ shouldSaveRecording = true, shouldUpdateState = true } = {}) => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      if (!shouldSaveRecording) {
        recorderRef.current.ondataavailable = null;
        recorderRef.current.onstop = null;
      }
      recorderRef.current.stop();
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
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

  const buildAnalysisRequest = () => {
    if (exerciseSelection?.name) {
      return `Analyze my ${exerciseSelection.name} form.`;
    }
    return "Analyze my form.";
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
    setAnalysisError("");
    setAnalysisText("");
    setAnalysisStatus("idle");
    setAnalysisRequest("");
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
      maxDurationSeconds: MAX_RECORDING_SECONDS,
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
    recordingTimeoutRef.current = setTimeout(() => {
      if (recorderRef.current && recorderRef.current.state === "recording") {
        setErrorMessage(`Recording stopped at ${MAX_RECORDING_SECONDS} seconds.`);
        stopRecording();
      }
    }, MAX_RECORDING_SECONDS * 1000);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    if (recordedUrl && captureCount > 0 && analysisStatus === "needs_capture") {
      setAnalysisStatus("idle");
    }
  }, [recordedUrl, captureCount, analysisStatus]);

  const handleContinue = async () => {
    setShowIntro(false);
    setPoseError("");
    if (isCameraOn) {
      await startPose({ silent: true });
      return;
    }
    await startCamera({ nextFacingMode: facingMode, autoStartPose: true });
  };

  const buildAiPackage = async () => {
    if (!recordedBlobRef.current) {
      throw new Error("Record a clip before requesting an analysis.");
    }
    if (!framesRef.current.length) {
      throw new Error("No landmark data captured yet. Record with pose tracking on.");
    }

    const extension = recordedType.includes("mp4") ? "mp4" : "webm";
    const imageFolder =
      exerciseSelection?.source === "list" ? exerciseSelection.id : null;
    const durationSeconds =
      framesRef.current.length > 1
        ? Number(
          (framesRef.current[framesRef.current.length - 1].t - framesRef.current[0].t).toFixed(3)
        )
        : 0;
    if (durationSeconds > MAX_RECORDING_SECONDS + 0.5) {
      throw new Error(`Recording exceeds ${MAX_RECORDING_SECONDS} seconds. Please retry with a shorter clip.`);
    }

    const payload = {
      exercise: exerciseSelection
        ? {
          source: exerciseSelection.source,
          name: exerciseSelection.name,
          id: exerciseSelection.id || null,
          folder: imageFolder,
          image_urls: imageFolder
            ? [
              `/exercises/${imageFolder}/images/0.jpg`,
              `/exercises/${imageFolder}/images/1.jpg`,
            ]
            : [],
        }
        : null,
      camera: {
        facingMode,
        width: captureMetaRef.current.width,
        height: captureMetaRef.current.height,
        fps: captureMetaRef.current.fps,
      },
      video: {
        filename: `video.${extension}`,
        mimeType:
          recordedBlobRef.current.type ||
          (extension === "mp4" ? "video/mp4" : "video/webm"),
        durationSeconds,
      },
      capture: {
        startedAt: captureMetaRef.current.startedAt,
        landmarkCount: framesRef.current.length,
        normalizedCoordinates: true,
        durationSeconds,
        maxDurationSeconds: MAX_RECORDING_SECONDS,
      },
      frames: framesRef.current,
    };

    const prompt = {
      prompt: PROMPT_TEXT,
    };

    const zip = new JSZip();
    zip.file(`video.${extension}`, recordedBlobRef.current);
    zip.file("landmarks.json", JSON.stringify(payload, null, 2));
    zip.file("prompt.json", JSON.stringify(prompt, null, 2));

    return zip.generateAsync({ type: "blob" });
  };

  const handleSendForReview = async () => {
    setShowIntro(false);
    setAnalysisError("");
    const requestText = buildAnalysisRequest();
    setAnalysisRequest(requestText);

    if (!recordedBlobRef.current || !framesRef.current.length) {
      setAnalysisStatus("needs_capture");
      return;
    }

    setAnalysisStatus("packaging");
    setAnalysisText("");

    try {
      const packageBlob = await buildAiPackage();
      const formData = new FormData();
      formData.append("package", packageBlob, "fitfindr-ai-package.zip");

      setAnalysisStatus("sending");
      const response = await fetch("/api/ai/interpret", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      const responseText = data.text?.trim();
      if (!responseText) {
        throw new Error("No analysis text returned. Try again.");
      }

      const noteText = data.note ? `Note: ${data.note}\n\n` : "";
      setAnalysisText(`${noteText}${responseText}`);
      setAnalysisStatus("done");
    } catch (error) {
      console.error(error);
      setAnalysisError(error.message || "Analysis failed. Try again.");
      setAnalysisStatus("error");
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

  const isPackageReady = Boolean(recordedUrl && captureCount > 0);
  const displayStatus =
    isPackageReady && analysisStatus === "idle" ? "ready" : analysisStatus;
  const isReviewBusy = analysisStatus === "packaging" || analysisStatus === "sending";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 py-safe">
          <div className="w-full max-w-sm rounded-[2.5rem] border border-white/10 bg-slate-900/90 backdrop-blur-2xl p-8 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-blue-500/20 border border-blue-500/30">
                <Sparkles className="h-10 w-10 text-blue-400" />
              </div>
              <div className="space-y-2">
                <BlurText
                  text="FitFindr AI"
                  className="text-3xl font-black tracking-tight flex justify-center"
                  delay={50}
                  animateBy="letters"
                  direction="top"
                />
                <BlurText
                  text="Initializing Core..."
                  className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 flex justify-center"
                  delay={30}
                  animateBy="letters"
                  direction="top"
                />
              </div>
              <div className="w-full space-y-4">
                <Button
                  onClick={handleContinue}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl shadow-blue-900/30 active:scale-95"
                >
                  <BlurText text="Grant Permission" delay={40} className="flex justify-center" />
                </Button>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                  Camera access required for form analysis
                </p>
              </div>
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

      <div className="flex min-h-[100dvh] flex-col overflow-hidden">
        <div className={`bg-slate-950 ${isMobile ? 'px-0 pb-0 pt-0' : 'px-4 pb-6 pt-6'}`}>
          <div className={`relative mx-auto w-full overflow-hidden border border-white/10 bg-slate-950 ${isMobile ? 'h-[50dvh] rounded-none' : 'h-[52vh] max-w-5xl rounded-[2.5rem] sm:h-[58vh] lg:h-[62vh]'}`}>
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
              <div className="inline-flex items-center gap-2 rounded-[2rem] border border-white/10 bg-slate-900/80 backdrop-blur-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                <Sparkles className="h-4 w-4 text-blue-400" />
                FitFindr AI
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSwitchCamera}
                  disabled={!isCameraOn || isStarting}
                  className="h-10 px-4 rounded-[2rem] bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Switch
                </Button>
                <Button
                  size="sm"
                  onClick={isCameraOn ? stopCamera : () => startCamera({ nextFacingMode: facingMode, autoStartPose: true })}
                  className="h-10 px-6 rounded-[2rem] bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center min-w-[120px]"
                >
                  <BlurText
                    key={isCameraOn ? "on" : "off"}
                    text={isCameraOn ? "Off" : "Capture Form"}
                    delay={40}
                    animateBy="letters"
                    direction="top"
                    className="flex justify-center"
                  />
                </Button>
              </div>
            </div>

            {/* Status badges - hide on mobile */}
            <div className="absolute bottom-4 left-4 hidden md:flex flex-wrap gap-2 text-xs">
              <span
                className={`rounded-full border border-white/10 px-3 py-1 font-bold ${isCameraOn ? "bg-emerald-500/20 text-emerald-200" : "bg-white/5 text-slate-400"
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

            {/* Mobile Recording Controls - Floating bottom-left */}
            {isMobile && isCameraOn && (
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
                <button
                  onClick={startRecording}
                  disabled={!isCameraOn || isRecording}
                  className={`h-9 px-3 rounded-full backdrop-blur-md font-bold text-[10px] uppercase tracking-wider transition-all flex items-center ${isRecording
                    ? "bg-white/10 text-slate-500"
                    : "bg-rose-500/30 text-rose-200 active:bg-rose-500/50"
                    }`}
                >
                  <div className={`h-2 w-2 rounded-full mr-1.5 ${isRecording ? "bg-slate-500" : "bg-rose-400 animate-pulse"}`} />
                  {isRecording ? "Rec..." : "Rec"}
                </button>
                <button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className={`h-9 w-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${isRecording
                    ? "bg-white/20 text-white active:bg-white/30"
                    : "bg-white/10 text-slate-500"
                    }`}
                >
                  <Square className="h-3 w-3" />
                </button>
                {recordedUrl && !isRecording && (
                  <a
                    className="h-9 w-9 rounded-full bg-emerald-500/30 backdrop-blur-md text-emerald-200 flex items-center justify-center"
                    href={recordedUrl}
                    download={`fitfindr-ai-recording.${recordedType.includes("mp4") ? "mp4" : "webm"}`}
                  >
                    <Download className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`border-t border-white/10 bg-slate-900/80 ${isMobile ? 'flex-1 border-t-0 p-0' : ''}`}>
          <div className={`mx-auto w-full max-w-6xl ${isMobile ? 'px-2 py-0' : 'px-4 py-6'}`}>
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
            {analysisError && (
              <div className="mb-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs text-blue-200">
                {analysisError}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <BlurText
                  text="AI Interpretation"
                  className="text-lg font-black flex"
                  delay={50}
                  animateBy="words"
                  direction="top"
                />
                <p className="mt-2 text-sm text-slate-400">{REVIEW_COPY[displayStatus]}</p>
                <p className="mt-2 text-xs text-slate-500">Captured frames: {captureCount}</p>

                {poseStatus === "running" && landmarks.length > 0 && (
                  <div className="mt-4 hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4 lg:block">
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
                {exerciseSelection && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={exerciseSelection.id || exerciseSelection.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 space-y-3"
                    >
                      {/* User Request */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                      >
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">You</p>
                        <BlurText
                          text={`Help me with ${exerciseSelection.name}`}
                          className="text-sm text-slate-200"
                          delay={40}
                          animateBy="words"
                          direction="top"
                        />
                      </motion.div>

                      {/* AI Response or Typing */}
                      {(chatSequence === "loading" || chatSequence === "complete") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4"
                        >
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-2">
                            FitFindr AI
                          </p>

                          {chatSequence === "loading" ? (
                            <div className="flex gap-1.5 py-2">
                              <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                                className="h-1.5 w-1.5 rounded-full bg-blue-400"
                              />
                              <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                className="h-1.5 w-1.5 rounded-full bg-blue-400"
                              />
                              <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                className="h-1.5 w-1.5 rounded-full bg-blue-400"
                              />
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <BlurText
                                text={`Welcome to FitFinder AI! You selected ${exerciseSelection.name} — great choice!`}
                                className="text-sm text-blue-50 mb-3"
                                delay={50}
                                animateBy="words"
                                direction="top"
                                onAnimationComplete={() => setIsTypewriterComplete(true)}
                              />

                              {isTypewriterComplete && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  {exerciseSelection.source === "list" ? (
                                    <>
                                      <p className="text-sm text-blue-100/80 mb-3">
                                        Here are the example images for this exercise:
                                      </p>
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        <button
                                          onClick={() =>
                                            setLightboxImage({
                                              url: `/exercises/${exerciseSelection.id}/images/0.jpg`,
                                              title: "Starting Position",
                                            })
                                          }
                                          className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/20 px-3 py-2 text-xs font-bold text-blue-100 hover:bg-blue-500/30 transition-all"
                                        >
                                          📷 Starting Position
                                        </button>
                                        <button
                                          onClick={() =>
                                            setLightboxImage({
                                              url: `/exercises/${exerciseSelection.id}/images/1.jpg`,
                                              title: "End Position",
                                            })
                                          }
                                          className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/20 px-3 py-2 text-xs font-bold text-blue-100 hover:bg-blue-500/30 transition-all"
                                        >
                                          📷 End Position
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-xs text-blue-200/60 italic mb-3">
                                      No specific images available for custom exercises.
                                    </p>
                                  )}

                                  <p className="text-[10px] uppercase tracking-widest text-blue-200/40 font-bold">
                                    Record your form and tap "Review" when ready.
                                  </p>
                                </motion.div>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}

                {(analysisStatus !== "idle" || analysisText || analysisError) && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">You</p>
                      <p className="text-sm text-slate-200">{analysisRequest || buildAnalysisRequest()}</p>
                    </div>
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-2">
                        FitFindr AI
                      </p>
                      {isReviewBusy && (
                        <div className="flex items-center gap-2 text-sm text-blue-100">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Reviewing your form...
                        </div>
                      )}
                      {!isReviewBusy && analysisText && (
                        <p className="text-sm text-blue-50 whitespace-pre-wrap">{analysisText}</p>
                      )}
                      {!isReviewBusy && !analysisText && analysisStatus === "needs_capture" && (
                        <p className="text-sm text-blue-100">
                          Record a clip with pose tracking so the AI can analyze your form.
                        </p>
                      )}
                      {!isReviewBusy && !analysisText && analysisStatus === "error" && (
                        <p className="text-sm text-blue-100">{analysisError || "Analysis failed. Try again."}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={`flex flex-col ${isMobile ? 'gap-2' : 'gap-4'} h-full justify-end pb-safe`}>

                {/* Mobile Unified Control Panel */}
                {isMobile ? (
                  <div className="flex-1 flex flex-col justify-end gap-2 px-1">
                    {/* Exercise Selection (Compact) */}
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 backdrop-blur-xl p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30">
                            {exerciseSelection ? (
                              <Check className="h-4 w-4 text-blue-400" />
                            ) : (
                              <Dumbbell className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {exerciseSelection ? exerciseSelection.name : "Select Exercise"}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setIsExerciseModalOpen(true)}
                          className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          {exerciseSelection ? "Change" : "Select"}
                        </Button>
                      </div>
                    </div>

                    {/* Actions (Compact) removed as requested - using top overlay button */}
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 backdrop-blur-xl p-3">
                      <div className="flex flex-col gap-2">
                        {isPackageReady && (
                          <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                            AI Form package ready
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleSendForReview}
                            disabled
                            className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isReviewBusy ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Reviewing...
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5">
                                <Send className="h-3.5 w-3.5" />
                                Review
                              </span>
                            )}
                          </Button>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                            Coming soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Desktop Layout - Unchanged */}
                    {/* Exercise Selection Card */}
                    <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                        Exercise Selection
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30">
                            {exerciseSelection ? (
                              <Check className="h-5 w-5 text-blue-400" />
                            ) : (
                              <Dumbbell className="h-5 w-5 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">
                              {exerciseSelection ? exerciseSelection.name : "No exercise selected"}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                              {exerciseSelection ? "Selected" : "Tap to choose"}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setIsExerciseModalOpen(true)}
                          className="h-12 px-5 rounded-[1.5rem] bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          {exerciseSelection ? "Change" : "Select"}
                        </Button>
                      </div>
                    </div>

                    {/* Recording Controls Card - Desktop only */}
                    <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                        Recording
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={startRecording}
                          disabled={!isCameraOn || isRecording}
                          className={`flex-1 h-12 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all ${isRecording
                            ? "bg-white/5 border border-white/10 text-slate-500"
                            : "bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
                            }`}
                        >
                          <div className={`h-3 w-3 rounded-full mr-2 ${isRecording ? "bg-slate-500" : "bg-rose-400 animate-pulse"}`} />
                          Start
                        </Button>
                        <Button
                          onClick={stopRecording}
                          disabled={!isRecording}
                          className={`flex-1 h-12 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all ${isRecording
                            ? "bg-slate-700 border border-slate-600 text-white hover:bg-slate-600"
                            : "bg-white/5 border border-white/10 text-slate-500"
                            }`}
                        >
                          <Square className="h-3 w-3 mr-2" />
                          Stop
                        </Button>
                      </div>
                      {isRecording && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-rose-300">
                          <div className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                          Recording in progress...
                        </div>
                      )}
                      {recordedUrl && !isRecording && (
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2">
                          <span className="text-xs font-bold text-emerald-300">Clip ready</span>
                          <a
                            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
                            href={recordedUrl}
                            download={`fitfindr-ai-recording.${recordedType.includes("mp4") ? "mp4" : "webm"}`}
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions Card - Logic moved to top overlay toggle */}
                    <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
                        Analysis
                      </p>

                      {isPackageReady && (
                        <div className="mb-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                          AI Form package ready
                        </div>
                      )}

                      <div className="flex gap-3">
                        <div className="flex items-center gap-4 w-full">
                          <Button
                            onClick={handleSendForReview}
                            disabled
                            className="flex-1 h-14 rounded-[2rem] bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isReviewBusy ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Reviewing...
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                Review Form
                              </span>
                            )}
                          </Button>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">
                            Coming soon
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Live Landmark Preview (Desktop only) */}
                {!isMobile && poseStatus === "running" && landmarks.length > 0 && (
                  <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                      Live Landmarks
                    </p>
                    <div className="grid gap-2 text-xs text-slate-300 grid-cols-2">
                      {landmarks.slice(0, 6).map((point, index) => (
                        <div key={`${point.x}-${point.y}-${index}`} className="rounded-xl bg-white/5 border border-white/10 p-2">
                          <span className="font-bold text-blue-400">#{index}</span>{" "}
                          <span className="text-slate-500">x:</span>{point.x.toFixed(2)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExerciseImageLightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
