import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { adsEnabled, CONTACT_EMAIL } from "@/lib/site-config";
import { TEAM_SAVE_KEY } from "@/lib/team-share";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "OP PICK LAB이 처리하는 정보, 브라우저 저장소, 외부 서비스와 광고 쿠키에 관한 안내입니다.",
  alternates: { canonical: "/privacy/" },
};

const EFFECTIVE_DATE = "2026-09-28";

export default function PrivacyPage() {
  return (
    <main className="page-shell sources-page privacy-page">
      <SiteHeader active="privacy" />
      <div className="source-dashboard source-dashboard-compact">
        <section className="policy-note policy-note-primary">
          <ShieldCheck aria-hidden="true" />
          <div>
            <span className="section-kicker">PRIVACY POLICY</span>
            <h1>개인정보처리방침</h1>
            <p>OP PICK LAB(opick.ggwp.kr, 이하 &quot;사이트&quot;)은 이용자의 개인정보를 소중히 다루며, 사이트 이용 과정에서 처리되는 정보를 아래와 같이 안내합니다. 시행일: {EFFECTIVE_DATE}</p>
          </div>
        </section>

        <section className="license-section privacy-section">
          <h2>1. 직접 수집하는 개인정보</h2>
          <p>사이트에는 회원가입·로그인·댓글·문의 양식이 없으며, 이름·연락처·계정 정보 등 개인정보를 직접 수집하거나 서버에 저장하지 않습니다.</p>

          <h2>2. 브라우저에 저장하는 정보</h2>
          <p>팀 구성 페이지에서 &quot;저장&quot;을 누르면 선택한 모드·영웅·전장 조합 1개를 이용자 브라우저의 로컬 저장소(<code>{TEAM_SAVE_KEY}</code>)에 저장합니다. 이 정보는 기기 밖으로 전송되지 않으며, 다시 저장하면 덮어쓰고, 브라우저의 사이트 데이터 삭제로 지울 수 있습니다.</p>

          <h2>3. 외부 서비스</h2>
          <ul>
            <li><strong>호스팅</strong>: 사이트는 GitHub Pages(GitHub, Inc.)로 제공됩니다. 접속 시 IP 주소 등 접속 기록이 GitHub의 보안·운영 목적 로그에 남을 수 있습니다. <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer">GitHub 개인정보 처리방침</a></li>
            <li><strong>게임 이미지·영상</strong>: 영웅 초상·아이콘·영상은 Blizzard Entertainment의 서버에서 불러옵니다. 이때 IP 주소와 브라우저 정보가 해당 서버에 전달됩니다.</li>
            <li><strong>YouTube 영상</strong>: 공식 영상은 YouTube 개인정보 보호 강화 모드(youtube-nocookie.com)로 삽입하며, 재생과 관련된 처리는 Google 정책을 따릅니다.</li>
            <li><strong>방문 분석</strong>: 방문자 분석 도구를 사용하지 않습니다.</li>
          </ul>

          <h2>4. 광고와 쿠키</h2>
          {adsEnabled ? <>
            <p>사이트는 Google AdSense 광고를 게재합니다. Google을 포함한 제3자 공급업체는 쿠키를 사용하여 이용자의 이 사이트 및 다른 사이트 방문 기록을 바탕으로 광고를 게재합니다. Google은 광고 쿠키를 사용하여 Google과 파트너가 이용자의 방문 기록에 기반한 광고를 게재할 수 있도록 합니다.</p>
            <ul>
              <li><a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">Google 광고 설정</a>에서 개인 맞춤 광고를 사용 중지할 수 있습니다.</li>
              <li><a href="https://www.aboutads.info/choices/" target="_blank" rel="noreferrer">www.aboutads.info</a>에서 제3자 공급업체의 개인 맞춤 광고 쿠키를 사용 중지할 수 있습니다.</li>
              <li><a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">Google이 파트너 사이트의 정보를 사용하는 방식</a>을 확인할 수 있습니다.</li>
            </ul>
          </> : <p>현재 광고를 게재하지 않으며 사이트가 설정하는 쿠키가 없습니다. 광고를 게재하게 되면 적용 전에 광고 쿠키 사용 내용을 이 방침에 추가합니다.</p>}

          <h2>5. 이용자의 권리</h2>
          <p>사이트는 개인정보를 보관하지 않으므로 열람·정정·삭제 대상이 되는 정보가 없습니다. 브라우저 설정에서 쿠키와 사이트 데이터를 언제든 삭제하거나 차단할 수 있으며, 궁금한 점은 아래 연락처로 문의할 수 있습니다.</p>

          <h2>6. 문의처</h2>
          <p>개인정보·저작권 관련 문의: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>

          <h2>7. 방침 변경</h2>
          <p>이 방침이 바뀌면 이 페이지에 변경 내용과 시행일을 게시합니다. 현재 시행일: {EFFECTIVE_DATE}</p>
        </section>
      </div>
    </main>
  );
}
