import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import type { IExperimentRunRun } from '~/components/pages/experiments/experiments.types';
import type { ChartConfig } from '~/components/ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';

const chartConfig = {
  column: {
    label: 'Column',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface RunRunsNumericChartProps {
  data: IExperimentRunRun[];
  column: keyof IExperimentRunRun['data'];
}

export function RunRunsNumericChart({
  data,
  column,
}: RunRunsNumericChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => {
      return {
        id: item.id,
        [column]: item.data[column],
      };
    });
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="id" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip
          cursor={true}
          content={<ChartTooltipContent indicator="dot" hideLabel />}
        />
        <Area
          dataKey={column}
          type="linear"
          fill="var(--color-column)"
          fillOpacity={0.4}
          stroke="var(--color-column)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
