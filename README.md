# OP PICK LAB

오버워치 픽 연구소 — 영웅 정보, 상성, 조합과 팀 구성을 제공하는 비공식 팬 가이드입니다.

DB와 서버 없이 동작하는 한국어 오버워치 영웅·상성·맵 추천·조합 가이드입니다. Next.js 정적 내보내기 결과를 GitHub Pages에 배포합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

검증과 정적 빌드는 `npm run check`로 실행합니다. 빌드 결과는 `out/`에 생성됩니다.

## 데이터 검증

`npm run data:validate`는 영웅 ID, 상성 참조, 점수 범위, 검수일과 특수 문자 이름을 검사합니다. 데이터 변경은 내용을 검토한 뒤 정적 JSON에 반영합니다.

## GitHub Pages와 도메인

1. 공개 GitHub 저장소의 기본 브랜치를 `main`으로 설정합니다.
2. Settings → Pages → Source에서 **GitHub Actions**를 선택합니다.
3. DNS에 `opick` CNAME을 `<GitHub 사용자명>.github.io`로 추가합니다.
4. Pages 사용자 지정 도메인에 `opick.ggwp.kr`을 등록합니다.
5. 인증서가 발급되면 **Enforce HTTPS**를 켭니다.

`public/CNAME`과 `public/.nojekyll`은 정적 빌드 결과에 자동 포함됩니다.

## 고지

본 프로젝트는 Blizzard Entertainment와 관련이 없는 비공식 팬 가이드입니다. 실제 광고를 연결하기 전에 Blizzard의 이미지·상표 사용 정책을 별도로 검토해야 합니다.
