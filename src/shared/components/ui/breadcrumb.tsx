import { Slot } from '@radix-ui/react-slot';
import { ChevronRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/shadcn-utils';

const Breadcrumb: React.FC<React.ComponentPropsWithRef<'nav'>> = ({ ref, ...props }) => (
  <nav ref={ref} aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList: React.FC<React.ComponentPropsWithRef<'ol'>> = ({ ref, className, ...props }) => (
  <ol
    ref={ref}
    data-slot="breadcrumb-list"
    className={cn(
      'text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5',
      className,
    )}
    {...props}
  />
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem: React.FC<React.ComponentPropsWithRef<'li'>> = ({ ref, className, ...props }) => (
  <li ref={ref} data-slot="breadcrumb-item" className={cn('inline-flex items-center gap-1.5', className)} {...props} />
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink: React.FC<React.ComponentPropsWithRef<'a'> & { asChild?: boolean }> = ({
  ref,
  asChild,
  className,
  ...props
}) => {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      ref={ref}
      data-slot="breadcrumb-link"
      className={cn('hover:text-foreground transition-colors', className)}
      {...props}
    />
  );
};
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage: React.FC<React.ComponentPropsWithRef<'a'>> = ({ ref, className, ...props }) => (
  // oxlint-disable-next-line jsx_a11y/anchor-has-content
  <a
    ref={ref}
    data-slot="breadcrumb-page"
    aria-disabled="true"
    aria-current="page"
    className={cn('text-foreground font-medium', className)}
    {...props}
  />
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator: React.FC<React.ComponentPropsWithRef<'li'>> = ({ ref, children, className, ...props }) => (
  <li
    ref={ref}
    data-slot="breadcrumb-separator"
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:size-3.5', className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator };
