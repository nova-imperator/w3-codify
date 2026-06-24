"use client";

import * as React from "react";

/**
 * Video player that remembers where you left off (bug-fix round 1, #10).
 *
 * Persistence: localStorage keyed by lesson (lesson ids are globally unique
 * cuids, so this is effectively per user+lesson on a given device). We save the
 * current playback position throttled (~5s), on pause, and on unmount, then
 * seek back to it on load — so navigating away and back no longer restarts at 0.
 *
 * Two transports:
 *  - Native <video> (e.g. an .mp4 / same-origin source): we read & set
 *    `currentTime` directly.
 *  - YouTube embed (youtube / youtube-nocookie /embed/): cross-origin iframes
 *    don't expose currentTime, so we use the YouTube IFrame API over
 *    postMessage — listen for time updates, and `seekTo` on load. We also append
 *    `start=<seconds>` to the src as a no-JS fallback resume.
 */

const SAVE_THROTTLE_MS = 5000;
const MIN_RESUME_SEC = 3; // ignore trivially-small positions
// Don't resume if we're within this many seconds of the end (treat as finished).
const END_GUARD_SEC = 10;

function storageKey(lessonId: string) {
  return `w3c:video:${lessonId}`;
}

function loadSaved(lessonId: string): number {
  try {
    const raw = localStorage.getItem(storageKey(lessonId));
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n > MIN_RESUME_SEC ? n : 0;
  } catch {
    return 0;
  }
}

function save(lessonId: string, seconds: number) {
  try {
    if (seconds > MIN_RESUME_SEC) {
      localStorage.setItem(storageKey(lessonId), String(Math.floor(seconds)));
    }
  } catch {
    /* storage full / unavailable */
  }
}

function isYouTube(url: string) {
  return /(?:youtube\.com|youtube-nocookie\.com)\/embed\//.test(url);
}

/** Adds the params the IFrame API + resume fallback need, idempotently. */
function youTubeSrc(url: string, startSec: number) {
  try {
    const u = new URL(url);
    u.searchParams.set("enablejsapi", "1");
    if (startSec > MIN_RESUME_SEC) u.searchParams.set("start", String(Math.floor(startSec)));
    return u.toString();
  } catch {
    return url;
  }
}

export function ResumableVideo({
  lessonId,
  src,
  title,
  className,
}: {
  lessonId: string;
  src: string;
  title: string;
  className?: string;
}) {
  if (isYouTube(src)) {
    return <YouTubeResume lessonId={lessonId} src={src} title={title} className={className} />;
  }
  return <NativeResume lessonId={lessonId} src={src} title={title} className={className} />;
}

function NativeResume({
  lessonId,
  src,
  title,
  className,
}: {
  lessonId: string;
  src: string;
  title: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const lastSaved = React.useRef(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const resumeAt = loadSaved(lessonId);
    const seek = () => {
      if (resumeAt > 0 && el.duration && resumeAt < el.duration - END_GUARD_SEC) {
        try {
          el.currentTime = resumeAt;
        } catch {
          /* not seekable yet */
        }
      }
    };
    if (el.readyState >= 1) seek();
    else el.addEventListener("loadedmetadata", seek, { once: true });

    const persist = () => save(lessonId, el.currentTime);
    const onTime = () => {
      const now = Date.now();
      if (now - lastSaved.current >= SAVE_THROTTLE_MS) {
        lastSaved.current = now;
        persist();
      }
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("pause", persist);
    return () => {
      el.removeEventListener("loadedmetadata", seek);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("pause", persist);
      persist(); // on unmount
    };
  }, [lessonId]);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video ref={ref} src={src} controls playsInline className={className} title={title} />
  );
}

function YouTubeResume({
  lessonId,
  src,
  title,
  className,
}: {
  lessonId: string;
  src: string;
  title: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLIFrameElement>(null);
  // Resolve the resume position once per mount so the src (and the `start=`
  // fallback) is stable.
  const [resumeAt] = React.useState(() => loadSaved(lessonId));
  const lastSaved = React.useRef(0);
  const currentRef = React.useRef(resumeAt);

  const post = React.useCallback((func: string, args: unknown[] = []) => {
    ref.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  }, []);

  React.useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (!ref.current || e.source !== ref.current.contentWindow) return;
      let data: unknown;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      const d = data as { event?: string; info?: { currentTime?: number } };
      if (d?.event === "onReady") {
        // Tell the player to start sending time updates, then seek to resume.
        post("addEventListener", ["onStateChange"]);
        if (resumeAt > MIN_RESUME_SEC) post("seekTo", [resumeAt, true]);
      } else if (d?.event === "infoDelivery" && typeof d.info?.currentTime === "number") {
        const t = d.info.currentTime;
        currentRef.current = t;
        const now = Date.now();
        if (now - lastSaved.current >= SAVE_THROTTLE_MS) {
          lastSaved.current = now;
          save(lessonId, t);
        }
      }
    }
    window.addEventListener("message", onMsg);

    // Some browsers don't fire onReady until we "listen"; nudge the player.
    const listening = setInterval(() => {
      ref.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: lessonId }),
        "*",
      );
    }, 1000);

    return () => {
      window.removeEventListener("message", onMsg);
      clearInterval(listening);
      save(lessonId, currentRef.current); // on unmount
    };
  }, [lessonId, resumeAt, post]);

  return (
    <iframe
      ref={ref}
      src={youTubeSrc(src, resumeAt)}
      className={className}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
