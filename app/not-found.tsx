import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return <main className="not-found"><SearchX size={56} /><span className="section-kicker">404 · OUT OF RANGE</span><h1>요청한 정보를 찾지 못했습니다</h1><p>영웅 목록으로 돌아가 최신 데이터를 확인해 보세요.</p><Link href="/"><Home size={17} /> 홈으로 돌아가기</Link></main>;
}
