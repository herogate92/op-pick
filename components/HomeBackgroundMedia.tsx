"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBackgroundVideoAllowed } from "@/lib/use-background-video";
import { season } from "@/lib/season";

type Player = { destroy(): void; mute(): void; playVideo(): void; pauseVideo(): void };
type YouTubeAPI = { Player: new (element: HTMLElement, options: {
  host: string; videoId: string; playerVars: Record<string, string | number>;
  events: { onReady(event: { target: Player }): void; onStateChange(event: { data: number }): void; onError(): void; onAutoplayBlocked(): void };
}) => Player };
type YouTubeWindow = Window & { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void };

let apiPromise: Promise<YouTubeAPI> | undefined;
function loadYouTubeAPI() {
  const youtubeWindow = window as YouTubeWindow;
  if (youtubeWindow.YT?.Player) return Promise.resolve(youtubeWindow.YT);
  if (!apiPromise) apiPromise = new Promise<YouTubeAPI>((resolve, reject) => {
    const previousReady = youtubeWindow.onYouTubeIframeAPIReady;
    youtubeWindow.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (youtubeWindow.YT) resolve(youtubeWindow.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => { apiPromise = undefined; reject(new Error("YouTube API unavailable")); };
    document.head.appendChild(script);
  });
  return apiPromise;
}

export function HomeBackgroundMedia({ poster }: { poster?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const allowVideo = useBackgroundVideoAllowed();

  useEffect(() => {
    if (!allowVideo || !mountRef.current) return;
    const mount = mountRef.current;
    let disposed = false;
    let player: Player | undefined;
    loadYouTubeAPI().then(api => {
      if (disposed) return;
      const element = document.createElement("div");
      mount.appendChild(element);
      player = new api.Player(element, {
        host: "https://www.youtube-nocookie.com",
        videoId: season.videoId,
        playerVars: { autoplay: 1, mute: 1, loop: 1, playlist: season.videoId, controls: 0, disablekb: 1, fs: 0, playsinline: 1, rel: 0, origin: window.location.origin },
        events: {
          onReady: ({ target }) => { if (!disposed) { target.mute(); target.playVideo(); } },
          onStateChange: ({ data }) => { if (!disposed) setIsPlaying(data === 1); },
          onError: () => { if (!disposed) setIsPlaying(false); },
          onAutoplayBlocked: () => { if (!disposed) setIsPlaying(false); },
        },
      });
      playerRef.current = player;
      const iframe = mount.querySelector("iframe");
      if (iframe) { iframe.title = "5시즌 배경 영상"; iframe.tabIndex = -1; }
    }).catch(() => { if (!disposed) setIsPlaying(false); });
    return () => { disposed = true; player?.destroy(); playerRef.current = null; mount.replaceChildren(); };
  }, [allowVideo, attempt]);

  function toggleVideo() {
    if (isPlaying) { playerRef.current?.pauseVideo(); setIsPlaying(false); }
    else if (playerRef.current) playerRef.current.playVideo();
    else setAttempt(value => value + 1);
  }

  return <>
    <div className="home-background-media" aria-hidden="true">
      <div className="home-background-poster" style={poster ? { backgroundImage: `url(${poster})` } : undefined} />
      <div ref={mountRef} className={`home-background-player${allowVideo && isPlaying ? " is-playing" : ""}`} />
    </div>
    {allowVideo && <button type="button" className="home-video-toggle" onClick={toggleVideo} aria-label={isPlaying ? "배경 영상 중지" : "배경 영상 재생"} aria-pressed={isPlaying}>
      {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}<span>{isPlaying ? "영상 중지" : "영상 재생"}</span>
    </button>}
  </>;
}
