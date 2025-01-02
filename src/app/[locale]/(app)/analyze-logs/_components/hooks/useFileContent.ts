import { atom, useAtom } from 'jotai';

const fileContentAtom = atom('');

export const useFileContent = () => {
  const [fileContent, setFileContent] = useAtom(fileContentAtom);

  return { fileContent, setFileContent };
};
