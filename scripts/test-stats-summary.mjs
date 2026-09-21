import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeRates } from '../lib/stats-summary.ts';

test('역할·검색으로 남은 행만 요약하며 누락 영웅을 통계 제공 인원에서 제외한다', () => {
  const rows = [
    {hero:'tank',winRate:60,pickRate:20,banRate:null},
    {hero:'support',winRate:50,pickRate:10,banRate:0},
    {hero:'missing',winRate:null,pickRate:null,banRate:null},
  ];
  const selected = summarizeRates(rows.filter(row => row.hero !== 'tank'));
  assert.equal(selected.leaders.winRate.hero,'support');
  assert.equal(selected.leaders.pickRate.hero,'support');
  assert.equal(selected.leaders.banRate.banRate,0);
  assert.equal(selected.available,1);
  assert.equal(selected.total,2);
});
test('검색 결과 없음과 전부 누락된 데이터에서 다른 영웅을 1위로 표시하지 않는다', () => {
  for (const rows of [[], [{hero:'missing',winRate:null,pickRate:null,banRate:null}]]) {
    const result = summarizeRates(rows);
    assert.equal(result.available,0);
    assert.equal(result.leaders.winRate,undefined);
    assert.equal(result.leaders.pickRate,undefined);
    assert.equal(result.leaders.banRate,undefined);
  }
});
