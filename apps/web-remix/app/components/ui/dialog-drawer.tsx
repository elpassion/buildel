'use client';

import * as React from 'react';
import { PropsWithChildren } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { cn } from '~/utils/cn';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';

interface BaseProps {
  children: React.ReactNode;
}

interface DialogDrawerRootProps extends BaseProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogDrawerProps extends BaseProps {
  className?: string;
  asChild?: true;
}

const desktop = '(min-width: 768px)';

const DialogDrawer = ({ children, ...props }: DialogDrawerRootProps) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? Dialog : Drawer;

  return <Component {...props}>{children}</Component>;
};

const DialogDrawerTrigger = ({
  className,
  children,
  ...props
}: DialogDrawerProps) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogTrigger : DrawerTrigger;

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

const DialogDrawerClose = ({
  className,
  children,
  ...props
}: DialogDrawerProps) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogClose : DrawerClose;

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

const DialogDrawerContent = ({
  className,
  children,
  ...props
}: DialogDrawerProps) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogContent : DrawerContent;

  return (
    <Component className={cn('max-h-[96vh]', className)} {...props}>
      {children}
    </Component>
  );
};

const DialogDrawerDescription = ({
  className,
  children,
  ...props
}: DialogDrawerProps) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogDescription : DrawerDescription;

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

const DialogDrawerHeader = ({
  className,
  children,
  ...props
}: DialogDrawerProps) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogHeader : DrawerHeader;

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

const DialogDrawerTitle = ({
  className,
  children,
  ...props
}: DialogDrawerProps) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogTitle : DrawerTitle;

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

const DialogDrawerBody = ({
  className,
  children,
  ...props
}: DialogDrawerProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'overflow-y-auto md:max-h-[76vh] px-4 pb-4 md:px-0 md:pb-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DialogDrawerFooter = ({
  className,
  children,
  ...props
}: DialogDrawerProps) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogFooter : DrawerFooter;

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

export {
  DialogDrawer,
  DialogDrawerTrigger,
  DialogDrawerClose,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerBody,
  DialogDrawerTitle,
  DialogDrawerHeader,
  DialogDrawerFooter,
};
