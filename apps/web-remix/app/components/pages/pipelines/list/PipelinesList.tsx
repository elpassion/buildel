import React from 'react';

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
}

export const PipelinesList: React.FC<PipelinesListProps> = ({
  pipelines,
  className,
}) => {
  return (
    <ItemList
      aria-label="Workflows list"
      items={pipelines}
      renderItem={(item) => (
        <BasicLink to={routes.pipelineBuild(item.organization_id, item.id)}>
          <PipelinesListItem className="flex flex-col gap-1">
            <PipelineListItemHeader pipeline={item} />
            <PipelineListItemContent pipeline={item} />
          </PipelinesListItem>
        </BasicLink>
      )}
      className={cn(
        'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    />
  );
};
