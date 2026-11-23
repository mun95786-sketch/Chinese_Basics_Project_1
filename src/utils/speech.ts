let activeAudio: HTMLAudioElement | null = null;
let playbackToken = 0;
const clientAudioCache = new Map<string, string>();

export interface SpeakCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

function base64ToBlobUrl(base64: string, mimeType: string): string {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function initSpeechVoices() {
  // Audio synthesis is served via /api/tts; keep no-op initializer for compatibility.
}

export function stopChineseSpeech() {
  playbackToken += 1;
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export async function speakChinese(
  text: string,
  rate = 1.0,
  callbacks?: SpeakCallbacks
) {
  stopChineseSpeech();
  const currentToken = playbackToken;
  const speedBucket = rate < 1 ? "slow" : "normal";
  const cacheKey = `${text}::${speedBucket}`;

  callbacks?.onStart?.();

  try {
    let audioUrl = clientAudioCache.get(cacheKey);

    if (!audioUrl) {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, rate }),
      });

      if (currentToken !== playbackToken) {
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.audioBase64) {
        throw new Error(
          typeof data.error === "string" && data.error
            ? data.error
            : "음원을 불러오지 못했습니다."
        );
      }

      audioUrl = base64ToBlobUrl(
        data.audioBase64,
        data.mimeType || "audio/wav"
      );
      clientAudioCache.set(cacheKey, audioUrl);
    }

    if (currentToken !== playbackToken) {
      return;
    }

    const audio = new Audio(audioUrl);
    audio.playbackRate = rate < 1 ? 0.85 : 1.0;
    activeAudio = audio;

    audio.onended = () => {
      if (activeAudio === audio) {
        activeAudio = null;
      }
      if (currentToken === playbackToken) {
        callbacks?.onEnd?.();
      }
    };

    audio.onerror = () => {
      if (activeAudio === audio) {
        activeAudio = null;
      }
      if (currentToken === playbackToken) {
        callbacks?.onError?.("음원 재생 중 오류가 발생했습니다.");
      }
    };

    await audio.play();
  } catch (err) {
    if (currentToken !== playbackToken) {
      return;
    }
    const msg =
      err instanceof Error
        ? err.message
        : "음원 재생에 실패했습니다. 잠시 후 다시 시도해 주세요.";
    callbacks?.onError?.(msg);
  }
}
