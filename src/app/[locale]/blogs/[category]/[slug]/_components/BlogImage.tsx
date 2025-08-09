import clsx from 'clsx';
import Image from 'next/image';
import type { FC } from 'react';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  border?: boolean;
};

export const BlogImage: FC<Props> = ({ src, alt, width, height, border }) => {
  return (
    <div className={clsx('mt-4 mb-8 flex justify-center', border && 'border rounded-md overflow-hidden')}>
      <Image src={`/assets/blog-images/${src}`} alt={alt} width={width} height={height} />
    </div>
  );
};
