import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer, request } from 'node:http';

import firebaseConfig from '../firebase/firebase-stripe-e2e.json' with { type: 'json' };

const firestore = firebaseConfig.emulators.firestore;
const proxyPort = firestore.port + 1;

const key = process.env.STRIPE_E2E_SECRET_KEY;
if (!key?.startsWith('sk_test_') && !key?.startsWith('rk_test_')) {
  throw new Error('STRIPE_E2E_SECRET_KEY に専用 Sandbox のテストキーを設定してください');
}
const children = [];
const start = (command, args, options = {}) => {
  const child = spawn(command, args, { stdio: 'inherit', detached: true, ...options });
  children.push(child);
  child.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
  return child;
};
const stop = () => {
  for (const child of children) {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  }
  proxy.close();
};
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
process.on('exit', stop);

// サービスアカウントで動くサーバーの REST SDK にのみ管理権限を付ける。
// レスポンス・永続化は本物の Emulator、ブラウザの通信には Security Rules が適用される。
const proxy = createServer((req, res) => {
  if (req.url === '/disabled') {
    res.writeHead(204);
    res.end();
    return;
  }
  const upstream = request(
    {
      hostname: firestore.host,
      port: firestore.port,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `${firestore.host}:${firestore.port}`, authorization: 'Bearer owner' },
    },
    (response) => {
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    },
  );
  upstream.on('error', () => {
    res.writeHead(502);
    res.end();
  });
  req.pipe(upstream);
});
proxy.listen(proxyPort, firestore.host);
await once(proxy, 'listening');

const stripe = start(
  'stripe',
  [
    'listen',
    '--events',
    'customer.subscription.created,customer.subscription.updated,customer.subscription.deleted',
    '--forward-to',
    'http://127.0.0.1:3100/api/stripe/webhook',
    '--skip-update',
    '--color',
    'off',
  ],
  { env: { ...process.env, STRIPE_API_KEY: key }, stdio: ['ignore', 'pipe', 'pipe'] },
);
const secret = await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Stripe CLI の接続がタイムアウトしました')), 30_000);
  let output = '';
  const read = (chunk) => {
    output += chunk.toString();
    const lines = output.split('\n');
    output = lines.pop();
    for (const line of lines) {
      const match = line.match(/whsec_[a-zA-Z0-9]+/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[0]);
      }
      // 出力チャンクの境界にかかった署名シークレットも、一行に結合してから伏せる。
      process.stdout.write(`${line.replace(/whsec_[a-zA-Z0-9]+/g, '[redacted]')}\n`);
    }
  };
  stripe.stdout.on('data', read);
  stripe.stderr.on('data', read);
  stripe.once('exit', (code) => {
    clearTimeout(timeout);
    reject(new Error(`Stripe CLI exited: ${code}`));
  });
});
const env = {
  ...process.env,
  STRIPE_SECRET_KEY: key,
  STRIPE_WEBHOOK_SECRET: secret,
  FIRESTORE_EMULATOR_HOST: `${firestore.host}:${proxyPort}`,
  // テレメトリは検証対象外。外部 Discord への通知を避ける。
  STRIPE_DISCORD_WEBHOOK_URL: `http://${firestore.host}:${proxyPort}/disabled`,
  STRIPE_AUDIT_DISCORD_WEBHOOK_URL: '',
};
const firebase = start(
  'node',
  [
    'node_modules/firebase-tools/lib/bin/firebase.js',
    'emulators:exec',
    '--only',
    'auth,firestore,storage',
    '--project',
    'demo-dice-spec-v2',
    '--config',
    'firebase/firebase-stripe-e2e.json',
    `FIRESTORE_EMULATOR_HOST=${firestore.host}:${proxyPort} pnpm preview --host 127.0.0.1 --port 3100 --strictPort`,
  ],
  { env },
);
const [code] = await once(firebase, 'exit');
process.exit(code ?? 1);
