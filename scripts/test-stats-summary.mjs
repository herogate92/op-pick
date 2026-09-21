import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeRates } from '../lib/stats-summary.ts';
import { statsTier } from '../lib/stats-tier.ts';

test('승률 구간 경계와 낮은 픽률·체험·누락 제외를 구분한다', () => {
  const row = {hero:'ana',winRate:55,pickRate:1,banRate:null};
  for (const [winRate,tier] of [[55,'S'],[54.9,'A'],[52,'A'],[51.9,'B'],[49,'B'],[48.9,'C']]) assert.equal(statsTier({...row,winRate}),tier);
  assert.equal(statsTier({...row,pickRate:0.9}),'미분류');
  assert.equal(statsTier({...row,winRate:null}),'미분류');
  assert.equal(statsTier({...row,pickRate:null}),'미분류');
  assert.equal(statsTier(row,true),'미분류');
});

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
