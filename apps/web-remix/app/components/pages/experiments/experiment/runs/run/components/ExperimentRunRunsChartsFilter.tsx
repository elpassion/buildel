import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, SquareKanban } from 'lucide-react';

import {
  MenuDropdown,
  MenuDropdownContent,
  MenuDropdownItem,
  MenuDropdownTrigger,
} from '~/components/dropdown/MenuDropdown';
import { EmptyMessage } from '~/components/list/ItemList';
import { cn } from '~/utils/cn';

type ChartData<T> = Record<string, T>;

interface ExperimentRunRunsChartsFilterProps<T> {
  data: ChartData<T>;
  children: (
    charts: {
      data: T;
      column: string;
    }[],
  ) => React.ReactNode;
}

export const ExperimentRunRunsChartsFilter = <T = number,>({
  children,
  data,
}: ExperimentRunRunsChartsFilterProps<T>) => {
  const charts = useMemo(() => {
    return Object.entries(data).map(([column, value]) => ({
      id: column,
      column: column,
      data: value,
    }));
  }, [data]);

  const [activeCharts, setActiveCharts] = useState<string[]>(
    charts.slice(0, 2).map((chart) => chart.id),
  );

  const isActive = (id: string) => {
    return activeCharts.includes(id);
  };

  const onCheckedChange = (id: string) => {
    setActiveCharts((prev) => {
      const checked = prev.includes(id);
      if (checked) {
        return prev.filter((chartId) => chartId !== id);
      }

      return [...prev, id];
    });
  };

  const hasCharts = charts.length > 0;

  return (
    <>
      <MenuDropdown placement="bottom-start">
        <MenuDropdownTrigger
          variant="outline"
          className="flex gap-3 items-center"
        >
          <div className="flex gap-1 items-center">
            <SquareKanban className="w-3.5 h-3.5" />
            <span>Charts</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5" />
        </MenuDropdownTrigger>

        <MenuDropdownContent>
          {!hasCharts && (
            <EmptyMessage className="px-2">No charts available</EmptyMessage>
          )}

          {charts.map((chart) => (
            <MenuDropdownItem
              key={chart.id}
              className="flex items-center"
              onClick={() => onCheckedChange(chart.id)}
            >
              <div className="w-4 h-4">
                <Check
                  className={cn('w-4 h-4', { hidden: !isActive(chart.id) })}
                />
              </div>

              <span>{chart.column}</span>
            </MenuDropdownItem>
          ))}
        </MenuDropdownContent>
      </MenuDropdown>

      {children(charts.filter((chart) => isActive(chart.id)))}
    </>
  );
};
