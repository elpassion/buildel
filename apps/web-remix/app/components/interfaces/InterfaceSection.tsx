import type { PropsWithChildren } from 'react';
import React from 'react';

import { cn } from '~/utils/cn';

interface InterfaceSectionWrapperProps {
  className?: string;
}

export const InterfaceSectionWrapper: React.FC<
  PropsWithChildren<InterfaceSectionWrapperProps>
> = ({ className, children }) => {
  return (
    <article
      className={cn('bg-transparent border border-input rounded-xl', className)}
    >
      {children}
    </article>
  );
};

interface InterfaceSectionHeaderProps {
  className?: string;
}

export const InterfaceSectionHeader: React.FC<
  PropsWithChildren<InterfaceSectionHeaderProps>
> = ({ children, className }) => {
  return (
    <header className={cn('w-full bg-muted px-6 py-4 rounded-t-xl', className)}>
      {children}
    </header>
  );
};

export const InterfaceSectionHeading: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return <h3 className="text-foreground text-sm font-medium">{children}</h3>;
};

export const InterfaceSectionHeaderParagraph: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return <p className="text-muted-foreground text-xs">{children}</p>;
};
