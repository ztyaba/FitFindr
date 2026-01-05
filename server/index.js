import "dotenv/config";
import express from "express";
import multer from "multer";
import JSZip from "jszip";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "../dist");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "";
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
const MAX_DURATION_SECONDS = 30;
const MAX_LANDMARK_FRAMES = 80;
const TEXT_ONLY_FRAMES = 24;
const MAX_RETRIES = 2;
const VIDEO_MIME_ALLOWLIST = new Set(["video/mp4"]);

const getVideoMimeType = (filename, fallback) => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  return fallback || "application/octet-stream";
};

const extractResponseText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text).filter(Boolean).join("\n").trim();
};

const downsampleFrames = (frames, maxFrames) => {
  if (!Array.isArray(frames) || frames.length <= maxFrames) {
    return { frames, downsampled: false };
  }
  const step = Math.ceil(frames.length / maxFrames);
  const sampled = frames.filter((_, index) => index % step === 0);
  return { frames: sampled, downsampled: true };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildGeminiRequest = ({
  promptText,
  landmarksBuffer,
  landmarksJson,
  videoBuffer,
  videoMimeType,
  includeVideo = true,
}) => {
  const exerciseName = landmarksJson?.exercise?.name || "Unknown";
  const exerciseFolder = landmarksJson?.exercise?.folder || landmarksJson?.exercise?.id || null;
  const duration = landmarksJson?.capture?.durationSeconds;
  const frameCount = landmarksJson?.frames?.length ?? landmarksJson?.capture?.landmarkCount ?? 0;

  const summaryLines = [
    `Exercise selection: ${exerciseName}`,
    exerciseFolder ? `Exercise image folder: ${exerciseFolder}` : null,
    duration ? `Capture duration: ${duration}s` : null,
    `Frames captured: ${frameCount}`,
  ].filter(Boolean);

  return {
    systemInstruction: {
      parts: [{ text: promptText }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `AI analysis package summary:\n${summaryLines.join("\n")}\n\nUse the attached landmarks JSON${
              includeVideo ? " and video." : ". Video unavailable; follow the prompt's no-video guidance."
            }`,
          },
          {
            inlineData: {
              mimeType: "application/json",
              data: landmarksBuffer.toString("base64"),
            },
          },
          ...(includeVideo
            ? [
                {
                  inlineData: {
                    mimeType: videoMimeType,
                    data: videoBuffer.toString("base64"),
                  },
                },
              ]
            : []),
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  };
};

const buildTextOnlyRequest = ({ promptText, landmarksJson, includeVideoNote }) => {
  const frames = Array.isArray(landmarksJson.frames) ? landmarksJson.frames : [];
  const { frames: sampledFrames } = downsampleFrames(frames, TEXT_ONLY_FRAMES);
  const minimalPayload = {
    ...landmarksJson,
    frames: sampledFrames,
    analysis: {
      ...(landmarksJson.analysis || {}),
      sentFrameCount: sampledFrames.length,
      textOnlyFallback: true,
    },
  };

  const summary = [
    "AI analysis package summary:",
    `Exercise selection: ${landmarksJson?.exercise?.name || "Unknown"}`,
    landmarksJson?.exercise?.folder
      ? `Exercise image folder: ${landmarksJson.exercise.folder}`
      : null,
    landmarksJson?.capture?.durationSeconds
      ? `Capture duration: ${landmarksJson.capture.durationSeconds}s`
      : null,
    `Frames captured: ${frames.length}`,
    includeVideoNote ? "Video omitted due to unsupported format or errors." : null,
    "Landmarks JSON (trimmed):",
    JSON.stringify(minimalPayload),
  ].filter(Boolean);

  return {
    systemInstruction: {
      parts: [{ text: promptText }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: summary.join("\n"),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  };
};

const callGemini = async ({ apiKey, model, requestBody }) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  const responseData = await response.json().catch(() => ({}));
  return { response, responseData };
};

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/ai/models", async (_req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY on the server." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || "Failed to list Gemini models.";
      return res.status(response.status).json({ error: message });
    }

    const models = (data.models || []).map((model) => ({
      name: model.name,
      displayName: model.displayName,
      supportedGenerationMethods: model.supportedGenerationMethods,
    }));
    res.json({ models });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while listing models." });
  }
});

app.post("/api/ai/interpret", upload.single("package"), async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY on the server.", model: GEMINI_MODEL });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No AI package uploaded.", model: GEMINI_MODEL });
    }

    const zip = await JSZip.loadAsync(req.file.buffer);
    const promptFile = zip.file("prompt.json");
    const landmarksFile = zip.file("landmarks.json");
    const videoFile = Object.values(zip.files).find(
      (file) => !file.dir && file.name.startsWith("video.")
    );

    if (!promptFile || !landmarksFile || !videoFile) {
      return res.status(400).json({
        error: "AI package is missing prompt.json, landmarks.json, or video.*",
        model: GEMINI_MODEL,
      });
    }

    const promptJson = JSON.parse(await promptFile.async("string"));
    const promptText = promptJson?.prompt;
    if (!promptText) {
      return res.status(400).json({ error: "prompt.json is missing prompt text.", model: GEMINI_MODEL });
    }

    const landmarksBuffer = await landmarksFile.async("nodebuffer");
    const landmarksJson = JSON.parse(landmarksBuffer.toString("utf-8"));
    const originalFrames = Array.isArray(landmarksJson.frames) ? landmarksJson.frames : [];
    const { frames: sampledFrames, downsampled } = downsampleFrames(
      originalFrames,
      MAX_LANDMARK_FRAMES
    );
    const trimmedLandmarksJson = {
      ...landmarksJson,
      frames: sampledFrames,
      analysis: {
        ...(landmarksJson.analysis || {}),
        originalFrameCount: originalFrames.length,
        sentFrameCount: sampledFrames.length,
        downsampled,
      },
    };

    const captureDuration = landmarksJson?.capture?.durationSeconds;
    if (captureDuration && captureDuration > MAX_DURATION_SECONDS + 0.5) {
      return res.status(400).json({
        error: `Capture exceeds ${MAX_DURATION_SECONDS} seconds. Record a shorter clip.`,
        model: GEMINI_MODEL,
      });
    }

    const videoBuffer = await videoFile.async("nodebuffer");
    if (videoBuffer.length > MAX_VIDEO_BYTES) {
      return res.status(413).json({
        error: "Video file is too large for Gemini. Record a shorter clip.",
        model: GEMINI_MODEL,
      });
    }

    const videoMimeType = getVideoMimeType(videoFile.name, landmarksJson?.video?.mimeType);
    const includeVideo = VIDEO_MIME_ALLOWLIST.has(videoMimeType);
    const buildRequestBody = (useVideo) =>
      buildGeminiRequest({
        promptText,
        landmarksBuffer: Buffer.from(JSON.stringify(trimmedLandmarksJson)),
        landmarksJson: trimmedLandmarksJson,
        videoBuffer,
        videoMimeType,
        includeVideo: useVideo,
      });

    const modelsToTry = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL].filter(Boolean);
    let lastError = null;
    let lastModel = GEMINI_MODEL;
    let responseData = null;

    for (const model of modelsToTry) {
      lastModel = model;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        const { response, responseData: data } = await callGemini({
          apiKey,
          model,
          requestBody: buildRequestBody(includeVideo),
        });
        responseData = data;
        if (response.ok) {
          const text = extractResponseText(responseData);
          if (!text) {
            return res
              .status(500)
              .json({ error: "Gemini returned no text response.", model });
          }
          const note = includeVideo
            ? null
            : "Video omitted due to unsupported format (video/webm).";
          return res.json(note ? { text, model, note } : { text, model });
        }

        const message =
          responseData?.error?.message || "Gemini API request failed. Check server logs.";
        console.error(`Gemini error (${model}, attempt ${attempt + 1}):`, message);
        lastError = { status: response.status, message };

        if (response.status >= 500 && attempt === MAX_RETRIES) {
          const retryMessage = responseData?.error?.message || "";
          if (retryMessage.includes("internal error")) {
            if (includeVideo) {
              const fallback = await callGemini({
                apiKey,
                model,
                requestBody: buildRequestBody(false),
              });
              if (fallback.response.ok) {
                const fallbackText = extractResponseText(fallback.responseData);
                if (fallbackText) {
                  return res.json({
                    text: fallbackText,
                    model,
                    note: "Video omitted after repeated internal errors.",
                  });
                }
              }
            }
            const textOnlyFallback = await callGemini({
              apiKey,
              model,
              requestBody: buildTextOnlyRequest({
                promptText,
                landmarksJson: trimmedLandmarksJson,
                includeVideoNote: includeVideo,
              }),
            });
            if (textOnlyFallback.response.ok) {
              const fallbackText = extractResponseText(textOnlyFallback.responseData);
              if (fallbackText) {
                return res.json({
                  text: fallbackText,
                  model,
                  note: "Text-only fallback used due to internal errors.",
                });
              }
            }
          }
        }
        if (response.status < 500 || attempt === MAX_RETRIES) {
          break;
        }
        await sleep(600 * (attempt + 1));
      }
    }

    if (lastError) {
      return res.status(lastError.status || 500).json({
        error: lastError.message,
        model: lastModel,
      });
    }

    const text = extractResponseText(responseData || {});
    if (!text) {
      return res.status(500).json({ error: "Gemini returned no text response.", model: lastModel });
    }
    res.json({ text, model: lastModel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while analyzing the AI package.", model: GEMINI_MODEL });
  }
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

const port = Number(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`FitFindr AI server listening on port ${port} using ${GEMINI_MODEL}`);
});
