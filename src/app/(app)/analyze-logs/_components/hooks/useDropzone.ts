import type { ChangeEventHandler, DragEventHandler } from 'react';
import { useCallback, useState } from 'react';

type DropHandler = (files: File[]) => void;

export const useDropzone = <Element = HTMLElement>(dropHandler: DropHandler) => {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDrop: DragEventHandler<Element> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggedOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      dropHandler(files);
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
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      dropHandler(files);
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
