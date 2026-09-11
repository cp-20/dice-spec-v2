import type { FC } from 'react';

import { ProgressLink, type ProgressLinkProps } from './NavigationProgress';

export type CustomLinkProps = Omit<ProgressLinkProps, 'href'> & { href: string };

export const CustomLink: FC<CustomLinkProps> = (props) => <ProgressLink {...props} />;
