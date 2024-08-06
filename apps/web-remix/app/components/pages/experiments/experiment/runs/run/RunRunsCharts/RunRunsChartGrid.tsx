import React, { useMemo } from 'react';
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
import { isNotNil } from '~/utils/guards';

import { RunRunsNumericChart } from './RunRunsNumericChart';
import { useHighlightedRows } from './useHighlightedRows';

interface RunRunsChartGridProps {
  data: IExperimentRunRun[];
  columns: (keyof IExperimentRunRun['data'])[];
}

export const RunRunsChartGrid = ({ data, columns }: RunRunsChartGridProps) => {
  const { onMouseMove, onMouseLeave } = useHighlightedRows(data);

  const charts = useMemo(() => {
    return columns
      .map((column) => {
        if (!isNumeric(data[0]?.data?.[column])) return null;

        return (
          <Card key={column}>
            <CardHeader>
              <CardTitle>{startCase(column)}</CardTitle>
              <CardDescription>
                Show the values of the{' '}
                <span className="font-bold">{column}</span> column in the
                experiment run runs.
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
        );
      })
      .filter(isNotNil);
  }, [data, columns]);

  return (
    <div
      className={cn(
        'mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
        { 'h-[80px]': charts.length === 0 },
      )}
    >
      {charts}
    </div>
  );
};

function isNumeric(value: any) {
  return !isNaN(parseFloat(value));
}
