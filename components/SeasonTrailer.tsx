"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { season } from "@/lib/season";

export function SeasonTrailer() {
  const [started, setStarted] = useState(false);
  return <div className="season-video">
    {started ? <iframe
      src={`https://www.youtube-nocookie.com/embed/${season.videoId}?autoplay=1&rel=0&playsinline=1`}
      title={season.videoTitle}
      allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    /> : <button
      type="button"
      className="season-video-preview"
      style={{ backgroundImage: `url(${season.poster})` }}
      onClick={() => setStarted(true)}
      aria-label={`${season.videoTitle} 재생`}
    >
      <span className="season-video-play"><Play aria-hidden="true" /></span>
      <span className="season-video-caption"><small>공식 트레일러</small><strong>5시즌 · {season.title}</strong><span>영상 재생</span></span>
    </button>}
  </div>;
}
