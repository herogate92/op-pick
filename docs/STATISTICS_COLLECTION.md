# 통계 수집 조건

2026-09-21 확인: https://overfast-api.tekrop.fr/openapi.json 의 `/heroes/stats` 스키마와 실제 응답, Blizzard 공식 통계 페이지의 필터 값.

- 플랫폼: `pc`, `console`; 지역: `asia`, `americas`, `europe`.
- 모드: `quickplay`, `competitive`의 역할 고정 경기. 6대6 전용 통계가 아니다.
- 등급: `competitive_division`에 bronze, silver, gold, platinum, emerald, diamond, master, grandmaster. 마지막 값은 챔피언을 포함한다.
- 밴률: `banrate`를 경쟁전에서만 저장한다. 0은 실제 0%, null/누락은 자료 없음이다.
- 현재 수집: 두 모드 × 두 입력 장치 × 세 지역의 전체 등급 12개, PC 아시아 경쟁전 등급별 8개. 모든 전장 합산. 전장별 수집은 로드맵 5단계.
- 모든 조건의 영웅 키·중복·수치 범위를 확인한 뒤 한 번에 교체한다. 부분 실패 시 이전 통계와 기존 운영 배포를 유지한다.
- 공식 페이지 대체 수집에도 동일한 input/region/tier/rq 조건을 전달한다.
- 영웅 상세는 PC 아시아 전체 등급의 두 모드만 표시한다. 확장 조건의 목록 링크는 영웅 정보로 이동하며, 다른 조건의 통계를 같은 값으로 표시하지 않는다.
- 수집일은 경기 집계 종료일이나 특정 패치 이후 경기만을 뜻하지 않는다. 패치 기준 갱신 일정을 유지한다.
