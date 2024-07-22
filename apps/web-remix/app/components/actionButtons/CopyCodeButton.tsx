import React from 'react';
import classNames from 'classnames';
import { Check, Copy } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export function CopyCodeButton({ value }: { value: string }) {
  const { copy, isCopied } = useCopyToClipboard(value ?? '');
  return (
    <IconButton
      size="xxs"
      onlyIcon
      type="button"
      onClick={copy}
      icon={isCopied ? <Check /> : <Copy />}
      className={classNames('h-fit', {
        '!text-foreground': !isCopied,
        '!text-green-500': isCopied,
      })}
    />
  );
}
