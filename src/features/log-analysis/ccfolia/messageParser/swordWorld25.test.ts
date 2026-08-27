import { isSwordWorld25Message, swordWorld25Parser } from './swordWorld25';

describe('swordWorld25Parser', () => {
  test('単なるメッセージは null を返す', () => {
    expect(swordWorld25Parser('テスト')).toBe(null);
    expect(swordWorld25Parser('1D6 (1D6) ＞ 5')).toBe(null);
  });

  test('目標値のない通常の2D6判定をパースする', () => {
    expect(
      swordWorld25Parser('2d+(10+(18+1)/6)+0+0 妖精魔法行使 (2D6+(10+(18+1)/6)+0+0) ＞ 7[6,1]+(10+(18+1)/6)+0+0 ＞ 20'),
    ).toStrictEqual({
      evaluation: '',
      results: [7],
      target: -1,
      skillName: '妖精魔法行使',
    });
  });

  test('目標値と成否のある2D6判定をパースする', () => {
    expect(
      swordWorld25Parser(
        '2d+10+((18+1)/6)+2>=23 セージ知識 (2D6+10+((18+1)/6)+2>=23) ＞ 8[2,6]+10+((18+1)/6)+2 ＞ 23 ＞ 成功',
      ),
    ).toStrictEqual({
      evaluation: '成功',
      results: [8],
      target: 23,
      skillName: 'セージ知識',
    });
  });

  test('自動的成功をパースする', () => {
    expect(swordWorld25Parser('2d+20>=30 回避力 (2D6+20>=30) ＞ 12[6,6]+20 ＞ 32 ＞ 自動的成功')).toStrictEqual({
      evaluation: '自動的成功',
      results: [12],
      target: 30,
      skillName: '回避力',
    });
  });

  test('超越判定で振り足したすべての出目をパースする', () => {
    expect(swordWorld25Parser('2D6@10+15>=30 (2D6@10+15>=30) ＞ 15[6,4][3,2]+15 ＞ 30 ＞ 成功')).toStrictEqual({
      evaluation: '成功',
      results: [10, 5],
      target: 30,
      skillName: null,
    });
  });

  test('威力表から生の2D6の合計値を取得する', () => {
    expect(
      swordWorld25Parser('k20[13]+9+1 回復：ヒーリングポーション+1 KeyNo.20+10 ＞ 2D:[5,3]=8 ＞ 6+10 ＞ 16'),
    ).toStrictEqual({
      evaluation: '',
      results: [8],
      target: -1,
      skillName: '回復：ヒーリングポーション+1',
    });

    expect(
      swordWorld25Parser(
        '(1/5) k60[8]+26 ダメージ KeyNo.60c[8]+26 ＞ 2D:[6,4 6,3 6,2 4,3]=10,9,8,7 ＞ 15,14,13,12+26 ＞ 3回転 ＞ 80',
      ),
    ).toStrictEqual({
      evaluation: '',
      results: [10, 9, 8, 7],
      target: -1,
      skillName: 'ダメージ',
    });
  });

  test('威力表の自動的失敗は行為判定の失敗として扱わない', () => {
    expect(swordWorld25Parser('k20 ダメージ KeyNo.20c[10] ＞ 2D:[1,1]=2 ＞ ** ＞ 自動的失敗')).toStrictEqual({
      evaluation: '',
      results: [2],
      target: -1,
      skillName: 'ダメージ',
    });
  });
});

describe('isSwordWorld25Message', () => {
  test('SW2.5固有の威力表出力だけを自動検出の根拠にする', () => {
    expect(isSwordWorld25Message('KeyNo.20c[10] ＞ 2D:[5,3]=8 ＞ 6')).toBe(true);
    expect(isSwordWorld25Message('(2D6+10>=15) ＞ 8[2,6]+10 ＞ 18 ＞ 成功')).toBe(false);
    expect(isSwordWorld25Message('KeyNo.20c[10] ＞ 不完全な出力')).toBe(false);
  });
});
