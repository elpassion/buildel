import React from 'react';
import classNames from 'classnames';

import { BasicLink } from '~/components/link/BasicLink';
import { ItemList } from '~/components/list/ItemList';
import { routes } from '~/utils/routes.utils';

import type { IPipeline } from '../pipeline.types';
import { PipelineListItemHeader, PipelinesListItem } from './PipelinesListItem';

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
          </PipelinesListItem>
        </BasicLink>
      )}
      className={classNames('flex flex-col gap-2', className)}
    />
  );
};
