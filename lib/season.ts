// Live season 5: October 6 UTC / October 7 KST official launch patch.
export const season = {
  number: 5,
  title: "어둠의 신조",
  startsAt: "2026-10-07T03:00:00+09:00",
  startsLabel: "10월 7일 오전 3시 · 한국 시간",
  checkedAt: "2026-10-07",
  patchDate: "2026-10-06",
  patchUrl: "https://overwatch.blizzard.com/ko-kr/news/patch-notes/live/2026/10/",
  videoId: "iXymAx2Io40",
  videoTitle: "오버워치 5시즌: 어둠의 신조 공식 트레일러 | 오버워치",
  sourceUrl: "https://news.blizzard.com/en-us/article/24303008/feed-your-hunger-in-reign-of-talon-season-5-a-grim-doctrine",
  poster: "https://bnetcmsus-a.akamaihd.net/cms/gallery/HRMJNKQFORT91790794795279.png",
  highlights: [
    { id: "doctrine", title: "지원 영웅 독트린", text: "영겁의 홀로 치유와 공격을 수행하고, 드론으로 아군의 치유·공격 속도를 지원합니다. 주입으로 다음 기술을 강화합니다.", href: "/heroes/doctrine/", link: "독트린 정보" },
    { id: "sombra", title: "솜브라: 공격 → 지원", text: "지원·전술가로 전환됐습니다. 긴급 패치로 아군을 치유하고 사이버 스페이스로 적이 주는 피해·치유를 50% 줄입니다. 영웅 해킹과 바이러스는 삭제됐습니다.", href: "/heroes/sombra/", link: "솜브라 정보" },
    { id: "roadhog", title: "로드호그 개편", text: "고철총이 2연발로 바뀌었습니다. 쓰레기 압축기로 적 투사체를 흡수한 뒤, 흡수량에 비례하는 폭발탄을 발사합니다.", href: "/heroes/roadhog/", link: "로드호그 정보" },
    { id: "grimsvotn", title: "감시 기지: 그림스뵈튼", text: "아이슬란드 화산 감옥을 배경으로 한 신규 호위 전장입니다. 독트린의 탈출과 탈론의 지배 마지막 장이 이어집니다.", href: "/maps/watchpoint-grimsvotn/", link: "신규 전장 정보" },
  ],
  events: [
    { title: "수수께끼의 광기: 묘한 게임", dates: "10월 6일~11월 2일", text: "5대5·1돌격 2공격 2지원 구성이 보장되는 3판 2선승제 쟁탈전입니다. 사망하면 파워를 얻고 공물로 다음 영웅에 투표합니다." },
    { title: "오버워치 × 나 혼자만 레벨업", dates: "10월 6~26일", text: "겐지·리퍼·안란·라인하르트·라이프위버의 협업 스킨이 공개됐습니다." },
    { title: "Tech Witches 컬렉션", dates: "10월 9~26일", text: "D.Mon·시온·주노·시에라·제트팩 캣의 마녀 테마 스킨이 등장합니다." },
    { title: "팀 드라이브", dates: "10월 29~31일", text: "승리한 팀원들과 다음 경기에도 함께하며 경쟁전 보상을 노릴 수 있습니다. 배치 경기를 먼저 완료해야 합니다." },
  ],
  rules: [
    { title: "사격 판정·영웅 타점", text: "대형 히트스캔 크기 0.07 → 0.04m, 소형 0.04 → 0.02m. 다수 영웅의 머리·몸통·다리 타점이 조정됐습니다." },
    { title: "전장 투표", text: "최근 2시간 안에 플레이한 마지막 두 전장의 반복을 방지합니다. 모드 다양성 계산에서는 호위와 혼합을 같은 분류로 취급합니다." },
    { title: "상위 500위", text: "순위표 정렬과 시즌 종료 보상은 등급을 기준으로 합니다. 챌린저 점수는 진입 자격에 사용하며 열기 보너스는 제거됐습니다." },
    { title: "스타디움 빠른 대전", text: "자유 역할 선택에 돌격 최소 1명·최대 1명, 공격 최대 2명, 지원 최대 3명 제한이 적용됩니다. 경쟁전 규칙은 유지됩니다." },
  ],
  rewards: [
    { title: "이전 배틀 패스 복귀", text: "1~15시즌의 수정된 패스가 돌아옵니다. 현재 패스와 이전 패스 하나를 동시에 진행하며, 구매한 이전 패스는 만료되지 않습니다." },
    { title: "우양·루시우 신화", text: "우양 신화 영웅 스킨 Dragon Shaoxia와 루시우 신화 무기 Treblemaker가 공개됐습니다." },
  ],
} as const;

export const seasonHeroNotes: Record<string, string> = {
  doctrine: "5시즌에 정식 출시됐습니다. 공식 초상·기술 정보와 출시 조정 수치를 반영했습니다. 상성·통계는 확인된 자료부터 제공합니다.",
  sombra: "지원·전술가로 전환됐습니다. 긴급 패치·사이버 스페이스·공모자와 새 특전을 반영했습니다. 기존 해킹·바이러스 상성과 맵 추천은 보류했습니다. 통계는 각 수집 기간을 확인하세요.",
  roadhog: "2연발 고철총과 신규 쓰레기 압축기, 사슬 갈고리·숨 돌리기·특전 개편을 반영했습니다. 대기시간은 5대5·6대6을 구분해 표시합니다.",
};
