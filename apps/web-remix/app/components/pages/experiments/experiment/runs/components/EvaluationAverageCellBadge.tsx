import type { ReactNode } from 'react';
import React from 'react';
import type { CellContext } from '@tanstack/react-table';

import { CellText } from '~/components/table/table.components';
import { Badge } from '~/components/ui/badge';

export const EvaluationAverageCellBadge = <TData, TValue>(
  info: CellContext<TData, TValue>,
) => {
  const value = info.getValue();

  if (typeof value === 'number') {
    return (
      <Badge
        variant={value < 25 ? 'error' : value >= 75 ? 'success' : 'warning'}
      >
        {value.toFixed(2)}%
      </Badge>
    );
  }

  return <CellText>{info.getValue() as ReactNode}</CellText>;
};
