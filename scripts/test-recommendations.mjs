import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assessTeam, rankCandidates, getIssues, selectionBlockReason } from '../lib/team-builder.ts';
import { matchesCombo, heroSearchTerms } from '../lib/combo-search.ts';
const hero = (key, role, name = key) => ({ key, name, role, subrole: '', portrait: '', reviewStatus: 'verified' });
const heroes = [hero('tank','tank'), hero('old','damage'), hero('ally','damage'), hero('candidate-a','damage','가'), hero('candidate-b','damage','나'), hero('support-a','support'), hero('support-b','support')];
const fullTeam = ['tank','old','ally','support-a','support-b'];
test('체험 영웅은 직접 선택 가능하지만 자동 추천에는 포함하지 않는다', () => {
 const trial = {...hero('doctrine','support'), reviewStatus:'review-needed'};
 const roster = [...heroes, trial];
 assert.equal(selectionBlockReason(roster, trial, '5v5', ['tank','old','ally',null,null], 3), null);
 assert.ok(!rankCandidates(roster, [], [], [], undefined, '6v6', [null,null,null,null,null,null], 0).some(row => row.key === 'doctrine'));
});
const synergy = (heroes, modes = ['5v5']) => ({ heroes, modes, score: 5 });
test('교체할 기존 영웅과의 연계는 추천 근거에서 제외한다', () => {
 const ranked = rankCandidates(heroes, [], [synergy(['old','candidate-a']),synergy(['ally','candidate-b'])], [], undefined, '5v5', fullTeam, 1);
 assert.equal(ranked[0].key, 'candidate-b');
 assert.ok(ranked.every(h => h.role === 'damage' && !fullTeam.includes(h.key)));
});
test('빈 슬롯 추천은 남은 팀원과의 연계를 반영하고 중복을 막는다', () => {
 const ranked = rankCandidates(heroes, [], [synergy(['ally','candidate-b'])], [], undefined, '5v5', ['tank',null,'ally','support-a','support-b'], 1);
 assert.equal(ranked[0].key, 'candidate-b');
 assert.ok(ranked.every(h => h.key !== 'ally'));
});
test('궁극기가 없어도 일반 시너지를 긍정 진단한다', () => {
 const issues = getIssues('5v5',fullTeam,{tank:1,damage:2,support:2},0,1,[]);
 assert.ok(issues.some(i => i.good && i.text.includes('일반 기술')));
 assert.ok(!issues.some(i => !i.good && !i.neutral));
});
test('미등록 연계는 경고가 아닌 중립 정보로 남긴다', () => {
 const issues = getIssues('5v5',fullTeam,{tank:1,damage:2,support:2},0,0,[]);
 assert.ok(issues.some(i => i.neutral));
 assert.ok(!issues.some(i => !i.good && !i.neutral));
});
test('인원 충원만으로 전술 점수를 얻지 않는다', () => {
 assert.equal(assessTeam([], '5v5', [],[],[]).total, 0);
 assert.equal(assessTeam(fullTeam, '5v5', [],[],[]).total, 0);
});
test('5v5 근거를 6v6에 전용하지 않으며 주의 점수는 하한 0이다', () => {
 const combos=[{ heroes:['tank','ally'],score:5,modes:['5v5']}];
 assert.equal(assessTeam(fullTeam,'6v6',combos,[synergy(['ally','old'])],[]).total,0);
 assert.equal(assessTeam(fullTeam,'5v5',[],[],[{heroes:['ally','old'],modes:['5v5'],penalty:5}]).total,0);
});
test('전장 미선택은 0점이고 전장 점수 분해 합계가 일치한다', () => {
 const a=assessTeam(['tank','ally'],'5v5',[],[synergy(['tank','ally'])],[],{recommendations:[{hero:'tank',rank:1},{hero:'ally',rank:2}]});
 assert.deepEqual(a,{linkage:10,mapPoints:8,penalty:0,total:18});
});
test('별칭·다중 검색어와 영웅·유형 필터를 함께 적용한다', () => {
 const c={heroes:['lifeweaver','cassidy'], category:'mixed',searchText:heroSearchTerms('lifeweaver','라이프위버')+' '+heroSearchTerms('cassidy','캐서디')};
 assert.ok(matchesCombo(c,'위버 맥크리','cassidy','mixed'));
 assert.ok(matchesCombo(c,'멕크리','',''));
 assert.ok(!matchesCombo(c,'위버','bastion','mixed'));
 assert.ok(!matchesCombo(c,'','cassidy','ultimate'));
 assert.ok(!matchesCombo(c,'없는이름','',''));
});
test('모든 궁극기 자료는 추천 근거나 개별 보류 이유가 있다', () => {
 const records=JSON.parse(readFileSync(new URL('../data/combos.json',import.meta.url)));
 assert.equal(records.length,8);
 for (const c of records) {
   if(c.status==='recommended') assert.ok(c.evidence?.url && c.condition && c.failure && c.steps?.length===3);
   else { assert.equal(c.status,'held'); assert.ok(c.holdReason); }
 }
});

const sixHeroes = [...heroes, hero('tank-b','tank'), hero('tank-c','tank'), hero('tank-d','tank')];
const twoTanks = ['tank','tank-b','ally','support-a',null,null];
test('6대6은 세 번째 돌격의 직접 선택과 추천을 막는다', () => {
 const candidate = sixHeroes.find(h => h.key === 'tank-c');
 for (const index of [2,4,5]) {
  assert.match(selectionBlockReason(sixHeroes,candidate,'6v6',twoTanks,index), /최대 2명/);
  assert.ok(rankCandidates(sixHeroes,[],[],[],undefined,'6v6',twoTanks,index).every(h => h.role !== 'tank'));
 }
});
test('6대6 돌격 두 명 상태에서 기존 돌격 교체와 제거 후 추가를 허용한다', () => {
 const candidate = sixHeroes.find(h => h.key === 'tank-c');
 assert.equal(selectionBlockReason(sixHeroes,candidate,'6v6',twoTanks,0),null);
 assert.ok(rankCandidates(sixHeroes,[],[],[],undefined,'6v6',twoTanks,0).some(h => h.key === candidate.key));
 const removed = [...twoTanks]; removed[0] = null;
 assert.equal(selectionBlockReason(sixHeroes,candidate,'6v6',removed,4),null);
 assert.ok(selectionBlockReason(sixHeroes,sixHeroes[0],'6v6',twoTanks,4));
});
test('돌격에 높은 추천 점수가 있어도 6대6 자동 완성은 두 명을 넘지 않는다', () => {
 const map = {recommendations:sixHeroes.filter(h => h.role === 'tank').map(h => ({hero:h.key,rank:1}))};
 const links = [{heroes:['tank','tank-b','tank-c','tank-d'],modes:['6v6'],score:100}];
 for (const seed of [Array(6).fill(null), twoTanks]) {
  const draft = [...seed];
  for (let index = 0; index < draft.length; index++) {
   if (draft[index] !== null) continue;
   const [best] = rankCandidates(sixHeroes,[],links,[],map,'6v6',draft,index);
   assert.ok(best); draft[index] = best.key;
  }
  assert.equal(draft.filter(k => sixHeroes.find(h => h.key === k).role === 'tank').length,2);
  assert.equal(new Set(draft).size,6);
 }
});
test('5대5 역할 고정과 6대6 제한 초과 진단을 유지한다', () => {
 assert.ok(selectionBlockReason(sixHeroes,sixHeroes[0],'5v5',Array(5).fill(null),1));
 assert.equal(selectionBlockReason(sixHeroes,sixHeroes[0],'5v5',Array(5).fill(null),0),null);
 assert.ok(getIssues('6v6',['tank','tank-b','tank-c',null,null,null],{tank:3,damage:0,support:0},0,0,[]).some(i => i.text.includes('최대 2명') && !i.good));
});

const { encodeTeam, decodeTeam } = await import('../lib/team-share.ts');
test('공유 링크는 5대5와 6대6의 빈 슬롯·순서·맵을 그대로 복원한다', () => {
 for (const state of [
  {mode:'5v5',team:['tank',null,'ally','support-a',null],mapId:'kings-row'},
  {mode:'6v6',team:['support-a','tank',null,'tank-b','ally',null],mapId:''},
  {mode:'6v6',team:Array(6).fill(null),mapId:''},
 ]) assert.deepEqual(decodeTeam('#'+encodeTeam(state),sixHeroes,['kings-row']),state);
});
test('공유 링크로 중복·역할 제한·탱커 상한을 우회할 수 없다', () => {
 for (const state of [
  {mode:'6v6',team:['tank','tank-b','tank-c',null,null,null],mapId:''},
  {mode:'6v6',team:['tank','tank',null,null,null,null],mapId:''},
  {mode:'5v5',team:[null,'tank',null,null,null],mapId:''},
 ]) assert.throws(()=>decodeTeam(encodeTeam(state),sixHeroes,[]));
});
test('알 수 없는 영웅·전장·인원·버전과 손상된 링크를 거절한다', () => {
 const valid = encodeTeam({mode:'6v6',team:twoTanks,mapId:''});
 for (const value of [valid.replace('v=1','v=2'),valid+'&mode=5v5',valid.replace('mode=6v6','mode=7v7'),'v=1', 'x'.repeat(2049),encodeTeam({mode:'6v6',team:['unknown',null,null,null,null,null],mapId:''}),encodeTeam({mode:'6v6',team:twoTanks,mapId:'unknown'}),encodeTeam({mode:'6v6',team:['tank'],mapId:''})]) {
  assert.throws(()=>decodeTeam(value,sixHeroes,[]));
 }
});

test('6대6 두 탱커 연계는 검색·진단·교체 추천에서 모드를 지킨다', () => {
 const rows = JSON.parse(readFileSync(new URL('../data/team-synergies.json', import.meta.url)));
 const pairs = rows.filter(row => ['reinhardt-zarya-6v6','winston-dva-6v6'].includes(row.id));
 assert.equal(pairs.length, 2);
 for (const pair of pairs) {
  assert.deepEqual(pair.modes, ['6v6']);
  const card = {...pair, searchText: pair.name};
  assert.equal(matchesCombo(card, '', pair.heroes[0], 'pair', '5v5'), false);
  assert.equal(matchesCombo(card, '', pair.heroes[0], 'pair', '6v6'), true);
  assert.equal(assessTeam(pair.heroes, '5v5', [], [pair], []).linkage, 0);
  assert.ok(assessTeam(pair.heroes, '6v6', [], [pair], []).linkage > 0);
  const roster = [...pair.heroes.map(key => hero(key,'tank')),hero('other-tank','tank')];
  const team = [pair.heroes[0], null, null, null, null, null];
  assert.equal(rankCandidates(roster, [], [pair], [], undefined, '6v6', team, 1)[0].key, pair.heroes[1]);
  assert.ok(!rankCandidates(roster, [], [pair], [], undefined, '5v5', team.slice(0,5), 1).some(h => h.role === 'tank'));
 }
});
