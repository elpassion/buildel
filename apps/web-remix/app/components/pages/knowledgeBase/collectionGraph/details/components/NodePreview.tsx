import React from 'react';
import { useOutletContext } from '@remix-run/react';
import { Check, Copy } from 'lucide-react';
import type { z } from 'zod';

import type { IconButtonProps } from '~/components/iconButton';
import { IconButton } from '~/components/iconButton';
import type { BasicLinkProps } from '~/components/link/BasicLink';
import { BasicLink } from '~/components/link/BasicLink';
import {
  getColorForUid,
  NEXT_NODE_COLOR,
  PREV_NODE_COLOR,
} from '~/components/pages/knowledgeBase/collectionGraph/collectionGraph.utils';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

import type { SearchSchema } from '../../../knowledgeBaseSearch/schema';
import type { IMemoryNodeDetails } from '../../collectionGraph.types';

interface NodePreviewProps {
  details: IMemoryNodeDetails;
  collectionName: string;
  searchParams: Partial<z.TypeOf<typeof SearchSchema>>;
}

export const NodePreview = ({
  details,
  collectionName,
  searchParams,
}: NodePreviewProps) => {
  const { onMouseLeave, onMouseOver } = useOutletContext<{
    onMouseOver: (
      id: string,
      options?: { highlightAllMemoryNodes?: string | number },
    ) => void;
    onMouseLeave: () => void;
  }>();
  const organizationId = useOrganizationId();

  return (
    <section>
      <div className="flex flex-col divide-y">
        <NodePreviewRow>
          <NodePreviewRowHeading>
            Id
            <NodePreviewRowCopyButton value={details.id} />
          </NodePreviewRowHeading>
          <NodePreviewRowContent
            className="line-clamp-1 font-semibold cursor-pointer"
            onMouseEnter={() => {
              onMouseOver(details.id.toString());
            }}
            onMouseLeave={onMouseLeave}
          >
            {details.id}
          </NodePreviewRowContent>
        </NodePreviewRow>

        <NodePreviewRow>
          <NodePreviewRowHeading>
            <div className="flex gap-1 justify-start items-center">
              <div
                style={{
                  backgroundColor: getColorForUid(details.memory_id.toString()),
                }}
                className="w-1.5 h-1.5 rounded-full"
              />
              <span>File name</span>
            </div>
            <NodePreviewRowCopyButton value={details.file_name} />
          </NodePreviewRowHeading>
          <NodePreviewRowContent
            className="font-semibold cursor-pointer"
            onMouseEnter={() => {
              onMouseOver(details.id.toString(), {
                highlightAllMemoryNodes: details.memory_id,
              });
            }}
            onMouseLeave={onMouseLeave}
          >
            {details.file_name}
          </NodePreviewRowContent>
        </NodePreviewRow>

        {details.prev && (
          <NodePreviewRow>
            <NodePreviewRowHeading>
              <div className="flex gap-1 justify-start items-center">
                <div
                  style={{ backgroundColor: PREV_NODE_COLOR }}
                  className="w-1.5 h-1.5 rounded-full"
                />
                <span>Prev</span>
              </div>

              <NodePreviewRowCopyButton value={details.prev} />
            </NodePreviewRowHeading>
            <NodePreviewRowLink
              className="line-clamp-1"
              onMouseEnter={() => onMouseOver(details.prev!.toString())}
              onMouseLeave={onMouseLeave}
              onClick={onMouseLeave}
              to={routes.collectionGraphDetails(
                organizationId,
                collectionName,
                { chunk_id: details.prev, ...searchParams },
              )}
            >
              {details.prev}
            </NodePreviewRowLink>
          </NodePreviewRow>
        )}

        {details.next && (
          <NodePreviewRow>
            <NodePreviewRowHeading>
              <div className="flex gap-1 justify-start items-center">
                <div
                  style={{ backgroundColor: NEXT_NODE_COLOR }}
                  className={cn('w-1.5 h-1.5 rounded-full')}
                />
                <span>Next</span>
              </div>
              <NodePreviewRowCopyButton value={details.next} />
            </NodePreviewRowHeading>
            <NodePreviewRowLink
              onMouseEnter={() => onMouseOver(details.next!.toString())}
              onMouseLeave={onMouseLeave}
              onClick={onMouseLeave}
              className="line-clamp-1"
              to={routes.collectionGraphDetails(
                organizationId,
                collectionName,
                { chunk_id: details.next, ...searchParams },
              )}
            >
              {details.next}
            </NodePreviewRowLink>
          </NodePreviewRow>
        )}

        <NodePreviewRow>
          <NodePreviewRowHeading>
            Keywords
            <NodePreviewRowCopyButton value={details.keywords.toString()} />
          </NodePreviewRowHeading>
          <NodePreviewRowContent>
            {details.keywords.toString()}
          </NodePreviewRowContent>
        </NodePreviewRow>

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
