'use client';

import { t } from 'i18next';
import { useEffect, useState } from 'react';
import type { FC, FormEventHandler } from 'react';
import { useDiceRoll } from './hooks/useDiceRoll';
import { useDiceRollValidation } from './hooks/useDiceRollOption';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export const DiceCommandInput: FC = () => {
  const { diceRoll } = useDiceRoll();
  const { validate } = useDiceRollValidation();

  const [command, setCommand] = useState('');
  const isValid = command === '' || validate(command);

  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setCommand('');
    const result = await diceRoll(command);

    if (result.ok) {
      setErrorMessage('');
    } else {
      setErrorMessage(t('error-failed'));
    }
  };

  useEffect(() => {
    if (isValid) {
      setErrorMessage('');
    } else {
      setErrorMessage(t('error-invalid'));
    }
  }, [isValid]);

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <div className="flex gap-4">
        <Input
          placeholder={t('dice:advanced.input.placeholder')}
          className="flex-1"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <Button type="submit" className="font-bold" disabled={!isValid}>
          {t('dice:advanced.input.roll-dice')}
        </Button>
      </div>
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </form>
  );
};
