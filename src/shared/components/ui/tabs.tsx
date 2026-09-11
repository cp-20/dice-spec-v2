'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@/shared/lib/shadcn-utils';

const Tabs = TabsPrimitive.Root;

const TabsList: React.FC<React.ComponentPropsWithRef<typeof TabsPrimitive.List>> = ({ ref, className, ...props }) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}
    {...props}
  />
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger: React.FC<React.ComponentPropsWithRef<typeof TabsPrimitive.Trigger>> = ({
  ref,
  className,
  ...props
}) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:font-bold data-[state=active]:text-slate-700 data-[state=active]:shadow-xs',
      className,
    )}
    {...props}
  />
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent: React.FC<React.ComponentPropsWithRef<typeof TabsPrimitive.Content>> = ({
  ref,
  className,
  ...props
}) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
