import { atom, useAtom } from 'jotai';

const formResultAtom = atom('');

export const useFormResult = () => {
  const [formResult, setFormResult] = useAtom(formResultAtom);

  return {
    formResult,
    setFormResult,
  };
};
