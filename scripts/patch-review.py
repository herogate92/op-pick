"""Conservative content review queue; detection is never evidence verification."""
import hashlib
from html import escape
from html.parser import HTMLParser
import importlib.util
import json
import os
from pathlib import Path
import re
import unicodedata
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location('patch_gate', Path(__file__).with_name('check-patch.py'))
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)
ROOT = Path(__file__).resolve().parents[1]
START_DATE = '2026-09-10'

def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

def normalized(value):
    text = ''.join(c for c in unicodedata.normalize('NFKD', value.casefold()) if not unicodedata.combining(c))
    return ' '.join(re.sub(r'[^a-z0-9]+', ' ', text).split())

class Patches(gate.LatestPatch):
    def __init__(self):
        super().__init__()
        self.patches = []
    def handle_endtag(self, tag):
        before = self.depth
        super().handle_endtag(tag)
        if before and self.done:
            text = ' '.join(' '.join(self.text).split())
            if not self.date or len(text) < 100: raise ValueError('Incomplete patch entry')
            self.patches.append({'patchDate':self.date, 'digest':hashlib.sha256(text.encode()).hexdigest(), 'text':text})
            self.done = False
            self.date = None
            self.text = []

def build_report(html, data, previous, decisions):
    # Validate the same latest patch used by the deployment gate.
    latest = gate.fingerprint(html)
    parser = Patches(); parser.feed(html)
    if parser.depth: raise ValueError('Unclosed patch entry')
    patches = {p['digest']:p for p in previous.get('patches', [])}
    queue = {f"{x['patchDigest']}:{x['category']}:{x['id']}":x for x in previous.get('items', [])}
    heroes = data['heroes']
    aliases = {'dmon':'d mon','dva':'d va'}
    for patch in parser.patches:
        if patch['patchDate'] < START_DATE: continue
        text = ' '+normalized(patch['text'])+' '
        mentioned = [h for h in heroes if ' '+normalized(aliases.get(h['key'],h['key']))+' ' in text]
        patches[patch['digest']] = {k:patch[k] for k in ['digest','patchDate']}
        patches[patch['digest']]['heroes'] = [h['key'] for h in mentioned]
        keys = {h['key'] for h in mentioned}
        rows = [('기술',h['key'],h['name'],f"/heroes/{h['key']}/",h) for h in mentioned]
        rows += [('상성',x['id'],x['id'],f"/matchups/{x['hero']}-vs-{x['counter']}/" if x['status']=='verified' else '/matchups/',x) for x in data['matchups'] if keys.intersection([x['hero'],x['counter']])]
        for filename in ['combos','team-synergies','team-cautions']:
            rows += [('조합' if filename!='team-cautions' else '주의 조합',x['id'],x.get('name',x['id']),'/combos/',x) for x in data[filename] if keys.intersection(x['heroes'])]
        rows += [('맵',m['id']+':'+x['hero'],m['name']+' · '+x['hero'],f"/maps/{m['id']}/",x) for m in data['maps'] for x in m['recommendations'] if x['hero'] in keys]
        # Every patch also needs a human pass for global rules, modes, unknown heroes and non-name changes.
        rows.append(('전체 규칙','global','공통 규칙·모드·미등록 영웅 확인','/sources/',{'patch':patch['digest']}))
        for category, key, label, url, record in rows:
            item = {'patchDigest':patch['digest'],'patchDate':patch['patchDate'],'category':category,'id':key,'label':label,'url':url,'contentDigest':digest(record),'status':'pending'}
            queue[f"{patch['digest']}:{category}:{key}"] = item
    records = {('기술', h['key']):h for h in heroes}
    records.update({('상성', x['id']):x for x in data['matchups']})
    for filename in ['combos','team-synergies','team-cautions']:
        records.update({('주의 조합' if filename=='team-cautions' else '조합', x['id']):x for x in data[filename]})
    records.update({('맵', m['id']+':'+x['hero']):x for m in data['maps'] for x in m['recommendations']})
    for item in queue.values():
        if (item['category'],item['id']) in records:
            item['contentDigest'] = digest(records[(item['category'],item['id'])])
        item.pop('review', None)
        # Only explicit decisions bound to both patch and content can close an item.
        item['status'] = 'pending'
        for decision in decisions:
            if all(decision.get(k)==item[k] for k in ['patchDigest','category','id','contentDigest']):
                if decision.get('decision') not in ['updated','no-change','deferred'] or not decision.get('summary') or not decision.get('reviewedAt'):
                    raise ValueError('Incomplete review decision')
                if decision['decision'] == 'deferred' and not decision.get('recheckRequirement'):
                    raise ValueError('Deferred review requires a recheck requirement')
                item['status'] = 'pending' if decision['decision'] == 'deferred' else 'reviewed'
                item['review'] = decision
    return {'schemaVersion':1,'trackingSince':START_DATE,'latestPatch':latest,'patches':sorted(patches.values(),key=lambda x:x['patchDate'],reverse=True),'items':sorted(queue.values(),key=lambda x:(x['patchDate'],x['category'],x['id']),reverse=True)}

def render(report):
    items = report['items']; pending = sum(x['status']=='pending' for x in items)
    rows = ''
    for x in items:
        review = x.get('review', {})
        status = '근거 보강 대기' if review.get('decision') == 'deferred' else ('검토 대기' if x['status']=='pending' else '자료 검토 완료')
        detail = ''
        if review:
            detail = '<details><summary>판단 이유</summary><p>'+escape(review['summary'])+'</p>'
            if review.get('recheckRequirement'):
                detail += '<p>다시 확인할 조건: '+escape(review['recheckRequirement'])+'</p>'
            detail += '<p>기록일: '+escape(review['reviewedAt'])+'</p></details>'
        rows += '<tr>'+''.join('<td>'+escape(str(value))+'</td>' for value in [x['patchDate'],x['category']])+f'<td><a href="{escape(x["url"],quote=True)}">{escape(x["label"])}</a>{detail}</td><td>'+status+'</td></tr>'
    return f'''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>패치 재검토 현황 · OP PICK LAB</title><style>body{{font:16px/1.7 system-ui;max-width:1000px;margin:32px auto;padding:0 18px;background:#101b2b;color:#e8eef9}}a{{color:#8dd8ec}}table{{width:100%;border-collapse:collapse}}td,th{{padding:10px;text-align:left;border-bottom:1px solid #42526a}}.table{{overflow:auto}}</style><a href="/sources/">운영 원칙으로</a><h1>패치 재검토 현황</h1><p>확인한 최신 패치: {report['latestPatch']['patchDate']} · 검토 대기 {pending}건 / 전체 {len(items)}건</p><p>패치 본문에 언급된 영웅을 기준으로 넓게 추린 후보입니다. 모드·특전·실제 영향은 개별 확인이 필요하며, 목록에 있다는 이유만으로 기존 정보가 틀렸다는 뜻은 아닙니다. 통계 갱신은 기술 검증 완료를 뜻하지 않습니다.</p><p>{START_DATE} 이후 공식 라이브 페이지에서 감지한 패치를 추적합니다. 페이지에서 사라진 과거 패치는 자동으로 소급 수집하지 않습니다. 미처리 항목은 다음 배포에도 유지하며 직접 게임 재현을 자동 수행하지 않습니다.</p><p><a href="{gate.SOURCE}">공식 패치 원문</a> · <a href="/patch-review.json">전체 검토 목록 다운로드</a></p><div class="table"><table><thead><tr><th>패치</th><th>구분</th><th>관련 내용</th><th>상태</th></tr></thead><tbody>{rows}</tbody></table></div></html>'''

def main():
    html = (ROOT/'work/latest-patch.html').read_text()
    try:
        previous = json.loads(gate.read_url('https://opick.ggwp.kr/patch-review.json'))
        if previous.get('schemaVersion') != 1 or not isinstance(previous.get('items'),list): raise ValueError('Invalid previous review queue')
    except HTTPError as error:
        if error.code != 404: raise
        previous = {}
    data = {name:json.loads((ROOT/f'data/{name}.json').read_text()) for name in ['heroes','matchups','combos','team-synergies','team-cautions','maps']}
    decisions = json.loads((ROOT/'data/patch-review-decisions.json').read_text())
    report = build_report(html,data,previous,decisions)
    (ROOT/'public/patch-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'public/patch-review.html').write_text(render(report))
    pending = sum(x['status']=='pending' for x in report['items'])
    summary = f"Patch content review: {pending} pending / {len(report['items'])} candidates. Detection does not verify content.\n"
    print(summary)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as f:f.write(summary)
if __name__=='__main__':main()
