'use client';

import { t } from 'i18next';

import { AdvancedSettings } from './AdvancedSettings';
import { DiceBotHelp } from './DiceBotDescription';
import { DiceCommandInput } from './DiceCommandInput';
import { DiceOutput } from './DiceOutput';
import { GameSystemSelect } from './GameSystemSelect';
import { QuickInput } from './QuickInput';

export const AdvancedDiceRollPanel = () => (
  <div className="space-y-12">
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-sm font-bold">{t('dice:advanced.game-system.label')}</div>
        <GameSystemSelect />
      </div>

      <DiceOutput />
      <QuickInput />
      <DiceCommandInput />
    </div>
    <DiceBotHelp />
    <AdvancedSettings />
  </div>
);
