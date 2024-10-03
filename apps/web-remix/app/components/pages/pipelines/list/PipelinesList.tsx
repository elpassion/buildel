import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

import { BasicLink } from '~/components/link/BasicLink';
import { ItemList } from '~/components/list/ItemList';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

import type { IPipeline } from '../pipeline.types';
import {
  PipelineListItemContent,
  PipelineListItemHeader,
  PipelinesListItem,
} from './PipelinesListItem';

interface PipelinesListProps {
  pipelines: IPipeline[];
  className?: string;
  'aria-label'?: string;
  onDelete?: (pipeline: IPipeline, e: React.MouseEvent<HTMLDivElement>) => void;
  onToggleFavorite?: (
    pipeline: IPipeline,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => void;
}

export const PipelinesList: React.FC<PipelinesListProps> = ({
  pipelines,
  className,
  onDelete,
  onToggleFavorite,
  ...rest
}) => {
  return (
    <ItemList
      aria-label="Workflows list"
      items={pipelines}
      renderItem={(item) => (
        <BasicLink to={routes.pipelineBuild(item.organization_id, item.id)}>
          <PipelinesListItem className="flex flex-col relative group">
            <PipelineListItemHeader pipeline={item} onDelete={onDelete} />
            <PipelineListItemContent pipeline={item} />

            <button
              className={cn(
                'font-light hover:text-blue-500 absolute bottom-2 right-2 lg:bottom-4 lg:right-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all',
                {
                  'lg:translate-x-4 lg:opacity-0 text-muted-foreground':
                    !item.favorite,
                  'text-foreground': item.favorite,
                },
              )}
              onClick={(e) => onToggleFavorite?.(item, e)}
              aria-label="Toggle favorite"
            >
              {item.favorite ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </PipelinesListItem>
        </BasicLink>
      )}
      className={cn('grid gap-4 grid-cols-1 sm:grid-cols-2', className)}
      {...rest}
    />
  );
};
