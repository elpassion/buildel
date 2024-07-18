import React from 'react';
import { useNavigation } from '@remix-run/react';

import { Button } from '~/components/ui/button';
import { Google } from '~/icons/Google';

type GoogleButtonContent = 'Sign in with Google' | 'Sign up with Google';

export const GoogleButton: React.FC<{ content?: GoogleButtonContent }> = ({
  content = 'Sign in with Google',
}) => {
  const { state } = useNavigation();

  const disabled = state !== 'idle';

  return (
    <Button
      type="submit"
      disabled={disabled}
      isFluid
      className="flex gap-[10px] items-center"
      variant="secondary"
    >
      <Google className="w-6 h-6" />

      <div className="text-sm">{content}</div>
    </Button>
  );
};
