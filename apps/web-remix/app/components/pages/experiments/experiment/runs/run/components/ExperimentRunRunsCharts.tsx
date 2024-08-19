import React from 'react';
import { useLoaderData } from '@remix-run/react';
import startCase from 'lodash.startcase';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn } from '~/utils/cn';

import { ExperimentRunChartsGrid } from '../../components/ExperimentRunChart.components';
import type { loader } from '../loader.server';
import { ExperimentRunRunsChartsFilter } from './ExperimentRunRunsChartsFilter';
import { RunRunsEvaluationAverageChart } from './RunRunsEvaluationAverageChart';

export const ExperimentRunRunsCharts = () => {
  const { experimentRun } = useLoaderData<typeof loader>();

  return (
    <ExperimentRunRunsChartsFilter data={experimentRun.columns_avg}>
      {(data) => {
        return (
          <ExperimentRunChartsGrid
            className={cn('mt-2 flex gap-4 items-center overflow-x-auto')}
          >
            <Card className="w-[250px] shrink-0">
              <CardHeader>
                <CardTitle>Evaluation Average</CardTitle>
                <CardDescription>
                  Average of the evaluation of all rows in the experiment run.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <RunRunsEvaluationAverageChart
                  average={+(experimentRun.evaluations_avg ?? 0).toFixed(2)}
                  label="Evaluation Average"
                />
              </CardContent>
            </Card>

            {data.map(({ data, column }) => (
              <Card key={column} className="w-[250px] shrink-0">
                <CardHeader>
                  <CardTitle>{startCase(column)}</CardTitle>
                  <CardDescription className="h-10">
                    Values of the <span className="font-bold">{column}</span>{' '}
                    column in the experiment run.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <RunRunsEvaluationAverageChart
                    average={+data.toFixed(2)}
                    label={column}
                  />
                </CardContent>
              </Card>
            ))}
          </ExperimentRunChartsGrid>
        );
      }}
    </ExperimentRunRunsChartsFilter>
  );
};
