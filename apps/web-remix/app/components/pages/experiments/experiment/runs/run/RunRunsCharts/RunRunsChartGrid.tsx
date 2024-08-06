import React from 'react';
import startCase from 'lodash.startcase';

import type { IExperimentRunRun } from '~/components/pages/experiments/experiments.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn } from '~/utils/cn';

import { RunRunsChartsFilter } from './RunRunsChartsFilter';
import { RunRunsNumericChart } from './RunRunsNumericChart';
import { useHighlightedRows } from './useHighlightedRows';

interface RunRunsChartGridProps {
  data: IExperimentRunRun[];
  columns: (keyof IExperimentRunRun['data'])[];
}

export const RunRunsChartGrid = ({ data, columns }: RunRunsChartGridProps) => {
  const { onMouseMove, onMouseLeave } = useHighlightedRows(data);

  return (
    <RunRunsChartsFilter data={data} columns={columns}>
      {(data) => {
        return (
          <div
            className={cn(
              'mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-2',
              { hidden: data.length === 0 },
            )}
          >
            {data.map(({ data, column }) => (
              <Card key={column}>
                <CardHeader>
                  <CardTitle>{startCase(column)}</CardTitle>
                  <CardDescription>
                    Values of the <span className="font-bold">{column}</span>{' '}
                    column in the experiment run runs.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <RunRunsNumericChart
                    onMouseMove={onMouseMove}
                    onMouseLeave={onMouseLeave}
                    column={column}
                    data={data}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        );
      }}
    </RunRunsChartsFilter>
  );
};
