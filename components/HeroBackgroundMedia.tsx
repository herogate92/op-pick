"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";

export function HeroBackgroundMedia({
  videoId,
  directVideo,
  poster,
  heroName,
}: {
  videoId?: string;
  directVideo?: { thumbnail: string; mp4: string; webm: string };
  poster?: string;
  heroName: string;
}) {
  const hasVideo = Boolean(videoId || directVideo?.mp4 || directVideo?.webm);
  const [isPlaying, setIsPlaying] = useState(hasVideo);
  const videoUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&rel=0&modestbranding=1&cc_load_policy=0`
    : undefined;

  return (
    <>
      <div className="hero-background-media" aria-hidden="true">
        <div
          className="hero-background-poster"
          style={poster ? { backgroundImage: `url(${poster})` } : undefined}
        />
        {isPlaying && videoUrl && (
          <iframe
            className="hero-background-youtube"
            src={videoUrl}
            title=""
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
          />
        )}
        {isPlaying && !videoUrl && directVideo && (
          <video
            className="hero-background-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={directVideo.thumbnail}
          >
            <source src={directVideo.webm} type="video/webm" />
            <source src={directVideo.mp4} type="video/mp4" />
          </video>
        )}
      </div>
      {hasVideo && (
        <button
          type="button"
          className="hero-video-toggle"
          onClick={() => setIsPlaying((playing) => !playing)}
          aria-label={isPlaying ? `${heroName} 배경 영상 중지` : `${heroName} 배경 영상 재생`}
          aria-pressed={!isPlaying}
        >
          {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          <span>{isPlaying ? "영상 중지" : "영상 재생"}</span>
        </button>
      )}
    </>
  );
}
