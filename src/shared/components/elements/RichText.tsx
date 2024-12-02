import type { ComponentProps, FC } from 'react';
import { Text } from '@/shared/components/Typography/Text';

export type PlainTextProps = {
  text: string;
};

export const RichText: FC<ComponentProps<'p'> & PlainTextProps> = ({ text, ...props }) => {
  const children = replaceBr(text).flatMap((child) => (typeof child === 'string' ? replaceLink(child) : child));

  return <Text {...props}>{children}</Text>;
};

const replaceBr = (text: string) =>
  text.split('\n').flatMap((text, index) => {
    if (index === 0) {
      return text;
    }
    return [<br key={index} />, text];
  });

const replaceLink = (text: string) => {
  const regex = /https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+/g;

  const matches = text.match(regex);

  if (matches === null) {
    return text;
  }

  const links = matches.map((match) => (
    <a key={match} href={match} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500">
      {match}
    </a>
  ));

  return text.split(regex).flatMap((text, index) => {
    if (index === 0) {
      return text;
    }

    return [links[index - 1], text];
  });
};
