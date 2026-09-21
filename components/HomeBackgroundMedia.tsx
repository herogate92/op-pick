"use client";

import { Pause, Play } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const motionQuery = "(min-width: 761px) and (prefers-reduced-motion: no-preference)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const getMotionSnapshot = () => window.matchMedia(motionQuery).matches;
const getServerSnapshot = () => false;

const VIDEO_ID = "5-CS8C2VBWM";
const VIDEO_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&rel=0&modestbranding=1&cc_load_policy=0`;

export function HomeBackgroundMedia({ poster }: { poster?: string }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const allowVideo = useSyncExternalStore(subscribeMotion, getMotionSnapshot, getServerSnapshot);

  return (
    <>
      <div className="home-background-media" aria-hidden="true">
        <div
          className="home-background-poster"
          style={poster ? { backgroundImage: `url(${poster})` } : undefined}
        />
        {allowVideo && isPlaying && (
          <iframe
            className="home-background-youtube"
            src={VIDEO_URL}
            title=""
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
          />
        )}
      </div>
      {allowVideo && <button
        type="button"
        className="home-video-toggle"
        onClick={() => setIsPlaying((playing) => !playing)}
        aria-label={isPlaying ? "배경 영상 중지" : "배경 영상 재생"}
        aria-pressed={!isPlaying}
      >
        {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        <span>{isPlaying ? "영상 중지" : "영상 재생"}</span>
      </button>}
    </>
  );
}
