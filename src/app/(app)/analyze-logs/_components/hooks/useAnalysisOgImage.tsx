import { toPng } from 'html-to-image';
import { useCallback, useLayoutEffect } from 'react';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

import type { DiceResultForCharacter } from '@/features/log-analysis/model';

import { SharingAnalysisResultScreen } from '../SharingAnalysisResultScreen';

type RenderNotifierProps<Props extends object = object> = {
  Component: ComponentType<Props>;
  componentProps: Props;
  onRendered: () => void;
};

const RenderNotifier = <Props extends object>({
  Component,
  componentProps,
  onRendered,
}: RenderNotifierProps<Props>) => {
  useLayoutEffect(() => {
    const animationFrameId = requestAnimationFrame(() => {
      onRendered();
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, [onRendered]);

  return <Component {...componentProps} />;
};

export const useAnalysisOgImage = () => {
  const generateOgImage = useCallback(async (result: Pick<DiceResultForCharacter, 'summary'>, scenarioName: string) => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.width = '1200px';
    container.style.height = '630px';
    container.style.top = '-2000px';
    container.style.left = '-2000px';

    const inner = document.createElement('div');
    inner.style.width = '100%';
    inner.style.height = '100%';
    container.appendChild(inner);

    document.body.appendChild(container);

    const root = createRoot(inner);

    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Rendering timed out'));
        }, 3000);
        root.render(
          <RenderNotifier
            Component={() => <SharingAnalysisResultScreen scenarioName={scenarioName} analysisResult={result} />}
            componentProps={{ scenarioName, analysisResult: result }}
            onRendered={resolve}
          />,
        );
      });
      const dataUrl = await toPng(inner);
      return dataUrl;
    } catch (err) {
      console.error('Error rendering image component:', err);
      throw err;
    } finally {
      root.unmount();
      document.body.removeChild(container);
      container.remove();
    }
  }, []);

  return { generateOgImage };
};
