'use client';

import { useEffect, useState } from 'react';
import type { FC, FormEventHandler } from 'react';
import { useDiceRoll } from '@/app/(app)/dice/_components/hooks/useDiceRoll';
import { useDiceRollValidation } from '@/app/(app)/dice/_components/hooks/useDiceRollOption';
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
        <Button type="submit" className="font-bold" disabled={!isValid}>
          ロール
        </Button>
      </div>
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </form>
  );
};
