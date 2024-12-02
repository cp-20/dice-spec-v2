'use client';

import { IconAdjustments } from '@tabler/icons-react';
import { t } from 'i18next';
import type { FC } from 'react';
import { AdvancedSettingsContent } from './AdvancedSettingsContent';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';

export const AdvancedSettings: FC = () => (
  <Accordion type="single" collapsible className="border-t">
    <AccordionItem value="item-1">
      <AccordionTrigger className="p-0">
        <div className="inline-flex gap-2 p-2 font-bold">
          <IconAdjustments />
          <span>{t('dice:advanced.advanced-settings.label')}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <AdvancedSettingsContent />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
