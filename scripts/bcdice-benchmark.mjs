import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { gzipSync, brotliCompressSync } from 'node:zlib';

import { chromium } from '@playwright/test';

const [variant = 'api', output = '/tmp/406-benchmark', repeats = '5'] = process.argv.slice(2);
const origin = 'http://127.0.0.1:3406';
const sizes = {};
for (const file of await readdir('.next/static/chunks', { recursive: true })) {
  if (!file.endsWith('.js')) continue;
  const body = await readFile(`.next/static/chunks/${file}`);
  sizes[`/_next/static/chunks/${file}`] = {
    raw: body.length,
    gzip: gzipSync(body).length,
    brotli: brotliCompressSync(body).length,
  };
}
const browser = await chromium.launch({ headless: true });
const report = {
  variant,
  date: new Date().toISOString(),
  browser: browser.version(),
  node: process.version,
  os: `${os.type()} ${os.release()}`,
  cpu: os.cpus()[0].model,
  sizes,
  runs: [],
};
await mkdir(output, { recursive: true });
const systems = [
  { id: 'Cthulhu7th', name: '新クトゥルフ神話TRPG', command: 'CC<=50' },
  { id: 'SwordWorld2.5', name: 'ソード・ワールド2.5', command: 'K20+5' },
];
try {
  for (const profile of ['normal', 'mobile']) {
    for (let iteration = 0; iteration < Number(repeats); iteration++) {
      const context = await browser.newContext({ serviceWorkers: 'block', locale: 'ja-JP' });
      context.setDefaultTimeout(30_000);
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.clearBrowserCache');
      await cdp.send('Performance.enable');
      await cdp.send('Network.setBlockedURLs', {
        urls: [
          '*google-analytics.com*',
          '*googletagmanager.com*',
          '*sentry.io*',
          '*googleapis.com*',
          '*doubleclick.net*',
        ],
      });
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: profile === 'mobile' ? 150 : 0,
        downloadThroughput: profile === 'mobile' ? 1_600_000 / 8 : -1,
        uploadThroughput: profile === 'mobile' ? 750_000 / 8 : -1,
      });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile === 'mobile' ? 4 : 1 });
      for (const cache of ['cold', 'warm']) {
        const run = { profile, iteration, cache, systems, phases: [], requests: [], errors: [] };
        const pending = new Map();
        const request = (event) => {
          pending.set(event.requestId, { url: event.request.url, type: event.type, start: event.timestamp });
        };
        const response = (event) => {
          Object.assign(pending.get(event.requestId) ?? {}, {
            status: event.response.status,
            fromDiskCache: event.response.fromDiskCache,
            encoding: event.response.headers['content-encoding'],
          });
        };
        const cached = (event) => {
          Object.assign(pending.get(event.requestId) ?? {}, { fromCache: true });
        };
        const finished = (event) => {
          const item = pending.get(event.requestId);
          if (item) run.requests.push({ ...item, end: event.timestamp, bytes: event.encodedDataLength });
        };
        const failed = (event) => {
          const item = pending.get(event.requestId);
          if (item) run.requests.push({ ...item, error: event.errorText });
        };
        cdp.on('Network.requestWillBeSent', request);
        cdp.on('Network.responseReceived', response);
        cdp.on('Network.requestServedFromCache', cached);
        cdp.on('Network.loadingFinished', finished);
        cdp.on('Network.loadingFailed', failed);
        const pageError = (error) => run.errors.push(error.message);
        page.on('pageerror', pageError);
        const phase = async (name, action) => {
          const start = await cdp.send('Performance.getMetrics');
          const begin = performance.now();
          const index = run.requests.length;
          const operationMs = await action();
          const end = await cdp.send('Performance.getMetrics');
          const metric = (metrics, key) => metrics.metrics.find((m) => m.name === key)?.value ?? 0;
          run.phases.push({
            name,
            ms: performance.now() - begin,
            operationMs,
            scriptMs: (metric(end, 'ScriptDuration') - metric(start, 'ScriptDuration')) * 1000,
            taskMs: (metric(end, 'TaskDuration') - metric(start, 'TaskDuration')) * 1000,
            requests: run.requests.slice(index),
          });
        };
        try {
          await phase('navigation', async () => {
            await page.goto(`${origin}/ja/dice`, { waitUntil: 'networkidle' });
            await page.getByRole('tab', { name: 'アドバンスド', exact: true }).waitFor();
          });
          await phase('open', async () => {
            await page.getByRole('tab', { name: 'アドバンスド', exact: true }).click();
            await page.getByRole('button', { name: 'DiceBot', exact: true }).click();
            await page.getByRole('option', { name: systems[0].name, exact: true }).waitFor();
          });
          // 入力・検索や Playwright の待機時間と、クリックから表示までの時間を分ける。
          const arm = async (target, system, mode, count = 0) => {
            await target.evaluate(
              (element, { system, mode, count }) => {
                window.bcdiceBenchmarkTiming = { start: null, ms: null };
                const observer = new MutationObserver(() => {
                  const timing = window.bcdiceBenchmarkTiming;
                  if (timing.start === null) return;
                  const ready =
                    mode === 'roll'
                      ? [...document.querySelectorAll('.flex.text-sm')].filter((row) =>
                          row.textContent.includes(system.id),
                        ).length > count
                      : [...document.querySelectorAll('button[aria-expanded]')].some(
                          (button) =>
                            button.textContent.trim() === system.name && button.getAttribute('aria-busy') !== 'true',
                        );
                  if (ready) {
                    observer.disconnect();
                    requestAnimationFrame(() => {
                      timing.ms = performance.now() - timing.start;
                    });
                  }
                });
                observer.observe(document.body, {
                  subtree: true,
                  childList: true,
                  attributes: true,
                  characterData: true,
                });
                element.addEventListener(
                  'click',
                  () => {
                    window.bcdiceBenchmarkTiming.start = performance.now();
                  },
                  { once: true, capture: true },
                );
              },
              { system, mode, count },
            );
          };
          const operationTime = async () => {
            await page.waitForFunction(() => window.bcdiceBenchmarkTiming.ms !== null);
            return page.evaluate(() => window.bcdiceBenchmarkTiming.ms);
          };
          const choose = async (system, alreadyOpen = false) => {
            if (!alreadyOpen)
              await page
                .locator('button[aria-expanded]')
                .filter({ has: page.locator('svg.lucide-chevrons-up-down') })
                .click();
            await page.getByPlaceholder('ゲームシステムを検索').fill(system.name);
            const option = page.getByRole('option', { name: system.name, exact: true });
            await arm(option, system, 'select');
            await option.click();
            await page.getByRole('button', { name: system.name, exact: true }).waitFor();
            await page
              .getByRole('button', { name: 'ダイスを振る', exact: true })
              .isEnabled()
              .then(async (enabled) => {
                if (!enabled)
                  await page.waitForFunction(
                    () =>
                      ![...document.querySelectorAll('button')].find((b) => b.textContent === 'ダイスを振る')?.disabled,
                  );
              });
            return operationTime();
          };
          const roll = async (system) => {
            const log = page.locator('.flex.text-sm').filter({ hasText: system.id });
            const count = await log.count();
            await page.getByPlaceholder('コマンドを入力してください').fill(system.command);
            const button = page.getByRole('button', { name: 'ダイスを振る', exact: true });
            await arm(button, system, 'roll', count);
            await button.click();
            await log.nth(count).waitFor();
            return operationTime();
          };
          await phase('select-first', () => choose(systems[0], true));
          await phase('roll-first', () => roll(systems[0]));
          await phase('roll-repeat', () => roll(systems[0]));
          await phase('switch-new', () => choose(systems[1]));
          await phase('roll-other', () => roll(systems[1]));
          await phase('switch-back', () => choose(systems[0]));
          await phase('roll-back', () => roll(systems[0]));
        } catch (error) {
          run.errors.push(error.message);
          await page.screenshot({ path: `${output}/${variant}-${profile}-${iteration}-${cache}.png` });
        }
        cdp.off('Network.requestWillBeSent', request);
        cdp.off('Network.responseReceived', response);
        cdp.off('Network.requestServedFromCache', cached);
        cdp.off('Network.loadingFinished', finished);
        cdp.off('Network.loadingFailed', failed);
        page.off('pageerror', pageError);
        report.runs.push(run);
        await writeFile(`${output}/${variant}.json`, JSON.stringify(report, null, 2));
        console.log(
          variant,
          profile,
          iteration,
          cache,
          run.phases.map((p) => `${p.name}=${p.ms.toFixed(0)}`).join(' '),
          run.errors,
        );
        if (run.errors.length) throw new Error('計測に失敗しました');
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}
