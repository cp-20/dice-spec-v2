import type { ChangeEventHandler, DragEventHandler } from 'react';
import { useCallback, useState } from 'react';

type DropHandler = (filename: string, content: string) => void;

export const useDropzone = <Element = HTMLElement>(dropHandler: DropHandler) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.addEventListener('load', (e) => {
        if (e.target?.result) {
          dropHandler(file.name, e.target.result.toString());
        }
      });
      reader.readAsText(file);
    },
    [dropHandler],
  );

  const handleDrop: DragEventHandler<Element> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggedOver(false);

      const file = e.dataTransfer.files[0];
      if (file === null || file === undefined) return;
      readFile(file);
    },
    [readFile],
  );

  const handleDragEnter: DragEventHandler<Element> = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggedOver(true);
  }, []);

  const handleDragLeave: DragEventHandler<Element> = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggedOver(false);
  }, []);

  const handleDragOver: DragEventHandler<Element> = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file === null || file === undefined) return;

      readFile(file);
    },
    [readFile],
  );

  const containerProps = {
    onDrop: handleDrop,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
  };

  const inputProps = {
    onChange: handleInputChange,
  };

  return { containerProps, inputProps, isDraggedOver };
};
