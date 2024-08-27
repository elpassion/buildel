import * as React from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { useMediaQuery } from 'usehooks-ts';

import { cn } from '~/utils/cn';

import type { DialogContentProps } from './dialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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

  //@todo temp fix for "Warning: useLayoutEffect does nothing on the server..." until https://github.com/emilkowalski/vaul/pull/368 is merged
  return (
    <ClientOnly fallback={null}>
      {() => <Component {...props}>{children}</Component>}
    </ClientOnly>
  );
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
}: DialogDrawerProps & Pick<DialogContentProps, 'onInteractOutside'>) => {
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
    <Component className={cn('px-5 md:px-1', className)} {...props}>
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
      <div className="px-1">{children}</div>
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
