export interface HeroVideo {
  id: string;
  title: string;
  kind: "gameplay" | "intro" | "guide" | "abilities";
}

const NEW_HERO_GAMEPLAY: HeroVideo = {
  id: "20H-MrgQl0A",
  title: "5명의 신규 영웅 게임플레이 트레일러 | 오버워치",
  kind: "gameplay",
};

export const heroVideos: Record<string, HeroVideo> = {
  domina: NEW_HERO_GAMEPLAY,
  doomfist: { id: "e320nRwXyu8", title: "오버워치 2 영웅 가이드: 둠피스트", kind: "guide" },
  ramattra: { id: "TjGANWk9hy0", title: "라마트라 소개 영상 | 오버워치 2", kind: "intro" },
  lifeweaver: { id: "x1Shsa11udw", title: "라이프위버 소개 영상 | 오버워치 2", kind: "intro" },
  lucio: { id: "zmlShmOtYI8", title: "오버워치 2 영웅 가이드: 루시우", kind: "guide" },
  mauga: { id: "T4GSOs-jFj0", title: "마우가 소개 영상 | 오버워치 2", kind: "intro" },
  mizuki: NEW_HERO_GAMEPLAY,
  bastion: { id: "4qxzAAHS59k", title: "오버워치 2 영웅 가이드: 바스티온", kind: "guide" },
  vendetta: { id: "pJ2BEIYDEkE", title: "벤데타 게임플레이 트레일러 | 오버워치 2", kind: "gameplay" },
  venture: { id: "X2iA4VBO-WM", title: "벤처 소개 영상 | 오버워치 2", kind: "intro" },
  sojourn: { id: "7_E7XMmn1Aw", title: "소전 소개 영상 | 오버워치 2", kind: "intro" },
  sombra: { id: "o4nwYj5-y7o", title: "오버워치 2 영웅 가이드: 솜브라 리워크", kind: "guide" },
  sierra: { id: "Jmvgx1e4k5I", title: "시에라 신규 영웅 게임플레이 트레일러 | 오버워치", kind: "gameplay" },
  shion: { id: "HnyJ5b7CXoo", title: "시온 신규 영웅 게임플레이 트레일러 | 오버워치", kind: "gameplay" },
  anran: NEW_HERO_GAMEPLAY,
  emre: NEW_HERO_GAMEPLAY,
  orisa: { id: "ekbOVrsGOTM", title: "오버워치 2 영웅 가이드: 오리사", kind: "guide" },
  wuyang: { id: "W0x6cMS-YIA", title: "우양 게임플레이 트레일러 | 오버워치 2", kind: "gameplay" },
  illari: { id: "ruwx4d3Ko5s", title: "일리아리 소개 영상 | 오버워치 2", kind: "intro" },
  "junker-queen": { id: "sM9JnPQGqV4", title: "정커퀸 소개 영상 | 오버워치 2", kind: "intro" },
  "jetpack-cat": NEW_HERO_GAMEPLAY,
  juno: { id: "UcibwCZ-ta0", title: "주노 소개 영상 | 오버워치 2", kind: "intro" },
  kiriko: { id: "f7uiBuGN1no", title: "키리코 소개 영상 | 오버워치 2", kind: "intro" },
  freja: { id: "JDr5VYfuLXY", title: "프레야 게임플레이 트레일러 | 오버워치 2", kind: "gameplay" },
  hazard: { id: "dbmBJL7Se9o", title: "해저드 소개 영상 | 오버워치 2", kind: "intro" },
  dmon: { id: "usnWdTDv8pM", title: "D.Mon 신규 영웅 게임플레이 트레일러 | 오버워치", kind: "gameplay" },
};

export function getHeroVideo(heroKey: string) {
  return heroVideos[heroKey];
}
