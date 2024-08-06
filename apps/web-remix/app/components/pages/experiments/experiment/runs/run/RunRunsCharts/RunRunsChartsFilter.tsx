import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, SquareKanban } from 'lucide-react';

import {
  MenuDropdown,
  MenuDropdownContent,
  MenuDropdownItem,
  MenuDropdownTrigger,
} from '~/components/dropdown/MenuDropdown';
import type { IExperimentRunRun } from '~/components/pages/experiments/experiments.types';
import { cn } from '~/utils/cn';
import { isNotNil } from '~/utils/guards';

interface RunRunsChartsFilterProps {
  data: IExperimentRunRun[];
  columns: (keyof IExperimentRunRun['data'])[];
  children: (
    charts: {
      data: IExperimentRunRun[];
      column: keyof IExperimentRunRun['data'];
    }[],
  ) => React.ReactNode;
}

export const RunRunsChartsFilter = ({
  children,
  data,
  columns,
}: RunRunsChartsFilterProps) => {
  const numericCharts = useMemo(() => {
    return columns
      .map((column, index) => {
        if (!isNumeric(data[0]?.data?.[column])) return null;

        return { id: `${column}-${index}`, column, data };
      })
      .filter(isNotNil);
  }, [data, columns]);

  const [activeCharts, setActiveCharts] = useState<string[]>([]);

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

  return (
    <div className="w-full">
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
          {numericCharts.map((chart) => (
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

      {children(numericCharts.filter((chart) => isActive(chart.id)))}
    </div>
  );
};

function isNumeric(value: any) {
  return !isNaN(parseFloat(value));
}
