'use client';

import type { FC } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { Cthulhu6thOpposedPanel } from './systemSpecific/panels/Cthulhu6thOpposedPanel';
import { Cthulhu7thPanel } from './systemSpecific/panels/Cthulhu7thPanel';
import { DoubleCross3rdPanel } from './systemSpecific/panels/DoubleCross3rdPanel';
import { EmoklorePanel } from './systemSpecific/panels/EmoklorePanel';

export const SystemSpecificExpectations: FC = () => (
  <section className="space-y-4">
    <div className="space-y-1">
      <h2 className="text-xl font-bold text-slate-800">システム別予測</h2>
      <p className="text-sm leading-6 text-slate-600">
        ゲームシステム固有の判定ルールに合わせて、成功率や結果分布を計算できます。
      </p>
    </div>

    <Tabs defaultValue="cthulhu6th">
      <TabsList className="h-auto flex-wrap justify-start">
        <TabsTrigger value="cthulhu6th">クトゥルフ</TabsTrigger>
        <TabsTrigger value="cthulhu7th">新クトゥルフ</TabsTrigger>
        <TabsTrigger value="emoklore">エモクロア</TabsTrigger>
        <TabsTrigger value="doublecross3rd">DX3rd</TabsTrigger>
      </TabsList>
      <TabsContent value="cthulhu6th">
        <Cthulhu6thOpposedPanel />
      </TabsContent>
      <TabsContent value="cthulhu7th">
        <Cthulhu7thPanel />
      </TabsContent>
      <TabsContent value="emoklore">
        <EmoklorePanel />
      </TabsContent>
      <TabsContent value="doublecross3rd">
        <DoubleCross3rdPanel />
      </TabsContent>
    </Tabs>
  </section>
);
