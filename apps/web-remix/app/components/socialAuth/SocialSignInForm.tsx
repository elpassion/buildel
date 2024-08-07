import type { PropsWithChildren } from 'react';
import React from 'react';
import { Form } from '@remix-run/react';

import { cn } from '~/utils/cn';

interface SocialSignInFormProps {
  className?: string;
  action: string;
}

export const SocialSignInForm: React.FC<
  PropsWithChildren<SocialSignInFormProps>
> = ({ className, children, action }) => {
  return (
    <Form action={action} method="post" className={cn('w-full', className)}>
      {children}
    </Form>
  );
};
