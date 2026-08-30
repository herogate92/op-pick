import Link from "next/link";
import { Home, MapPinned, Menu, Search, Shield, Sparkles, Swords, UsersRound } from "lucide-react";
import { BrandElectricity } from "@/components/BrandElectricity";
import { heroes } from "@/lib/data";

const navItems = [
  { href: "/", label: "홈", icon: Home, id: "home" },
  { href: "/heroes/", label: "영웅", icon: Shield, id: "heroes" },
  { href: "/maps/", label: "맵별 추천", icon: MapPinned, id: "maps" },
  { href: "/matchups/", label: "상성", icon: Swords, id: "matchups" },
  { href: "/combos/", label: "조합", icon: Sparkles, id: "combos" },
  { href: "/team-builder/", label: "팀 구성", icon: UsersRound, id: "team-builder" },
] as const;

export function SiteHeader({ active }: { active: string }) {
  return (
    <header className="topbar">
      <nav className="primary-nav" aria-label="주요 메뉴">
        {navItems.map(({ href, label, icon: Icon, id }) => (
          <Link key={id} href={href} className={active === id ? "nav-link active" : "nav-link"}><Icon size={17} aria-hidden="true" /><span>{label}</span></Link>
        ))}
      </nav>
      <Link href="/" className="brand" aria-label="OP PICK LAB 홈">
        <BrandElectricity />
        <span className="brand-mark">OP</span><span><strong>OP PICK LAB</strong><small>오버워치 픽 연구소</small></span>
      </Link>
      <div className="top-actions">
        <Link href="/heroes/" className="icon-button" aria-label="영웅 검색"><Search size={20} /></Link>
        <Link href="/sources/" className={active === "sources" ? "update-chip active" : "update-chip"}>영웅 {heroes.length}명 · 안내</Link>
        <Link href="/heroes/" className="menu-button" aria-label="영웅 메뉴 열기"><Menu size={21} /></Link>
      </div>
    </header>
  );
}
