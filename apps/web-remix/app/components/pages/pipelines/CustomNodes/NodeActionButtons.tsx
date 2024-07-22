import type { HTMLProps } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Copy, Download, Trash } from 'lucide-react';

import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useDownloadFile } from '~/hooks/useDownloadFile';

export function NodeCopyButton({ text }: { text: string }) {
  const { copy, isCopied } = useCopyToClipboard(text);

  return (
    <NodeActionButton className="w-[52px]" onClick={copy}>
      {isCopied ? null : <Copy className="w-3.5 h-3.5" />}
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
      <Download className="w-3.5 h-3.5" />
      <span>Download</span>
    </NodeActionButton>
  );
}

export function NodeClearButton({ onClear }: { onClear: () => void }) {
  return (
    <NodeActionButton onClick={onClear}>
      <Trash className="w-3.5 h-3.5" />
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
        'text-xs text-muted-foreground rounded px-1 py-[2px] flex items-center gap-1 hover:text-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
