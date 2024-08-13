import React from 'react';
import { useLoaderData } from '@remix-run/react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

import type { loader } from '../loader.server';
import { useHighlightedRows } from '../useHighlightedRows';
import { EvaluationsInTimeChart } from './EvaluationsInTimeChart';
import { ExperimentRunChartsGrid } from './ExperimentRunChart.components';

export const ExperimentRunsCharts = () => {
  const { experimentRuns } = useLoaderData<typeof loader>();
  const { onMouseMove, onMouseLeave } = useHighlightedRows(experimentRuns);

  return (
    <ExperimentRunChartsGrid>
      <Card>
        <CardHeader>
          <CardTitle>Evaluations In Time</CardTitle>
          <CardDescription>
            Average evaluations of experiment runs in time.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <EvaluationsInTimeChart
            data={experimentRuns.slice().reverse()}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          />
        </CardContent>
      </Card>
    </ExperimentRunChartsGrid>
  );
};
