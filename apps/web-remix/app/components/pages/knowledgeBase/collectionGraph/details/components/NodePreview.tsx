import React from 'react';
import { Check, Copy } from 'lucide-react';

import type { IconButtonProps } from '~/components/iconButton';
import { IconButton } from '~/components/iconButton';
import type { BasicLinkProps } from '~/components/link/BasicLink';
import { BasicLink } from '~/components/link/BasicLink';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

import type { IMemoryNodeDetails } from '../../collectionGraph.types';

interface NodePreviewProps {
  details: IMemoryNodeDetails;
  collectionName: string;
}

export const NodePreview = ({ details, collectionName }: NodePreviewProps) => {
  const organizationId = useOrganizationId();

  return (
    <section>
      <div className="flex flex-col divide-y">
        <NodePreviewRow>
          <NodePreviewRowHeading>
            Id
            <NodePreviewRowCopyButton value={details.id} />
          </NodePreviewRowHeading>
          <NodePreviewRowContent className="line-clamp-1">
            {details.id}
          </NodePreviewRowContent>
        </NodePreviewRow>

        <NodePreviewRow>
          <NodePreviewRowHeading>
            File name
            <NodePreviewRowCopyButton value={details.file_name} />
          </NodePreviewRowHeading>
          <NodePreviewRowContent>{details.file_name}</NodePreviewRowContent>
        </NodePreviewRow>

        {details.prev && (
          <NodePreviewRow>
            <NodePreviewRowHeading>
              Prev
              <NodePreviewRowCopyButton value={details.prev} />
            </NodePreviewRowHeading>
            <NodePreviewRowLink
              className="line-clamp-1"
              to={routes.collectionGraphDetails(
                organizationId,
                collectionName,
                { chunk_id: details.prev },
              )}
            >
              {details.prev}
            </NodePreviewRowLink>
          </NodePreviewRow>
        )}

        {details.next && (
          <NodePreviewRow>
            <NodePreviewRowHeading>
              Next
              <NodePreviewRowCopyButton value={details.next} />
            </NodePreviewRowHeading>
            <NodePreviewRowLink
              className="line-clamp-1"
              to={routes.collectionGraphDetails(
                organizationId,
                collectionName,
                { chunk_id: details.next },
              )}
            >
              {details.next}
            </NodePreviewRowLink>
          </NodePreviewRow>
        )}

        <NodePreviewRow>
          <NodePreviewRowHeading>
            Content
            <NodePreviewRowCopyButton value={details.content} />
          </NodePreviewRowHeading>
          <NodePreviewRowContent>{details.content}</NodePreviewRowContent>
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
    <p
      className={cn(
        'text-foreground text-base whitespace-wrap break-words',
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

function NodePreviewRowLink({ children, className, ...rest }: BasicLinkProps) {
  return (
    <BasicLink
      className={cn(
        'text-foreground text-base font-semibold hover:underline',
        className,
      )}
      {...rest}
    >
      {children}
    </BasicLink>
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
