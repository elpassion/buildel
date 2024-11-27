import React from 'react';

import { useFieldContext } from '~/components/form/fields/field.context';
import { useControlField } from '~/components/form/fields/form.field';
import type { DatepickerInputProps } from '~/components/form/inputs/datepicker.input';
import { DatepickerInput } from '~/components/form/inputs/datepicker.input';

export const DatepickerField: React.FC<
  Omit<DatepickerInputProps, 'onChange' | 'selected'>
> = (props) => {
  const { name } = useFieldContext();
  const [value, setValue] = useControlField<Date | undefined>(name);

  const handleOnChange = (date: Date | null) => {
    setValue(date ?? undefined);
  };

  return (
    <DatepickerInput onChange={handleOnChange} selected={value} {...props} />
  );
};
