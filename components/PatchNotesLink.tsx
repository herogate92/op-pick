import { ExternalLink } from "lucide-react";

export function PatchNotesLink({ className }: { className?: string }) {
  return (
    <a
      href="https://overwatch.blizzard.com/ko-kr/news/patch-notes/"
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="공식 패치노트 (새 탭)"
    >
      공식 패치노트 <ExternalLink size={16} aria-hidden="true" />
    </a>
  );
}
