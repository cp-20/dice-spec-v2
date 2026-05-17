'use client';

import { t } from 'i18next';
import type { FC } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { Cthulhu6thOpposedPanel } from './systemSpecific/panels/Cthulhu6thOpposedPanel';
import { Cthulhu7thPanel } from './systemSpecific/panels/Cthulhu7thPanel';
import { DoubleCross3rdPanel } from './systemSpecific/panels/DoubleCross3rdPanel';
import { EmoklorePanel } from './systemSpecific/panels/EmoklorePanel';

export const SystemSpecificExpectations: FC = () => (
  <section className="space-y-4">
    <div className="space-y-1">
      <h2 className="text-xl font-bold text-slate-800">{t('expect:system-specific.title')}</h2>
      <p className="text-sm leading-6 text-slate-600">{t('expect:system-specific.description')}</p>
    </div>

    <Tabs defaultValue="cthulhu6th">
      <TabsList className="h-auto flex-wrap justify-start">
        <TabsTrigger value="cthulhu6th">クトゥルフ神話TRPG</TabsTrigger>
        <TabsTrigger value="cthulhu7th">新クトゥルフ神話TRPG</TabsTrigger>
        <TabsTrigger value="emoklore">エモクロアTRPG</TabsTrigger>
        <TabsTrigger value="doublecross3rd">ダブルクロス3rd</TabsTrigger>
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
