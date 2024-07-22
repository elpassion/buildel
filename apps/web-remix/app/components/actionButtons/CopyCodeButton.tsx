import React from 'react';
import { Check, Copy } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { cn } from '~/utils/cn';

export function CopyCodeButton({ value }: { value: string }) {
  const { copy, isCopied } = useCopyToClipboard(value ?? '');
  return (
    <IconButton
      size="xxs"
      onlyIcon
      type="button"
      onClick={copy}
      icon={isCopied ? <Check /> : <Copy />}
      className={cn('h-fit', {
        '!text-foreground': !isCopied,
        '!text-green-500': isCopied,
      })}
    />
  );
}
