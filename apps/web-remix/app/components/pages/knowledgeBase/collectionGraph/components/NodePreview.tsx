import React from 'react';
import { Check, Copy } from 'lucide-react';

import type { IconButtonProps } from '~/components/iconButton';
import { IconButton } from '~/components/iconButton';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { cn } from '~/utils/cn';

import type { IEmbeddingNode } from '../collectionGraph.types';

interface NodePreviewProps {
  node: IEmbeddingNode;
}

export const NodePreview = ({ node }: NodePreviewProps) => {
  return (
    <section>
      <div className="flex flex-col divide-y">
        <NodePreviewRow>
          <NodePreviewRowHeading>
            Id
            <NodePreviewRowCopyButton value={node.data.id} />
          </NodePreviewRowHeading>
          <NodePreviewRowContent>{node.data.id}</NodePreviewRowContent>
        </NodePreviewRow>

        <NodePreviewRow>
          <NodePreviewRowHeading>
            Content
            <NodePreviewRowCopyButton value={node.data.content} />
          </NodePreviewRowHeading>
          <NodePreviewRowContent>{node.data.content}</NodePreviewRowContent>
        </NodePreviewRow>
      </div>
    </section>
  );
};

function NodePreviewRow({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('py-3', className)} {...rest}>
      {children}
    </div>
  );
}

function NodePreviewRowHeading({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={cn(
        'text-muted-foreground text-sm flex justify-between items-center',
        className,
      )}
      {...rest}
    >
      {children}
    </h4>
  );
}

function NodePreviewRowContent({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-foreground text-base', className)} {...rest}>
      {children}
    </p>
  );
}

function NodePreviewRowCopyButton({
  value,
  className,
  ...rest
}: Omit<IconButtonProps, 'icon'> & { value: string | number }) {
  const { copy, isCopied } = useCopyToClipboard(value.toString() ?? '');
  return (
    <IconButton
      size="xxs"
      onlyIcon
      type="button"
      onClick={copy}
      icon={isCopied ? <Check /> : <Copy />}
      className={cn('h-fit', className, {
        '!text-foreground': !isCopied,
        '!text-green-500': isCopied,
      })}
      {...rest}
    />
  );
}
