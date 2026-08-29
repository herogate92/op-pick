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
  genji: { id: "pYjoaJHvq80", title: "겐지 기술 살펴보기 | 오버워치", kind: "abilities" },
  domina: NEW_HERO_GAMEPLAY,
  doomfist: { id: "e320nRwXyu8", title: "오버워치 2 영웅 가이드: 둠피스트", kind: "guide" },
  ramattra: { id: "TjGANWk9hy0", title: "라마트라 소개 영상 | 오버워치 2", kind: "intro" },
  lifeweaver: { id: "x1Shsa11udw", title: "라이프위버 소개 영상 | 오버워치 2", kind: "intro" },
  reinhardt: { id: "H6oJROhq59M", title: "라인하르트 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  "wrecking-ball": { id: "YHTfcGZxyug", title: "레킹볼 소개 영상 | 오버워치", kind: "intro" },
  roadhog: { id: "Yhr43wvohks", title: "로드호그 & 정크랫 소개 영상 | 오버워치", kind: "intro" },
  lucio: { id: "zmlShmOtYI8", title: "오버워치 2 영웅 가이드: 루시우", kind: "guide" },
  reaper: { id: "kZEPK4URKL4", title: "리퍼 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  mauga: { id: "T4GSOs-jFj0", title: "마우가 소개 영상 | 오버워치 2", kind: "intro" },
  mercy: { id: "mQJHa_2AfPk", title: "메르시 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  mei: { id: "UrmrvTKIQvo", title: "메이 기술 살펴보기 | 오버워치", kind: "abilities" },
  moira: { id: "42OE-rlOVck", title: "모이라 소개 영상 | 오버워치", kind: "intro" },
  mizuki: NEW_HERO_GAMEPLAY,
  bastion: { id: "4qxzAAHS59k", title: "오버워치 2 영웅 가이드: 바스티온", kind: "guide" },
  baptiste: { id: "a4C6f2hdAJc", title: "바티스트 소개 영상 | 오버워치", kind: "intro" },
  vendetta: { id: "pJ2BEIYDEkE", title: "벤데타 게임플레이 트레일러 | 오버워치 2", kind: "gameplay" },
  venture: { id: "X2iA4VBO-WM", title: "벤처 소개 영상 | 오버워치 2", kind: "intro" },
  brigitte: { id: "Wl7n3KstKb0", title: "브리기테 소개 영상 | 오버워치", kind: "intro" },
  sojourn: { id: "7_E7XMmn1Aw", title: "소전 소개 영상 | 오버워치 2", kind: "intro" },
  "soldier-76": { id: "YxXrs3l68zw", title: "솔저: 76 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  sombra: { id: "o4nwYj5-y7o", title: "오버워치 2 영웅 가이드: 솜브라 리워크", kind: "guide" },
  sigma: { id: "Id0FOFYnaCo", title: "시그마 소개 영상 | 오버워치", kind: "intro" },
  symmetra: { id: "uJJHHfVZKNk", title: "시메트라 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  sierra: { id: "Jmvgx1e4k5I", title: "시에라 신규 영웅 게임플레이 트레일러 | 오버워치", kind: "gameplay" },
  shion: { id: "HnyJ5b7CXoo", title: "시온 신규 영웅 게임플레이 트레일러 | 오버워치", kind: "gameplay" },
  ana: { id: "d-Ge2QSYzmc", title: "아나 소개 영상 | 오버워치", kind: "intro" },
  anran: NEW_HERO_GAMEPLAY,
  ashe: { id: "KDnZQBYDbjM", title: "애쉬 소개 영상 | 오버워치", kind: "intro" },
  echo: { id: "FUd8RAvpwks", title: "에코 소개 영상 | 오버워치", kind: "intro" },
  emre: NEW_HERO_GAMEPLAY,
  orisa: { id: "ekbOVrsGOTM", title: "오버워치 2 영웅 가이드: 오리사", kind: "guide" },
  wuyang: { id: "W0x6cMS-YIA", title: "우양 게임플레이 트레일러 | 오버워치 2", kind: "gameplay" },
  widowmaker: { id: "FfbPPamWFiA", title: "위도우메이커 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  winston: { id: "O78zf4iPeio", title: "윈스턴 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  illari: { id: "ruwx4d3Ko5s", title: "일리아리 소개 영상 | 오버워치 2", kind: "intro" },
  zarya: { id: "DIRGhYJ6aD0", title: "자리야 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  "junker-queen": { id: "sM9JnPQGqV4", title: "정커퀸 소개 영상 | 오버워치 2", kind: "intro" },
  junkrat: { id: "Yhr43wvohks", title: "로드호그 & 정크랫 소개 영상 | 오버워치", kind: "intro" },
  "jetpack-cat": NEW_HERO_GAMEPLAY,
  zenyatta: { id: "tzhlABBEQbM", title: "젠야타 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  juno: { id: "UcibwCZ-ta0", title: "주노 소개 영상 | 오버워치 2", kind: "intro" },
  cassidy: { id: "7AdJIfcSYPw", title: "캐서디(맥크리) 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  kiriko: { id: "f7uiBuGN1no", title: "키리코 소개 영상 | 오버워치 2", kind: "intro" },
  torbjorn: { id: "pds-iXuW5R8", title: "토르비욘 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  tracer: { id: "u4Y47-o_258", title: "트레이서 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  pharah: { id: "j6lVdmpOc0w", title: "파라 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  freja: { id: "JDr5VYfuLXY", title: "프레야 게임플레이 트레일러 | 오버워치 2", kind: "gameplay" },
  hanzo: { id: "OluQ9bbKXmw", title: "한조 게임플레이 미리 보기 | 오버워치", kind: "gameplay" },
  hazard: { id: "dbmBJL7Se9o", title: "해저드 소개 영상 | 오버워치 2", kind: "intro" },
  dmon: { id: "usnWdTDv8pM", title: "D.Mon 신규 영웅 게임플레이 트레일러 | 오버워치", kind: "gameplay" },
  dva: { id: "ZsUM8UO_ptc", title: "오버워치 단편 애니메이션: 슈팅 스타", kind: "intro" },
};

export function getHeroVideo(heroKey: string) {
  return heroVideos[heroKey];
}
