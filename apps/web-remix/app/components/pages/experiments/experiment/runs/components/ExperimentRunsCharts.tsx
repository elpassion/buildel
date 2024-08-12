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

export const ExperimentRunsCharts = () => {
  const { experimentRuns } = useLoaderData<typeof loader>();
  const { onMouseMove, onMouseLeave } = useHighlightedRows(experimentRuns);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Evaluations In Time</CardTitle>
          <CardDescription>
            Average evaluations of experiment runs in time.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <EvaluationsInTimeChart
            data={experimentRuns}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          />
        </CardContent>
      </Card>
    </div>
  );
};
