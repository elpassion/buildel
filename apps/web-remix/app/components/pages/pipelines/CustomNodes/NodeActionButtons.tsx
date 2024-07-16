import type { HTMLProps } from 'react';
import React from 'react';
import { Icon } from '@elpassion/taco';
import classNames from 'classnames';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useDownloadFile } from '~/hooks/useDownloadFile';

export function NodeCopyButton({ text }: { text: string }) {
  const { copy, isCopied } = useCopyToClipboard(text);

  return (
    <NodeActionButton className="w-[52px]" onClick={copy}>
      {isCopied ? null : <Icon iconName="copy" />}
      <span className={classNames({ 'text-green-600': isCopied })}>
        {isCopied ? 'Copied!' : 'Copy'}
      </span>
    </NodeActionButton>
  );
}

export function NodeDownloadButton({
  text,
  blockName,
}: {
  text: string;
  blockName: string;
}) {
  const handleDownload = useDownloadFile(text, `${blockName}.txt`);

  return (
    <NodeActionButton onClick={handleDownload}>
      <Icon iconName="download" />
      <span>Download</span>
    </NodeActionButton>
  );
}

export function NodeClearButton({ onClear }: { onClear: () => void }) {
  return (
    <NodeActionButton onClick={onClear}>
      <Icon iconName="trash" />
      <span>Clear</span>
    </NodeActionButton>
  );
}

export function NodeActionButton({
  children,
  className,
  type: _,
  ...rest
}: HTMLProps<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        'text-xs text-neutral-100 rounded px-1 py-[2px] flex items-center gap-1 hover:text-primary-500',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
