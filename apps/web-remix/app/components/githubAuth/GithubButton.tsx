import React from 'react';
import { useNavigation } from '@remix-run/react';

import { Button } from '~/components/ui/button';
import { Github } from '~/icons/Github';

type GithubButtonContent = 'Sign in with Github' | 'Sign up with Github';

export const GithubButton: React.FC<{ content?: GithubButtonContent }> = ({
  content = 'Sign in with GitHub',
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
      <Github className="w-6 h-6" />

      <div className="text-sm">{content}</div>
    </Button>
  );
};
