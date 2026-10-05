// Official launch preview, published October 5 UTC. Gameplay data stays on the live patch until launch.
export const season = {
  number: 5,
  title: "어둠의 신조",
  startsAt: "2026-10-07T03:00:00+09:00",
  startsLabel: "10월 7일 오전 3시 · 한국 시간",
  checkedAt: "2026-10-06",
  videoId: "iXymAx2Io40",
  videoTitle: "오버워치 5시즌: 어둠의 신조 공식 트레일러 | 오버워치",
  sourceUrl: "https://news.blizzard.com/en-us/article/24303008/feed-your-hunger-in-reign-of-talon-season-5-a-grim-doctrine",
  poster: "https://bnetcmsus-a.akamaihd.net/cms/gallery/HRMJNKQFORT91790794795279.png",
  highlights: [
    { id: "doctrine", title: "지원 영웅 독트린", text: "영겁의 홀로 치유와 공격을 수행하고, 드론으로 아군의 치유·공격 속도를 지원합니다. 주입으로 다음 기술을 강화합니다.", href: "/heroes/doctrine/", link: "독트린 정보" },
    { id: "sombra", title: "솜브라: 공격 → 지원", text: "Hotfix로 아군을 치유하고, Cyberspace로 아군 치유와 적의 피해·치유 효율 감소를 제공합니다.", href: "/heroes/sombra/", link: "솜브라 정보" },
    { id: "roadhog", title: "로드호그 개편", text: "고철총의 발사 방식이 바뀝니다. Trash Compactor로 적 투사체를 흡수한 뒤, 흡수량에 비례하는 폭발탄을 발사합니다.", href: "/heroes/roadhog/", link: "로드호그 정보" },
    { id: "grimsvotn", title: "감시 기지: 그림스뵈튼", text: "아이슬란드 화산 감옥을 배경으로 한 신규 호위 전장입니다. 독트린의 탈출과 탈론의 지배 마지막 장이 이어집니다." },
  ],
  events: [
    { title: "Mystery Madness: Graveyard Games", dates: "10월 6일~11월 2일", text: "무작위 영웅으로 시작하며 사망 후 새로운 무작위 능력이 추가됩니다. 공물로 다음 등장 영웅에 투표합니다." },
    { title: "오버워치 × 나 혼자만 레벨업", dates: "10월 6~26일", text: "겐지·리퍼·안란·라인하르트·라이프위버의 협업 스킨이 공개됐습니다." },
    { title: "Tech Witches 컬렉션", dates: "10월 9~26일", text: "D.Mon·시온·주노·시에라·제트팩 캣의 마녀 테마 스킨이 등장합니다." },
    { title: "팀 드라이브", dates: "10월 29~31일", text: "승리한 팀원들과 다음 경기에도 함께하며 경쟁전 보상을 노릴 수 있습니다. 배치 경기를 먼저 완료해야 합니다." },
  ],
  rewards: [
    { title: "이전 배틀 패스 복귀", text: "1~15시즌의 수정된 패스가 돌아옵니다. 현재 패스와 이전 패스 하나를 동시에 진행하며, 구매한 이전 패스는 만료되지 않습니다." },
    { title: "우양·루시우 신화", text: "우양 신화 영웅 스킨 Dragon Shaoxia와 루시우 신화 무기 Treblemaker가 공개됐습니다." },
  ],
} as const;

export const seasonHeroNotes: Record<string, string> = {
  doctrine: "5시즌에 정식 합류합니다. 체험 이후 조정될 수 있으므로 아래 수치는 각 항목의 확인 기준을 참고하세요.",
  sombra: "5시즌에서 지원 역할로 전환됩니다. 아래 기술·상성·통계는 기존 라이브 버전 기준입니다.",
  roadhog: "5시즌에서 고철총과 투사체 흡수 기술이 개편됩니다. 아래 기술·상성은 기존 라이브 버전 기준입니다.",
};
