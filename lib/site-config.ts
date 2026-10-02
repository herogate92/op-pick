// AdSense publisher ID ("ca-pub-" + 16 digits). While empty, no ad script, ownership meta tag or
// ads.txt seller line is published; setting it turns on Auto ads site-wide.
export const ADSENSE_CLIENT: string = "";
// Public contact shown in the privacy policy.
export const CONTACT_EMAIL = "www.ggwp.kr@gmail.com";

if (ADSENSE_CLIENT && !/^ca-pub-\d{16}$/.test(ADSENSE_CLIENT)) throw new Error(`ADSENSE_CLIENT 형식 오류: ${ADSENSE_CLIENT}`);
export const adsEnabled = ADSENSE_CLIENT !== "";

// House ad shown in the reserved ad slots (banner, side rail, mobile). null hides every slot again.
export type HouseAd = { href: string; label: string; title: string; subtitle: string; description: string; features: string[]; cta: string };
export const HOUSE_AD: HouseAd | null = {
  href: "https://rush.ggwp.kr/",
  label: "운영자 추천",
  title: "Overwatch Rush",
  subtitle: "비공식 브라우저 팬 게임",
  description: "오버워치 영웅으로 즐기는 4대4 거점전·화물 호위. 설치 없이 브라우저에서 바로 플레이하세요.",
  features: ["AI 아군과 솔로 플레이", "온라인 방에서 친구와 대전", "거점전·화물 호위 전장"],
  cta: "지금 플레이",
};
