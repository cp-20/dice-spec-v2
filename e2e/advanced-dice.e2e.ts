import { expect, test, type Page } from '@playwright/test';

const openAdvanced = async (page: Page) => {
  await page.goto('/ja/dice');
  await page.getByRole('tab', { name: 'アドバンスド' }).click();
  await expect(page.getByRole('button', { name: 'DiceBot', exact: true })).toHaveAttribute('aria-busy', 'false');
};

const selectSystem = async (page: Page, current: string, next: string) => {
  await page.getByRole('button', { name: current, exact: true }).click();
  await page.getByPlaceholder('ゲームシステムを検索').fill(next);
  await page.getByRole('option', { name: next, exact: true }).click();
};

test('システム・入力検証・判定表示・お気に入りを維持し、オフラインで再ロールできる', async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    if (!localStorage.getItem('game-system-list')) {
      localStorage.setItem(
        'game-system-list',
        JSON.stringify([
          { id: 'MissingSystem', name: '保存済みシステム', sort_key: '' },
          { id: 'Cthulhu7th', name: '旧名称', sort_key: '' },
        ]),
      );
    }
  });
  await openAdvanced(page);
  await page.getByRole('button', { name: 'DiceBot', exact: true }).click();
  await expect(page.getByRole('option', { name: /保存済みシステム/ })).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('option', { name: '新クトゥルフ神話TRPG', exact: true }).click();
  await expect(page.getByRole('button', { name: '新クトゥルフ神話TRPG', exact: true })).toHaveAttribute(
    'aria-busy',
    'false',
  );

  const input = page.getByPlaceholder('コマンドを入力してください');
  const roll = page.getByRole('button', { name: 'ダイスを振る', exact: true });
  await input.fill('invalid');
  await expect(roll).toBeDisabled();
  await expect(page.getByText('コマンドの形式が不正です', { exact: true })).toBeVisible();
  await input.fill('CC<=60');
  await roll.click();
  await expect(input).toHaveValue('');
  const cthulhuResults = page.getByText(/^\(1D100<=60\).*＞/);
  await expect(cthulhuResults).toHaveCount(1);
  await expect(page.getByText('Cthulhu7th', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'CC<=60', exact: true })
    .locator('..')
    .getByRole('button', { name: /をお気に入りに登録$/ })
    .click();

  await selectSystem(page, '新クトゥルフ神話TRPG', 'DiceBot');
  await expect(page.getByRole('button', { name: 'DiceBot', exact: true })).toHaveAttribute('aria-busy', 'false');
  await input.fill('CC<=60');
  await expect(roll).toBeDisabled();
  await input.fill('1D6>=1');
  await roll.click();
  await expect(page.getByText(/^\(1D6>=1\).*＞/)).toHaveClass(/text-blue-500/);
  await input.fill('1D6>=7');
  await roll.click();
  await expect(page.getByText(/^\(1D6>=7\).*＞/)).toHaveClass(/text-red-600/);

  await page.context().setOffline(true);
  await selectSystem(page, 'DiceBot', '新クトゥルフ神話TRPG');
  await page.getByRole('button', { name: 'CC<=60', exact: true }).click();
  await expect(cthulhuResults).toHaveCount(2);
  await page.getByRole('tab', { name: 'シンプル', exact: true }).click();
  await page.getByRole('tab', { name: 'アドバンスド' }).click();
  await expect(page.getByRole('button', { name: '新クトゥルフ神話TRPG', exact: true })).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await expect(cthulhuResults).toHaveCount(2);
  await page.context().setOffline(false);

  await page.reload();
  await page.getByRole('tab', { name: 'アドバンスド' }).click();
  await expect(
    page
      .getByRole('button', { name: 'CC<=60', exact: true })
      .locator('..')
      .getByRole('button', { name: /をお気に入りから削除$/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'DiceBot', exact: true }).click();
  await expect(page.getByRole('option').first()).toHaveText('新クトゥルフ神話TRPG');
  await expect(page.getByRole('option', { name: /保存済みシステム/ })).toHaveAttribute('aria-disabled', 'true');
});

test.describe('チャンク通信の制御', () => {
  // Service Worker経由の通信はpage.routeで遮断できない。
  test.use({ serviceWorkers: 'block' });

  test('切り替え中は名称・スケルトン・表示領域を保ち、チャンク取得失敗から再読み込みで復旧できる', async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openAdvanced(page);
    const input = page.getByPlaceholder('コマンドを入力してください');
    const inputTop = await input.evaluate((element) => (element as HTMLElement).offsetTop);
    const help = page.getByText(/の使い方$/, { exact: false }).locator('..');
    const helpHeight = await help.evaluate((element) => element.clientHeight);
    const gate = Promise.withResolvers<void>();
    await page.route('**/_next/static/chunks/**', async (route) => {
      await gate.promise;
      await route.continue();
    });
    try {
      await selectSystem(page, 'DiceBot', '新クトゥルフ神話TRPG');
      await expect(page.getByRole('button', { name: /新クトゥルフ神話TRPG/ })).toHaveAttribute('aria-busy', 'true');
      await expect(page.getByText('「新クトゥルフ神話TRPG」の使い方', { exact: true })).toBeVisible();
      await expect(help.locator('[aria-hidden="true"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'ダイスを振る', exact: true })).toBeDisabled();
      expect(await input.evaluate((element) => (element as HTMLElement).offsetTop)).toBe(inputTop);
      expect(await help.evaluate((element) => element.clientHeight)).toBe(helpHeight);
    } finally {
      gate.resolve();
    }
    await expect(page.getByRole('button', { name: '新クトゥルフ神話TRPG', exact: true })).toHaveAttribute(
      'aria-busy',
      'false',
    );
    await expect(help).toContainText('CC');
    expect(await input.evaluate((element) => (element as HTMLElement).offsetTop)).toBe(inputTop);
    expect(await help.evaluate((element) => element.clientHeight)).toBe(helpHeight);
    await page.unroute('**/_next/static/chunks/**');

    await page.route('**/_next/static/chunks/**', async (route) => {
      // 対象エンジンだけを失敗させ、UI用チャンクは遮断しない。
      const response = await route.fetch();
      if ((await response.text()).includes('SwordWorld2_5')) await route.abort();
      else await route.fulfill({ response });
    });
    await selectSystem(page, '新クトゥルフ神話TRPG', 'ソード・ワールド2.5');
    const error = page.getByRole('alert').filter({ hasText: 'ゲームシステムを読み込めませんでした。' });
    await expect(error).toBeVisible();
    await expect(page.getByRole('button', { name: 'ダイスを振る', exact: true })).toBeDisabled();
    await page.unroute('**/_next/static/chunks/**');
    await error.getByRole('button', { name: 'ページを再読み込み' }).click();
    await page.getByRole('tab', { name: 'アドバンスド' }).click();
    await expect(page.getByRole('button', { name: 'DiceBot', exact: true })).toHaveAttribute('aria-busy', 'false');
    await selectSystem(page, 'DiceBot', 'ソード・ワールド2.5');
    await input.fill('K20+5');
    await page.getByRole('button', { name: 'ダイスを振る', exact: true }).click();
    await expect(page.getByText('SwordWorld2.5', { exact: true })).toBeVisible();
    await expect(error).toHaveCount(0);
  });
});

test('旧設定のヘルプ・音量を読み込み、設定変更を再読み込み後も保持する', async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    if (!localStorage.getItem('dice-advanced-settings')) {
      localStorage.setItem(
        'dice-advanced-settings',
        JSON.stringify({
          showHelp: true,
          playSound: false,
          volume: 25,
          bcdiceApiEndpoint: 'old-invalid-endpoint',
        }),
      );
    }
  });
  await openAdvanced(page);
  await expect(page.getByText('「DiceBot」の使い方', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '高度な設定', exact: true }).click();
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '25');
  await page.getByRole('switch', { name: 'ヘルプを表示する' }).click();
  await expect(page.getByText('「DiceBot」の使い方', { exact: true })).toHaveCount(0);
  await page.getByRole('switch', { name: 'サウンドを再生する' }).click();
  await page.getByRole('slider').focus();
  await page.getByRole('slider').press('ArrowRight');
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '26');
  await page.reload();
  await page.getByRole('tab', { name: 'アドバンスド' }).click();
  await page.getByRole('button', { name: '高度な設定', exact: true }).click();
  await expect(page.getByRole('switch', { name: 'ヘルプを表示する' })).not.toBeChecked();
  await expect(page.getByRole('switch', { name: 'サウンドを再生する' })).toBeChecked();
  await expect(page.getByRole('slider')).toHaveAttribute('aria-valuenow', '26');
});
