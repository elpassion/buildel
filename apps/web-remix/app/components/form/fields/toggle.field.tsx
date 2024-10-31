import React from 'react';
import { useControlField } from 'remix-validated-form';

import { useFieldContext } from '~/components/form/fields/field.context';
import type { ToggleInputProps } from '~/components/form/inputs/toggle.input';
import { ToggleInput } from '~/components/form/inputs/toggle.input';

export const ToggleInputField = ({
  ...props
}: Partial<ToggleInputProps> & {
  ref?: React.RefObject<HTMLButtonElement>;
}) => {
  const { name } = useFieldContext();
  const [value, setValue] = useControlField<boolean | undefined>(name);
  const currentVal = value ?? false;
  return (
    <ToggleInput
      name={name}
      onCheckedChange={setValue}
      checked={currentVal}
      value={currentVal.toString()}
      {...props}
    />
  );
};
ToggleInputField.displayName = 'ToggleInputField';
