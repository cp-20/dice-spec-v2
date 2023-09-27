// CSP用のミドルウェア
// 参考: https://blog.s2n.tech/articles/nextjs-app-dir-csp

import type { NextMiddleware } from 'next/server';
import { NextResponse } from 'next/server';

export const cspMiddleware: NextMiddleware = (req) => {
  // Nonceの生成
  const nonce = generateNonce();
  // CSPヘッダの生成
  const csp = generateCspHeader(nonce);

  // リクエストヘッダを取得
  const headers = new Headers(req.headers);

  // コンポーネント側で取得できるようにリクエストヘッダにも設定
  headers.set('X-CSP-Nonce', nonce);
  // Next.jsが差し込むインラインスクリプトにもNonceが設定されるようにリクエストヘッダにもCSPを設定
  headers.set('Content-Security-Policy', csp);

  // 改変したリクエストヘッダをNextResponseに渡す
  const response = NextResponse.next({
    request: {
      headers,
    },
  });

  // レスポンスヘッダにCSPを設定
  response.headers.set('Content-Security-Policy', csp);

  return response;
};

// Nonceのビット長
// 参考: https://w3c.github.io/webappsec-csp/#security-nonces
const NONCE_BIT_LENGTH = 128;

// Nonceの生成
// Node.jsのAPIは利用できないので、Web Crypto APIを使用
const generateNonce = () => {
  return bufferToHex(
    crypto.getRandomValues(new Uint8Array(NONCE_BIT_LENGTH / 8)),
  );
};

// CSPヘッダの生成
const generateCspHeader = (nonce: string): string => {
  const scriptSrc = [
    "'self'",
    // 開発環境ではevalを許可
    process.env.NODE_ENV === 'development' && "'unsafe-eval'",
    `'nonce-${nonce}'`,
    // Twitterの埋め込みやGoogle Tag Managerを使っている場合は適宜設定
    'https://www.googletagmanager.com',
  ]
    .filter(Boolean)
    .join(' ');

  // CSPの設定
  // 自分のサイトの状況に応じて適宜設定
  const csp = [
    "default-src 'self'",
    "connect-src 'self' https://www.google-analytics.com",
    "frame-src 'self' https://www.googletagmanager.com",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    'font-src * data:',
    'img-src * data:',
  ].join('; ');

  return csp;
};

// ArrayBufferを16進数の文字列に変換する
const bufferToHex = (buffer: ArrayBuffer) => {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};
