import type { ChangeEventHandler, DragEventHandler } from 'react';
import { useCallback, useState } from 'react';

type DropHandler = (file: File) => void;

export const useDropzone = <Element = HTMLElement>(dropHandler: DropHandler) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDrop: DragEventHandler<Element> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggedOver(false);

      const file = e.dataTransfer.files[0];
      if (file === null || file === undefined) return;
      dropHandler(file);
    },
    [dropHandler],
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

      dropHandler(file);
    },
    [dropHandler],
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
