import type { Metadata } from "next";
import Link from "next/link";
import { ADSENSE_CLIENT, adsEnabled, HOUSE_AD } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://opick.ggwp.kr"),
  verification: { other: { "naver-site-verification": "a6206b13c8339010c848c87480415de893ed6f77" } },
  title: { default: "OP PICK LAB | 오버워치 영웅 상성·카운터 픽·맵별 추천", template: "%s | OP PICK LAB" },
  description: "오버워치 영웅 정보, 카운터 픽과 궁극기 조합을 빠르게 확인하는 비공식 팬 가이드입니다.",
  applicationName: "OP PICK LAB",
  authors: [{ name: "OP PICK LAB" }],
  creator: "OP PICK LAB",
  publisher: "OP PICK LAB",
  robots: { index: true, follow: true },
  openGraph: {
    title: "OP PICK LAB · 오버워치 픽 연구소",
    description: "픽은 빠르게, 판단은 정확하게. 영웅 상성과 조합을 한눈에 확인하세요.",
    url: "https://opick.ggwp.kr",
    siteName: "OP PICK LAB",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "OP PICK LAB · 오버워치 픽 연구소" }],
  },
  ...(adsEnabled ? { other: { "google-adsense-account": ADSENSE_CLIENT } } : {}),
  twitter: { card: "summary_large_image", title: "OP PICK LAB · 오버워치 픽 연구소", description: "픽은 빠르게, 판단은 정확하게.", images: ["/og.jpg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={HOUSE_AD ? "ads-enabled" : undefined}>
        <link rel="alternate" type="application/rss+xml" title="OP PICK LAB 패치 변경 정리" href="/feed.xml" />
        {/* Auto ads: React hoists this async script into <head>, where AdSense review looks for it. */}
        {adsEnabled && <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} crossOrigin="anonymous" />}
        {children}
        <footer className="legal-footer">
          <p>OP PICK LAB은 Blizzard Entertainment와 제휴하거나 보증을 받지 않은 비공식 팬 사이트입니다. Overwatch와 Blizzard Entertainment는 미국 및 기타 국가에서 Blizzard Entertainment, Inc.의 상표 또는 등록 상표입니다. 영웅 이미지·아이콘·영상 등 게임 콘텐츠의 저작권은 Blizzard Entertainment, Inc.에 있습니다.</p>
          <p lang="en">Overwatch is a trademark or registered trademark of Blizzard Entertainment, Inc. in the U.S. and/or other countries. Game content and materials © Blizzard Entertainment, Inc. OP PICK LAB is not affiliated with or endorsed by Blizzard Entertainment.</p>
          <p><Link href="/privacy/">개인정보처리방침</Link> · <Link href="/sources/#copyright">저작권·자료 출처</Link> · <a href="/THIRD_PARTY_NOTICES.txt">오픈소스 라이선스</a></p>
        </footer>
      </body>
    </html>
  );
}
