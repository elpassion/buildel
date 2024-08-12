import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import type { CategoricalChartState } from 'recharts/types/chart/types';

import type { IExperimentRun } from '~/components/pages/experiments/experiments.types';
import type { ChartConfig } from '~/components/ui/chart';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import { dayjs } from '~/utils/Dayjs';

const chartConfig = {
  column: {
    label: 'Column',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface EvaluationsInTimeChartProps {
  data: IExperimentRun[];
  onMouseMove?: (state: CategoricalChartState) => void;
  onMouseLeave?: () => void;
}

export function EvaluationsInTimeChart({
  data,
  onMouseMove,
  onMouseLeave,
}: EvaluationsInTimeChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => {
      return {
        date: dayjs(item.created_at).format('DD MMM HH:mm'),
        average: item.evaluations_avg
          ? +item.evaluations_avg.toFixed(2)
          : item.evaluations_avg,
        id: item.id,
      };
    });
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="h-[180px] w-full">
      <AreaChart
        accessibilityLayer
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={true}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey="average"
          type="linear"
          fill="var(--color-column)"
          fillOpacity={0.4}
          stroke="var(--color-column)"
          connectNulls
          dot
        />
      </AreaChart>
    </ChartContainer>
  );
}
