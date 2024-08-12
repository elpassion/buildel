import React, { useMemo } from 'react';
import startCase from 'lodash.startcase';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';

import type { ChartConfig } from '~/components/ui/chart';
import { ChartContainer } from '~/components/ui/chart';

interface RunRunsEvaluationAverageChartProps {
  average: number;
  label?: string;
}

const chartConfig = {
  average: {
    label: 'Evaluation Average',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export const RunRunsEvaluationAverageChart = ({
  average,
  label,
}: RunRunsEvaluationAverageChartProps) => {
  const chartData = useMemo(() => {
    return [
      { data: 'average', average: average, fill: 'var(--color-average)' },
    ];
  }, [average]);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[180px]"
    >
      <RadialBarChart
        data={chartData}
        startAngle={360 - average * 3.6}
        endAngle={360}
        innerRadius={80}
        outerRadius={110}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-background"
          polarRadius={[86, 74]}
        />
        <RadialBar dataKey="average" background cornerRadius={10} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-4xl font-bold"
                    >
                      {chartData[0].average}%
                    </tspan>
                    {label && (
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        {startCase(label)}
                      </tspan>
                    )}
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
};
