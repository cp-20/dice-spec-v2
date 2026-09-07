import assert from 'node:assert/strict';

import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const context = await browser.newContext({ serviceWorkers: 'block', locale: 'ja-JP' });
context.setDefaultTimeout(15_000);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.setBlockedURLs', {
  urls: ['*google-analytics.com*', '*googletagmanager.com*', '*sentry.io*', '*sentry-cdn.com*', '*googleapis.com*'],
});
const apiRequests = [];
page.on('request', (request) => {
  if (request.url().includes('/v2/game_system')) apiRequests.push(request.url());
});
try {
  await page.addInitScript(() => {
    if (!localStorage.getItem('game-system-list'))
      localStorage.setItem(
        'game-system-list',
        JSON.stringify([
          { id: 'MissingSystem', name: '保存済みの未収録システム', sort_key: '' },
          { id: 'DiceBot', name: 'DiceBot', sort_key: '*たいすほつと' },
        ]),
      );
    if (!localStorage.getItem('dice-advanced-settings'))
      localStorage.setItem(
        'dice-advanced-settings',
        JSON.stringify({
          showHelp: true,
          playSound: false,
          volume: 25,
          bcdiceApiEndpoint: 'https://unavailable.invalid',
        }),
      );
  });
  await page.goto('http://127.0.0.1:3406/ja/dice');
  await page.getByRole('tab', { name: 'アドバンスド', exact: true }).click();
  const trigger = page.locator('button[aria-expanded]').filter({ has: page.locator('svg.lucide-chevrons-up-down') });
  await trigger.click();
  assert.equal(
    await page.getByRole('option').filter({ hasText: '保存済みの未収録システム' }).getAttribute('aria-disabled'),
    'true',
  );
  await page.keyboard.press('Escape');
  const choose = async (name) => {
    await trigger.click();
    await page.getByPlaceholder('ゲームシステムを検索').fill(name);
    await page.getByRole('option', { name, exact: true }).click();
  };
  const roll = async (id, command) => {
    const logs = page.locator('.flex.text-sm').filter({ hasText: id });
    const count = await logs.count();
    await page.getByPlaceholder('コマンドを入力してください').fill(command);
    await page.getByRole('button', { name: 'ダイスを振る', exact: true }).click();
    await logs.nth(count).waitFor();
  };
  await choose('新クトゥルフ神話TRPG');
  await roll('Cthulhu7th', 'CC<=50');
  await context.setOffline(true);
  await roll('Cthulhu7th', 'CC<=50');
  await choose('DiceBot');
  await roll('DiceBot', '1D6');
  const savedBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('game-system-list')));
  await choose('ソード・ワールド2.5');
  await page.getByRole('alert').filter({ hasText: 'ゲームシステムを読み込めませんでした。' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'ダイスを振る', exact: true }).isDisabled(), true);
  const savedAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('game-system-list')));
  assert.ok(savedBefore.every((old) => savedAfter.some((current) => current.id === old.id)));
  await context.setOffline(false);
  await page.getByRole('button', { name: 'ページを再読み込み', exact: true }).click();
  await page.getByRole('tab', { name: 'アドバンスド', exact: true }).click();
  await choose('ソード・ワールド2.5');
  await roll('SwordWorld2.5', 'K20+5');
  await page.getByRole('tab', { name: 'シンプル', exact: true }).click();
  await page.getByRole('tab', { name: 'アドバンスド', exact: true }).click();
  assert.equal(await trigger.textContent(), 'ソード・ワールド2.5');
  assert.deepEqual(apiRequests, []);
  const restored = await page.evaluate(() => ({
    systems: JSON.parse(localStorage.getItem('game-system-list')),
    settings: JSON.parse(localStorage.getItem('dice-advanced-settings')),
  }));
  assert.ok(savedAfter.every((saved) => restored.systems.some((system) => system.id === saved.id)));
  assert.equal(restored.settings.volume, 25);
  console.log(
    '取得済みシステムのオフラインロール、未取得チャンクの失敗と再読み込みによる復旧、未収録 ID の保持、タブ再表示、API通信ゼロを確認しました。',
  );
} finally {
  await browser.close();
}
