import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://opick.ggwp.kr"),
  title: { default: "OP PICK LAB", template: "%s | OP PICK LAB" },
  description: "오버워치 영웅 정보, 카운터 픽과 궁극기 조합을 빠르게 확인하는 비공식 팬 가이드입니다.",
  openGraph: {
    title: "OP PICK LAB · 오버워치 픽 연구소",
    description: "픽은 빠르게, 판단은 정확하게. 영웅 상성과 조합을 한눈에 확인하세요.",
    url: "https://opick.ggwp.kr",
    siteName: "OP PICK LAB",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "OP PICK LAB · 오버워치 픽 연구소" }],
  },
  twitter: { card: "summary_large_image", title: "OP PICK LAB · 오버워치 픽 연구소", description: "픽은 빠르게, 판단은 정확하게.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <footer className="legal-footer">
          Overwatch는 Blizzard Entertainment, Inc.의 상표입니다.
        </footer>
      </body>
    </html>
  );
}
