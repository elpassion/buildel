import React from 'react';
import type { CellContext } from '@tanstack/react-table';

import { Badge } from '~/components/ui/badge';

export const EvaluationAverageCellBadge = <TData, TValue>(
  info: CellContext<TData, TValue>,
) => {
  const value = info.getValue();

  if (!value) return '';

  if (typeof value === 'number')
    return (
      <Badge
        variant={value < 25 ? 'error' : value >= 75 ? 'success' : 'warning'}
      >
        {value}%
      </Badge>
    );

  return info.getValue();
};
