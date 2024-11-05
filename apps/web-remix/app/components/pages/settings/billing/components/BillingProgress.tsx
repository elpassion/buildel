import React from 'react';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';

import type { ChartConfig } from '~/components/ui/chart';
import { ChartContainer } from '~/components/ui/chart';
import { cn } from '~/utils/cn';
import { dayjs } from '~/utils/Dayjs';

export function UsageText({
  usage,
  maxUsage,
  endDate,
}: {
  usage: number;
  maxUsage: number;
  endDate: string | null;
}) {
  return (
    <p className={cn('text-xs flex gap-1 items-center')}>
      <span className="text-foreground">
        {usage}/{maxUsage}
      </span>

      {endDate ? (
        <span className="text-muted-foreground italic">
          (resets {dayjs(endDate).format('DD MMMM')})
        </span>
      ) : null}
    </p>
  );
}

function UsageBar({ usagePercentage }: { usagePercentage: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={usagePercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Usage progress"
      className="w-full bg-muted rounded-full h-1.5"
    >
      <div
        className="bg-primary h-1.5 rounded-full"
        style={{ width: `${usagePercentage}%` }}
      />
    </div>
  );
}

export function UsageProgress({
  usage,
  maxUsage,
  endDate,
}: {
  usage: number;
  maxUsage: number;
  endDate: string | null;
}) {
  const usagePercentage = (usage / maxUsage) * 100;

  return (
    <div>
      <div className="flex justify-between gap-2 mb-1">
        <p className="text-sm text-muted-foreground">Usage</p>
        <UsageText usage={usage} maxUsage={maxUsage} endDate={endDate} />
      </div>

      <UsageBar usagePercentage={usagePercentage} />
    </div>
  );
}
export function UsageCircleProgress({
  usage,
  maxUsage,
}: {
  usage: number;
  maxUsage: number;
}) {
  const usagePercentage = (usage / maxUsage) * 100;

  const chartData = [{ usage, fill: 'var(--color-usage)', usagePercentage }];
  const chartConfig = {
    usage: {
      label: 'Usage',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-[36px] w-[36px]">
      <RadialBarChart
        data={chartData}
        startAngle={0}
        endAngle={usagePercentage * 3.6}
        innerRadius={15}
        outerRadius={21}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-background"
          polarRadius={[16, 14]}
        />
        <RadialBar dataKey="usage" background cornerRadius={10} />

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
                      className="fill-foreground text-[9px] font-bold"
                    >
                      {chartData[0].usagePercentage.toFixed(0)}%
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}
