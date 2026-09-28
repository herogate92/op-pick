"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

// Phones get the native share sheet (Discord, KakaoTalk); elsewhere the link is copied, with a
// selectable field when clipboard access is refused.
export function ShareButton({ title, path }: { title: string; path: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const [url, setUrl] = useState("");
  const share = async () => {
    const link = new URL(path, window.location.origin).href;
    setUrl(link);
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ title, url: link }); return; } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("manual");
    }
  };
  return (
    <span className="share-control">
      <button type="button" className="share-button" onClick={share}>
        {status === "copied" ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
        {status === "copied" ? "링크 복사됨" : "링크 공유"}
      </button>
      <span className="sr-only" role="status">{status === "copied" ? "링크를 복사했습니다." : ""}</span>
      {status === "manual" && <input className="share-manual" readOnly value={url} aria-label="공유 링크" onFocus={(event) => event.currentTarget.select()} autoFocus />}
    </span>
  );
}
