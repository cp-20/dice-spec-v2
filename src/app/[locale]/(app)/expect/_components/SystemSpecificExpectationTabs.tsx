'use client';

import type { FC } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { Cthulhu6thOpposedPanel } from './systemSpecific/panels/Cthulhu6thOpposedPanel';
import { Cthulhu7thPanel } from './systemSpecific/panels/Cthulhu7thPanel';
import { DoubleCross3rdPanel } from './systemSpecific/panels/DoubleCross3rdPanel';
import { EmoklorePanel } from './systemSpecific/panels/EmoklorePanel';

export const SystemSpecificExpectationTabs: FC = () => (
  <Tabs defaultValue="Coc6th">
    <TabsList className="h-auto flex-wrap justify-start">
      <TabsTrigger value="Coc6th">クトゥルフ神話TRPG</TabsTrigger>
      <TabsTrigger value="Coc7th">新クトゥルフ神話TRPG</TabsTrigger>
      <TabsTrigger value="emoklore">エモクロアTRPG</TabsTrigger>
      <TabsTrigger value="doublecross3rd">ダブルクロス3rd</TabsTrigger>
    </TabsList>
    <TabsContent value="Coc6th">
      <Cthulhu6thOpposedPanel />
    </TabsContent>
    <TabsContent value="Coc7th">
      <Cthulhu7thPanel />
    </TabsContent>
    <TabsContent value="emoklore">
      <EmoklorePanel />
    </TabsContent>
    <TabsContent value="doublecross3rd">
      <DoubleCross3rdPanel />
    </TabsContent>
  </Tabs>
);
