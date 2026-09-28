"use client";

import { ImageDown } from "lucide-react";
import { useState } from "react";
import type { Role } from "@/lib/data";
import { roleLabels } from "@/lib/labels";

export type TierImageRow = { tier: string; roles: Record<Role, string[]> };

const roles: Role[] = ["tank", "damage", "support"];
const tierColors: Record<string, string> = { S: "#ff6a2a", A: "#ffb547", B: "#6df4ff", C: "#8ea0b7" };
const roleColors: Record<Role, string> = { tank: "#5fd4ff", damage: "#ff7153", support: "#5af0bd" };
const fontFamily = '"Pretendard", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
const width = 1200, pad = 48, labelWidth = 104, gap = 12, lineHeight = 34;

function wrapNames(ctx: CanvasRenderingContext2D, names: string[], maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const name of names) {
    const next = line ? `${line} · ${name}` : name;
    if (line && ctx.measureText(next).width > maxWidth) { lines.push(line); line = name; } else line = next;
  }
  return line ? [...lines, line] : ["—"];
}

// Portraits live on Blizzard's CDN and would taint the canvas, so the image is names only.
function drawTierImage(title: string, subtitle: string, footer: string, rows: TierImageRow[]) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const columnWidth = (width - pad * 2 - labelWidth - gap * 3) / 3;
  ctx.font = `600 22px ${fontFamily}`;
  const layout = rows.map((row) => {
    const lines = Object.fromEntries(roles.map((role) => [role, wrapNames(ctx, row.roles[role], columnWidth - 28)])) as Record<Role, string[]>;
    return { row, lines, height: Math.max(84, Math.max(...roles.map((role) => lines[role].length)) * lineHeight + 36) };
  });
  const top = 190;
  canvas.width = width;
  canvas.height = top + layout.reduce((sum, item) => sum + item.height + gap, 0) + 86;

  ctx.fillStyle = "#070d1c"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#6df4ff"; ctx.font = `800 18px ${fontFamily}`; ctx.fillText("OP PICK LAB", pad, 62);
  ctx.fillStyle = "#f6f9ff"; ctx.font = `800 44px ${fontFamily}`; ctx.fillText(title, pad, 114);
  ctx.fillStyle = "#aab6c9"; ctx.font = `500 20px ${fontFamily}`; ctx.fillText(subtitle, pad, 150);
  roles.forEach((role, index) => {
    ctx.fillStyle = roleColors[role]; ctx.font = `800 18px ${fontFamily}`;
    ctx.fillText(roleLabels[role], pad + labelWidth + gap + index * (columnWidth + gap) + 14, top - 12);
  });

  let y = top;
  for (const { row, lines, height } of layout) {
    ctx.fillStyle = tierColors[row.tier] ?? "#3a4a60"; ctx.fillRect(pad, y, labelWidth, height);
    ctx.fillStyle = tierColors[row.tier] ? "#070d1c" : "#aab6c9"; ctx.font = `900 ${row.tier.length > 1 ? 24 : 44}px ${fontFamily}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(row.tier, pad + labelWidth / 2, y + height / 2);
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    roles.forEach((role, index) => {
      const x = pad + labelWidth + gap + index * (columnWidth + gap);
      ctx.fillStyle = "#0f1d32"; ctx.fillRect(x, y, columnWidth, height);
      ctx.fillStyle = roleColors[role]; ctx.fillRect(x, y, 3, height);
      ctx.fillStyle = lines[role][0] === "—" ? "#4d5d73" : "#f6f9ff"; ctx.font = `600 22px ${fontFamily}`;
      lines[role].forEach((text, lineIndex) => ctx.fillText(text, x + 14, y + 42 + lineIndex * lineHeight));
    });
    y += height + gap;
  }
  ctx.fillStyle = "#6f8098"; ctx.font = `500 17px ${fontFamily}`;
  ctx.fillText(footer, pad, canvas.height - 44);
  ctx.fillStyle = "#6df4ff"; ctx.font = `800 20px ${fontFamily}`; ctx.textAlign = "right";
  ctx.fillText("opick.ggwp.kr/tier", width - pad, canvas.height - 44);
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("toBlob")), "image/png"));
}

export function TierImageButton({ title, subtitle, footer, rows, fileName }: { title: string; subtitle: string; footer: string; rows: TierImageRow[]; fileName: string }) {
  const [state, setState] = useState<"idle" | "busy" | "failed">("idle");
  const save = async () => {
    setState("busy");
    try {
      const blob = await drawTierImage(title, subtitle, footer, rows);
      const file = new File([blob], fileName, { type: "image/png" });
      if (window.matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title }); setState("idle"); return; } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") { setState("idle"); return; }
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = fileName; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setState("idle");
    } catch {
      setState("failed");
    }
  };
  return (
    <button type="button" className="share-button" onClick={save} disabled={state === "busy"}>
      <ImageDown aria-hidden="true" />{state === "busy" ? "이미지 만드는 중" : state === "failed" ? "이미지 저장 실패 · 다시 시도" : "이미지로 저장"}
    </button>
  );
}
