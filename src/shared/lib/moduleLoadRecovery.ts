declare global {
  interface Window {
    __failedModuleUrls?: string[];
  }
}

// modulepreloadはクライアントJSの起動前に失敗するため、beforeInteractiveで捕捉する。
export const moduleLoadRecoveryScript = `
window.__failedModuleUrls = [];
window.addEventListener('error', function(event) {
  var target = event.target;
  var source = target instanceof HTMLScriptElement ? target.src :
    target instanceof HTMLLinkElement && target.rel === 'modulepreload' ? target.href : '';
  if (!source) return;
  var url = new URL(source);
  if (url.origin !== location.origin || !url.pathname.startsWith('/_next/static/')) return;
  window.__failedModuleUrls.push(url.href);
  if (window.__failedModuleUrls.length > 10) window.__failedModuleUrls.shift();
}, true);
`;

export const reloadAfterModuleLoadFailure = async () => {
  const urls = [...new Set(window.__failedModuleUrls)];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3_000);
  // WebKitは失敗したpreloadを文書の再読み込み後も再利用する。no-storeでは解消しない。
  // https://bugs.webkit.org/show_bug.cgi?id=270357
  try {
    await Promise.all(
      urls.map((url) =>
        fetch(url, { cache: 'reload', signal: controller.signal })
          .then((response) => response.arrayBuffer())
          .catch(() => undefined),
      ),
    );
  } finally {
    clearTimeout(timeout);
    window.location.reload();
  }
};
