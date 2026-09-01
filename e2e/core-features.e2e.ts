import { expect, test } from './fixtures/firebase';

const logHtml = `<!DOCTYPE html>
<html lang="ja">
  <body>
    <p style="color:#4caf50;">
      <span> [main]</span>
      <span>E2E探索者</span> :
      <span>CC&lt;=60 【聞き耳】 (1D100&lt;=60) ボーナス・ペナルティダイス[0] ＞ 45 ＞ 45 ＞ レギュラー成功</span>
    </p>
    <p style="color:#4caf50;">
      <span> [main]</span>
      <span>E2E探索者</span> :
      <span>CC&lt;=30 【目星】 (1D100&lt;=30) ボーナス・ペナルティダイス[0] ＞ 95 ＞ 95 ＞ 失敗</span>
    </p>
  </body>
</html>`;

const additionalLogHtml = `<!DOCTYPE html>
<html lang="ja">
  <body>
    <p style="color:#2196f3;">
      <span> [info]</span>
      <span>E2E相棒</span> :
      <span>CC&lt;=70 【図書館】 (1D100&lt;=70) ボーナス・ペナルティダイス[0] ＞ 20 ＞ 20 ＞ ハード成功</span>
    </p>
  </body>
</html>`;

test('シンプルダイスを振ると結果を表示する', async ({ page }) => {
  await page.goto('/ja/dice');
  await page.getByRole('button', { name: '1D6', exact: true }).click();

  await expect(page.getByText(/^1D6 => [1-6]\[[1-6]\] => [1-6]$/)).toBeVisible();
});

test('複数種類のシンプルダイスをまとめて振り、入力をリセットできる', async ({ page }) => {
  await page.goto('/ja/dice');
  await page.getByRole('button', { name: 'D6を増やす' }).click();
  await page.getByRole('button', { name: 'D6を増やす' }).click();
  await page.getByRole('button', { name: 'D20を増やす' }).click();
  await page.getByRole('button', { name: 'ダイスロール', exact: true }).click();

  await expect(page.getByText(/^2D6 \+ 1D20 => \d+\[\d+, \d+\] \+ \d+\[\d+\] => \d+$/)).toBeVisible();

  await page.getByRole('button', { name: 'リセット' }).click();
  await expect(page.getByText('0D6', { exact: true })).toBeVisible();
  await expect(page.getByText('0D20', { exact: true })).toBeVisible();
});

test('ゲームシステムを選択してBCDiceのコマンドを実行する', async ({ page }) => {
  await page.route('https://bcdice.onlinesession.app/v2/game_system**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === '/v2/game_system') {
      await route.fulfill({
        json: {
          game_system: [
            { id: 'DiceBot', name: 'DiceBot', sort_key: '*たいすほつと' },
            { id: 'Cthulhu7th', name: '新クトゥルフ神話TRPG', sort_key: 'しんくとうるふ' },
          ],
        },
      });
      return;
    }

    if (url.pathname === '/v2/game_system/Cthulhu7th/roll') {
      expect(url.searchParams.get('command')).toBe('CC<=60');
      await route.fulfill({
        json: {
          ok: true,
          text: 'CC<=60 (1D100<=60) ＞ 42 ＞ レギュラー成功',
          secret: false,
          success: true,
          failure: false,
          critical: false,
          fumble: false,
          rands: [{ kind: 'normal', sides: 100, value: 42 }],
        },
      });
      return;
    }

    await route.fulfill({
      json: {
        id: 'Cthulhu7th',
        name: '新クトゥルフ神話TRPG',
        sort_key: 'しんくとうるふ',
        command_pattern: '^CC<=\\d+$',
        help_message: 'CC<=技能値で判定します。',
      },
    });
  });

  await page.goto('/ja/dice');
  await page.getByRole('tab', { name: 'アドバンスド' }).click();
  await page.getByRole('button', { name: 'DiceBot' }).click();
  await page.getByPlaceholder('ゲームシステムを検索').fill('新クトゥルフ');
  await page.getByRole('option', { name: '新クトゥルフ神話TRPG' }).click();
  await expect(page.getByRole('button', { name: '新クトゥルフ神話TRPG' })).toBeVisible();

  await page.getByPlaceholder('コマンドを入力してください').fill('CC<=60');
  await page.getByRole('button', { name: 'ダイスを振る' }).click();

  await expect(page.getByText('Cthulhu7th', { exact: true })).toBeVisible();
  await expect(page.getByText('CC<=60 (1D100<=60) ＞ 42 ＞ レギュラー成功')).toBeVisible();
});

test('ダイス式の確率と統計を計算する', async ({ page }) => {
  await page.goto('/ja/expect');
  await page.getByPlaceholder('計算式を入力してください').fill('1D100<=25');
  await page.getByRole('button', { name: '計算', exact: true }).click();

  await expect(page.getByText('確率', { exact: true }).locator('..')).toContainText('25%');
  await expect(page.getByText('平均値', { exact: true }).locator('..')).toContainText('50.5');
  await expect(page.getByText('範囲', { exact: true }).locator('..')).toContainText('1 - 100');
});

test('対応するゲームシステム固有の確率計算を切り替えられる', async ({ page }) => {
  await page.goto('/ja/expect');
  await page.getByRole('heading', { name: 'システム別予測' }).scrollIntoViewIfNeeded();

  const cthulhu6th = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'クトゥルフ神話TRPG: 対抗ロール' }),
  });
  await cthulhu6th.getByLabel('能動側の能力値').fill('12');
  await expect(cthulhu6th.getByText('能動側 60%')).toBeVisible();

  await page.getByRole('tab', { name: '新クトゥルフ神話TRPG' }).click();
  await expect(page.getByRole('heading', { name: '新クトゥルフ神話TRPG: ボーナス・ペナルティダイス' })).toBeVisible();

  await page.getByRole('tab', { name: 'エモクロアTRPG' }).click();
  await expect(page.getByRole('heading', { name: 'エモクロアTRPG: 成功度の分布' })).toBeVisible();

  await page.getByRole('tab', { name: 'ダブルクロス3rd' }).click();
  await expect(page.getByRole('heading', { name: 'ダブルクロス The 3rd Edition: クリティカル' })).toBeVisible();
});

test('ログをアップロードするとゲームシステムを判定して集計する', async ({ page }) => {
  await page.goto('/ja/analyze-logs');
  await page.locator('#log-file-uploader').setInputFiles({
    name: 'e2e-session.html',
    mimeType: 'text/html',
    buffer: Buffer.from(logHtml),
  });

  await expect(page.getByText('e2e-session.html')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'ゲームシステムを選択' })).toContainText('新クトゥルフ神話TRPG');
  await expect(page.getByText('成功率', { exact: true }).first().locator('..')).toContainText('50%');
  await expect(page.getByText('ダイスを振った回数', { exact: true }).first().locator('..')).toContainText('2回');
  await expect(page.getByText(/\[メイン\].*聞き耳/)).toBeVisible();
  await expect(page.getByText(/\[メイン\].*目星/)).toBeVisible();
});

test('複数ログをタブとキャラクターで絞り込み、選択を解除できる', async ({ page }) => {
  await page.goto('/ja/analyze-logs');
  await page.locator('#log-file-uploader').setInputFiles([
    {
      name: 'e2e-main-session.html',
      mimeType: 'text/html',
      buffer: Buffer.from(logHtml),
    },
    {
      name: 'e2e-info-session.html',
      mimeType: 'text/html',
      buffer: Buffer.from(additionalLogHtml),
    },
  ]);

  await expect(page.getByText('e2e-main-session.html')).toBeVisible();
  await expect(page.getByText('e2e-info-session.html')).toBeVisible();
  await expect(page.getByText('ダイスを振った回数', { exact: true }).first().locator('..')).toContainText('3回');

  await page.getByRole('checkbox', { name: '[情報]' }).click();
  await expect(page.getByText('ダイスを振った回数', { exact: true }).first().locator('..')).toContainText('2回');
  await expect(page.getByText(/\[情報\].*図書館/)).toHaveCount(0);

  await page.getByRole('checkbox', { name: '[情報]' }).click();
  await page.getByRole('combobox', { name: 'キャラを選択' }).click();
  await page.getByRole('option', { name: 'E2E相棒' }).click();
  await expect(page.getByText('ダイスを振った回数', { exact: true }).first().locator('..')).toContainText('1回');
  await expect(page.getByText(/\[情報\].*図書館/)).toBeVisible();
  await expect(page.getByText(/\[メイン\].*聞き耳/)).toHaveCount(0);

  await page.getByRole('button', { name: '選択したログを削除' }).click();
  await expect(
    page.getByText('クリックしてアップロード、あるいはドラッグアンドドロップしてアップロード'),
  ).toBeVisible();
});

test('ログ解析を保存し、タイトル変更後に削除できる', async ({ firebaseUser: _firebaseUser, page }) => {
  test.slow();
  await page.goto('/ja/analyze-logs');
  await page.locator('#log-file-uploader').setInputFiles({
    name: 'e2e-persistence-session.html',
    mimeType: 'text/html',
    buffer: Buffer.from(logHtml),
  });
  await page.getByPlaceholder('シナリオ名など').fill('E2E保存テスト');
  await page.getByRole('button', { name: '保存する' }).click();

  await expect(page).toHaveURL(/\/analyze-logs\/[^/]+$/, { timeout: 20_000 });
  await expect(page.getByRole('heading', { name: 'E2E保存テスト' })).toBeVisible();

  await page.getByRole('button', { name: '編集', exact: true }).click();
  const editDialog = page.getByRole('dialog', { name: '解析結果を編集' });
  await editDialog.getByLabel('タイトル').fill('E2E更新後テスト');
  await editDialog.getByRole('button', { name: '保存' }).click();
  await expect(page.getByRole('heading', { name: 'E2E更新後テスト' })).toBeVisible();

  await page.getByRole('button', { name: '削除', exact: true }).click();
  const deleteDialog = page.getByRole('dialog', { name: '解析結果を削除' });
  await deleteDialog.getByRole('button', { name: '削除', exact: true }).click();
  await expect(page).toHaveURL(/\/analyze-logs\/list$/);
});
