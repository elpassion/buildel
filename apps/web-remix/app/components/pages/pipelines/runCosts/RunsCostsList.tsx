import React from 'react';
import classNames from 'classnames';

import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { dayjs } from '~/utils/Dayjs';

import type { IPipelineCost, IPipelineCosts } from '../pipeline.types';

interface PipelineRunCostsListProps {
  items: IPipelineCosts;
}

export const PipelineRunCostsList: React.FC<PipelineRunCostsListProps> = ({
  items,
}) => {
  return (
    <ItemList
      aria-label="Run cost list"
      className="flex flex-col-reverse gap-2"
      items={items.map((item) => item.data)}
      emptyText={<EmptyMessage>There is no costs yet...</EmptyMessage>}
      renderItem={(item) => <PipelineRunCostsItem data={item} />}
    />
  );
};

const LIST_LAYOUT_STYLES =
  'grid gap-1 grid-cols-[2fr_2fr_2fr_1fr_1fr] md:gap-2 md:grid-cols-[3fr_2fr_2fr_1fr_1fr]';

export const PipelineRunCostsListHeader = () => {
  return (
    <header
      className={classNames('text-white text-xs py-2 px-6', LIST_LAYOUT_STYLES)}
    >
      <p>Block</p>
      <p>Time</p>
      <p>Costs ($)</p>
      <p>Input tokens</p>
      <p>Output tokens</p>
    </header>
  );
};

interface PipelineRunCostsItemProps {
  data: IPipelineCost;
}

export const PipelineRunCostsItem: React.FC<PipelineRunCostsItemProps> = ({
  data,
}) => {
  return (
    <article
      className={classNames(
        'group bg-neutral-800 hover:bg-neutral-850 transition rounded-lg py-4 px-6 max-w-full items-center md:gap-2',
        LIST_LAYOUT_STYLES,
      )}
    >
      <header className="max-w-full truncate">
        <h3 className="text-lg font-medium text-white truncate max-w-full">
          {data.description}
        </h3>
      </header>

      <p className="text-white text-sm">
        {dayjs(data.created_at).format('DD MMM HH:mm')}
      </p>

      <p className="text-white text-sm">{Number(data.amount).toFixed(10)}</p>

      <p className="text-white text-sm">{Number(data.input_tokens)}</p>

      <p className="text-white text-sm">{Number(data.output_tokens)}</p>
    </article>
  );
};
