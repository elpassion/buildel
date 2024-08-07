import React from 'react';

import type { DatepickerProps } from '~/components/datepicker/Datepicker';
import { Datepicker } from '~/components/datepicker/Datepicker';

import './datepicker.styles.css';

import { cn } from '~/utils/cn';

export type DatepickerInputProps = DatepickerProps;

export const DatepickerInputFallback = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'w-full bg-white rounded-lg h-[42px] border border-input relative',
        className,
      )}
    >
      <div className="w-[80%] h-[60%] bg-muted rounded absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 animate-pulse" />
    </div>
  );
};

export const DatepickerInput: React.FC<DatepickerInputProps> = (props) => {
  return (
    <Datepicker
      fallback={<DatepickerInputFallback />}
      showPopperArrow={false}
      {...props}
    />
  );
};
