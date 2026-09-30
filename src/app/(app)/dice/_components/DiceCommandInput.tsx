'use client';

import { useAtomValue } from 'jotai';
import type { FC, FormEventHandler } from 'react';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

import { useDiceRoll } from './hooks/useDiceRoll';
import { gameSystemAtom } from './hooks/useGameSystem';

export const DiceCommandInput: FC = () => {
  const { diceRoll, disabled } = useDiceRoll();
  const { engine } = useAtomValue(gameSystemAtom);

  const [command, setCommand] = useState('');
  const isValid = disabled || command === '' || !!engine?.COMMAND_PATTERN.test(command);

  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setCommand('');
    const result = diceRoll(command);

    if (result) {
      setErrorMessage('');
    } else {
      setErrorMessage('ロールに失敗しました。コマンドを見直してみてください');
    }
  };

  useEffect(() => {
    if (isValid) {
      setErrorMessage('');
    } else {
      setErrorMessage('コマンドの形式が不正です');
    }
  }, [isValid]);

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <div className="flex gap-4">
        <Input
          placeholder="コマンドを入力してください"
          className="flex-1"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <Button type="submit" className="font-bold" disabled={disabled || !isValid}>
          ダイスを振る
        </Button>
      </div>
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </form>
  );
};
