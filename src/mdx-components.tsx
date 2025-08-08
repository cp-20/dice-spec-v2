import type { MDXComponents } from 'mdx/types';
import type { FC, ReactNode } from 'react';
import { CustomLink } from '@/shared/components/elements/CustomLink';

const components: MDXComponents = {
  p: (props) => <p className="[&:not(blockquote_*)]:mb-2" {...props} />,
  h1: (props) => <h1 className="text-3xl leading-10 font-bold mb-8" {...props} />,
  h2: (props) => <h2 className="text-xl font-semibold mt-16 mb-4 border-b border-b-gray-300 pb-1" {...props} />,
  h3: (props) => <h3 className="text-lg font-semibold mt-8 mb-2" {...props} />,
  ul: (props) => <ul className="list-disc pl-5 mt-6 mb-4" {...props} />,
  li: (props) => <li className="mb-2" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-gray-300 bg-gray-50 p-2 pl-2 italic text-gray-600 my-6 rounded-sm"
      {...props}
    />
  ),
  a: (props) => <CustomLink className="text-blue-500 font-semibold hover:underline" {...props} />,
  strong: (props) => (
    <strong className="font-bold bg-[linear-gradient(transparent_70%,rgba(255,165,0,.5)_0)] px-1" {...props} />
  ),
};

export const useMDXComponents = (): MDXComponents => {
  return components;
};

type WithCaptionProps = {
  children: ReactNode;
  caption?: string;
};

export const WithCaption: FC<WithCaptionProps> = ({ children, caption }) => {
  return (
    <figure className="my-6">
      {children}
      {caption && (
        <figcaption className="text-sm text-gray-500 font-semibold my-6 italic mt-2 text-center">{caption}</figcaption>
      )}
    </figure>
  );
};
