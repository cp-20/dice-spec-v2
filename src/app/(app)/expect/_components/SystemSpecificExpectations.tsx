'use client';

import dynamic from 'next/dynamic';
import { type FC, useEffect, useRef, useState } from 'react';

const SystemSpecificExpectationTabs = dynamic(
  () => import('./SystemSpecificExpectationTabs').then((mod) => mod.SystemSpecificExpectationTabs),
  { ssr: false, loading: () => <div className="h-80" /> },
);

export const SystemSpecificExpectations: FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: '50px' },
    );
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">システム別予測</h2>
        <p className="text-sm leading-6 text-slate-600">
          ゲームシステム固有の判定ルールに合わせて、成功率や結果分布を計算できます。
        </p>
      </div>
      <div ref={contentRef}>{visible ? <SystemSpecificExpectationTabs /> : <div className="h-80" />}</div>
    </section>
  );
};
