import React from 'react';
import { useNavigation } from '@remix-run/react';

import { Github } from '~/icons/Github';

type GithubButtonContent = 'Sign in with Github' | 'Sign up with Github';

export const GithubButton: React.FC<{ content?: GithubButtonContent }> = ({
  content = 'Sign in with GitHub',
}) => {
  const { state } = useNavigation();

  const disabled = state !== 'idle';

  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex items-center justify-center gap-[10px] w-full text-[#1f1f1f] bg-[#F2F2F2] px-3 py-[10px] rounded-lg font-['Roboto'] font-medium"
    >
      <Github className="w-6 h-6" />

      <div className="text-sm">{content}</div>
    </button>
  );
};
