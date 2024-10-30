import type { PropsWithChildren } from 'react';
import React from 'react';

import { cn } from '~/utils/cn';

export const PreviewSection: React.FC<PropsWithChildren> = ({ children }) => {
  return <section className="relative py-4">{children}</section>;
};

export const PreviewConnector = () => {
  return (
    <div className="w-[1px] bg-muted h-[calc(100%-36px)] absolute top-12 left-[14px]" />
  );
};

export const PreviewSectionHeader: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <header className="flex gap-2 items-center text-white mb-4">
      {children}
    </header>
  );
};

export const PreviewSectionHeading: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return <h3 className="font-medium text-foreground">{children}</h3>;
};

export const PreviewSectionStep: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className="bg-primary border-2 border-primary rounded-lg w-7 h-7 flex justify-center items-center text-primary-foreground text-xs">
      {children}
    </div>
  );
};

export const PreviewSectionContent: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
      {children}
    </div>
  );
};

export const PreviewSectionText: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ children, className, ...rest }) => {
  return (
    <p className={cn('text-foreground text-sm pl-[37px]', className)} {...rest}>
      {children}
    </p>
  );
};

export const PreviewSectionContentWrapper: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ children, className, ...rest }) => {
  return (
    <div className={cn('flex flex-col gap-4 pl-[37px]', className)} {...rest}>
      {children}
    </div>
  );
};

export const PreviewSectionContentTip: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ children, className, ...rest }) => {
  return (
    <div
      className={cn(
        'bg-blue-500/5 border-l-[5px] border-blue-400 pl-4 py-2 rounded-tr rounded-br text-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
